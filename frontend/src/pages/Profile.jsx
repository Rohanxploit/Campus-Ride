import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const Profile = () => {
  const { user, login } = useContext(AuthContext); // use login to update context user
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    upiId: '',
    vehicle: {
      model: '',
      licensePlate: '',
      color: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile');
        setProfile({
          name: res.data.name || '',
          phone: res.data.phone || '',
          upiId: res.data.upiId || '',
          vehicle: res.data.vehicle || { model: '', licensePlate: '', color: '' }
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicle.')) {
      const vField = name.split('.')[1];
      setProfile(prev => ({ ...prev, vehicle: { ...prev.vehicle, [vField]: value } }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.put('http://localhost:5000/api/users/profile', profile);
      setMessage('Profile updated successfully!');
      // Update local storage user data to keep it in sync
      const currentToken = localStorage.getItem('token');
      login(currentToken, res.data);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile.');
      console.error(error);
    }
  };

  if (loading) return <div className="container" style={{paddingTop: '6rem'}}>Loading profile...</div>;

  return (
    <div className="container" style={{paddingTop: '6rem', maxWidth: '600px'}}>
      <div className="glass" style={{padding: '2rem', borderRadius: 'var(--radius-lg)'}}>
        <h2 style={{marginBottom: '1.5rem', textAlign: 'center'}}>Manage Profile</h2>
        
        {message && (
          <div style={{
            padding: '1rem', 
            marginBottom: '1.5rem', 
            backgroundColor: message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: message.includes('success') ? 'var(--accent-success)' : 'var(--accent-danger)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" value={profile.name} onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={profile.phone} onChange={handleChange} placeholder="e.g. +91 9876543210" required />
          </div>

          {user?.role === 'DRIVER' && (
            <>
              <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)'}}>Vehicle Details</h3>
              <div className="input-group">
                <label>Vehicle Model</label>
                <input type="text" name="vehicle.model" value={profile.vehicle.model} onChange={handleChange} placeholder="e.g. Honda Activa" required />
              </div>
              <div className="input-group">
                <label>License Plate</label>
                <input type="text" name="vehicle.licensePlate" value={profile.vehicle.licensePlate} onChange={handleChange} placeholder="e.g. UK08 AB 1234" required />
              </div>
              <div className="input-group">
                <label>Color</label>
                <input type="text" name="vehicle.color" value={profile.vehicle.color} onChange={handleChange} placeholder="e.g. Black" required />
              </div>
              <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)'}}>Payment Details</h3>
              <div className="input-group">
                <label>UPI ID / Bank Account Details</label>
                <input type="text" name="upiId" value={profile.upiId} onChange={handleChange} placeholder="e.g. driver@upi or Account No." required />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem'}}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
