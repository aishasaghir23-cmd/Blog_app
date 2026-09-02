import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/register' : '/api/login';
    const payload = isRegister ? { name, email, password } : { email, password };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data);
      navigate('/');
    } else {
      alert('Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-avatar">C</div>
      <h2>ChatApp Login</h2>
      <p style={{ color: '#667781', fontSize: '13px', marginBottom: '15px' }}>
        {isRegister ? 'Create an account to start chatting' : 'Login to start chatting'}
      </p>
      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && (
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="auth-btn">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p className="auth-toggle" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'No account? Register'}
      </p>
    </div>
  );
};

export default Login;
