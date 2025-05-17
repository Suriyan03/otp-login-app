import { useEffect, useState } from 'react';
import OtpLogin from './components/OtpLogin';
import Dashboard from './components/Dashboard';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setToken(stored);
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      {token ? <Dashboard /> : <OtpLogin />}
    </div>
  );
};

export default App;
