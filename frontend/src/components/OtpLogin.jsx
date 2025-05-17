import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function OtpLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const inputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/api/auth/send-otp', { email });
      setMessage(res.data.message);
      setStep('otp');
      setResendTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setError('Please enter the full OTP');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post('/api/auth/verify-otp', { email, otp: otpCode });
      setMessage(res.data.message);
      setStep('success');
      localStorage.setItem('token', res.data.token); // Save token on success
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = () => {
    if (resendTimer === 0) sendOtp();
  };

  // ---------------------- STYLES ----------------------
  const styles = {
    container: {
      maxWidth: '400px',
      margin: '0 auto',
      padding: '2rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      fontSize: '1rem',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '1rem',
    },
    verifyButton: {
      backgroundColor: '#28a745',
    },
    resendButton: {
      backgroundColor: '#ffc107',
    },
    changeEmailButton: {
      backgroundColor: '#6c757d',
    },
    otpGroup: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    otpBox: {
      width: '40px',
      height: '40px',
      fontSize: '1.25rem',
      textAlign: 'center',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    message: {
      marginTop: '1rem',
      color: '#155724',
    },
    error: {
      color: '#721c24',
    },
  };

  // ---------------------- JSX ----------------------
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Login with OTP</h1>

      {step === 'email' && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            style={styles.input}
          />
          <button
            onClick={sendOtp}
            disabled={loading || !email}
            style={styles.button}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <p style={{ marginBottom: '1rem' }}>
            Enter the 6-digit OTP sent to <strong>{email}</strong>
          </p>
          <div style={styles.otpGroup}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => (inputsRef.current[i] = el)}
                type="text"
                maxLength={1}
                style={styles.otpBox}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                inputMode="numeric"
              />
            ))}
          </div>
          <button
            onClick={verifyOtp}
            disabled={loading}
            style={{ ...styles.button, ...styles.verifyButton }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            onClick={resendOtp}
            disabled={resendTimer > 0 || loading}
            style={{ ...styles.button, ...styles.resendButton }}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </button>
          <button
            onClick={() => setStep('email')}
            disabled={loading}
            style={{ ...styles.button, ...styles.changeEmailButton }}
          >
            Change Email
          </button>
        </>
      )}

      {step === 'success' && (
        <>
          <h2 style={{ color: '#28a745' }}>Login Successful!</h2>
          <p>You are now logged in as <strong>{email}</strong>.</p>
        </>
      )}

      {(error || message) && (
        <p style={error ? styles.error : styles.message}>
          {error || message}
        </p>
      )}
    </div>
  );
}
