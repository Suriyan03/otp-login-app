import { useState } from 'react';
import axios from 'axios';

const VerifyOtpForm = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/verify-otp', {
        email,
        otp,
      });

      localStorage.setItem('token', response.data.token);
      onSuccess(); // reloads app
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <h2>Enter OTP for {email}</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      <button type="submit">Verify OTP</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default VerifyOtpForm;
