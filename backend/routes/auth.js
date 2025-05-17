const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const supabase = require('../supabase/supabaseClient');
const nodemailer = require('nodemailer');

const OTP_EXPIRY_MINUTES = 5;

// Nodemailer transporter setup using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // your gmail address
    pass: process.env.EMAIL_APP_PASS    // your app password
  }
});

// Helper to send OTP email
async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is: ${otp}`
  };
  await transporter.sendMail(mailOptions);
}

// Helper function to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /send-otp - send OTP email
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const otp = generateOtp();
    const expiration = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    // Store OTP in Sessions table
    const { error } = await supabase
      .from('sessions')
      .insert([{ email, otp_code: otp, expiration_time: expiration.toISOString(), status: 'active' }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error in send-otp:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /verify-otp - verify OTP and generate JWT
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('status', 'active')
      .order('expiration_time', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase select error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const session = data[0];
    const now = new Date();

    if (new Date(session.expiration_time) < now) {
      // Expired OTP - update status
      await supabase
        .from('sessions')
        .update({ status: 'expired' })
        .eq('id', session.id);

      return res.status(400).json({ error: 'OTP expired' });
    }

    // Mark OTP as used (expired)
    await supabase
      .from('sessions')
      .update({ status: 'expired' })
      .eq('id', session.id);

    // Upsert user record
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({ email, last_login: new Date().toISOString() }, { onConflict: 'email' });

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Generate JWT token valid for 1 hour
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error in verify-otp:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
