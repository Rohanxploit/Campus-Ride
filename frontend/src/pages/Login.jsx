import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{maxWidth: '400px', margin: '4rem auto'}} className="glass">
      <div style={{padding: '2rem'}}>
        <h2 style={{textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem'}}>Welcome Back</h2>
        {error && <div style={{backgroundColor: 'var(--accent-danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem'}}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={onChange} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={onChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
            Log In
          </button>
        </form>
        <p style={{marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--accent-primary)', textDecoration: 'none'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
