import React, { useState } from 'react';
import { sendOtp, verifyOtp } from '../api';
import './LoginForm.css'; // <- add this line

function LoginForm() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('email');

  const handleSendOtp = async () => {
    setMessage('');
    try {
      const res = await sendOtp(email);
      setMessage(res.message);
      if (res.message === 'OTP sent successfully') {
        setOtpSent(true);
        setStep('otp');
      }
    } catch (error) {
      setMessage('Error sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    const response = await verifyOtp(email, otp);
    if (response.token) {
      localStorage.setItem('token', response.token);
      alert('Login successful!');
      setStep('loggedIn');
    } else {
      alert(response.error || 'Invalid OTP');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setEmail('');
    setOtp('');
    setOtpSent(false);
    setStep('email');
  };

  return (
    <div className="login-container">
      {step === 'email' && (
        <>
          <h2 className="login-header">Login</h2>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <button
            onClick={handleSendOtp}
            className="login-button"
            disabled={!email}
          >
            Send OTP
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <h2 className="login-header">Enter OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="login-input"
          />
          <button
            onClick={handleVerifyOtp}
            className="login-button"
            disabled={!otp}
          >
            Verify OTP
          </button>
        </>
      )}

      {step === 'loggedIn' && (
        <>
          <h2 className="login-header">Welcome!</h2>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
            You are logged in as: <strong>{email}</strong>
          </p>
          <button onClick={handleLogout} className="login-button">
            Logout
          </button>
        </>
      )}

      {message && (
        <p className={`login-message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default LoginForm;
