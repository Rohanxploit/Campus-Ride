import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PASSENGER',
    phone: '',
    vehicleModel: '',
    licensePlate: '',
    color: ''
  });
  const [error, setError] = useState('');

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone
      };

      if (formData.role === 'DRIVER') {
        payload.vehicle = {
          model: formData.vehicleModel,
          licensePlate: formData.licensePlate,
          color: formData.color
        };
      }

      await register(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{maxWidth: '500px', margin: '2rem auto'}} className="glass">
      <div style={{padding: '2rem'}}>
        <h2 style={{textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem'}}>Create an Account</h2>
        {error && <div style={{backgroundColor: 'var(--accent-danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem'}}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} required />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={onChange} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={onChange} required />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={onChange} required />
          </div>
          <div className="input-group">
            <label>I am a...</label>
            <select name="role" value={formData.role} onChange={onChange}>
              <option value="PASSENGER">Passenger</option>
              <option value="DRIVER">Driver</option>
            </select>
          </div>

          {formData.role === 'DRIVER' && (
            <div style={{padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem'}}>
              <h4 style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Vehicle Details</h4>
              <div className="input-group">
                <label>Vehicle Model</label>
                <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={onChange} required={formData.role === 'DRIVER'} />
              </div>
              <div className="input-group">
                <label>License Plate</label>
                <input type="text" name="licensePlate" value={formData.licensePlate} onChange={onChange} required={formData.role === 'DRIVER'} />
              </div>
              <div className="input-group">
                <label>Vehicle Color</label>
                <input type="text" name="color" value={formData.color} onChange={onChange} required={formData.role === 'DRIVER'} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
            Sign Up
          </button>
        </form>
        <p style={{marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--accent-primary)', textDecoration: 'none'}}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
