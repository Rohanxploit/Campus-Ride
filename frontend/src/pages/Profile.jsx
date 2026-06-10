import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    upiId: '',
    gender: '',
    profilePhoto: '',
    rating: 5.0,
    nationalId: '',
    driverLicense: '',
    bankAccount: '',
    vehicle: {
      type: 'E-Rickshaw',
      model: '',
      licensePlate: '',
      rcNumber: '',
      color: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5000/api/users/profile`);
        setProfile({
          name: res.data.name || '',
          phone: res.data.phone || '',
          upiId: res.data.upiId || '',
          gender: res.data.gender || '',
          profilePhoto: res.data.profilePhoto || '',
          rating: res.data.rating || 5.0,
          nationalId: res.data.nationalId || '',
          driverLicense: res.data.driverLicense || '',
          bankAccount: res.data.bankAccount || '',
          vehicle: res.data.vehicle || { type: 'E-Rickshaw', model: '', licensePlate: '', rcNumber: '', color: '' }
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
      const res = await axios.put(`http://${window.location.hostname}:5000/api/users/profile`, profile);
      setMessage('Profile updated successfully!');
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
    <div className="container" style={{paddingTop: '5rem', maxWidth: '600px', paddingBottom: '2rem'}}>
      
      {/* Profile Header Hub */}
      <div className="glass" style={{padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '2rem'}}>
        <div style={{
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-secondary)', 
          margin: '0 auto 1rem',
          overflow: 'hidden',
          border: '3px solid var(--accent-primary)',
          boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
        }}>
          <img 
            src={profile.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff&size=100`} 
            alt="Profile" 
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </div>
        <h2 style={{margin: '0 0 0.2rem 0'}}>{profile.name}</h2>
        <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem'}}>
          <span>{profile.phone || 'No phone added'}</span>
          <span>•</span>
          <span style={{color: '#fbbf24', fontWeight: 'bold'}}>⭐ {profile.rating} Rating</span>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="glass" style={{padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Account Details</h3>
        
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
            <label>Profile Photo URL</label>
            <input type="text" name="profilePhoto" value={profile.profilePhoto} onChange={handleChange} placeholder="Paste an image URL (optional)" />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="input-group" style={{flex: 1}}>
              <label>Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} required />
            </div>
            <div className="input-group" style={{flex: 1}}>
              <label>Gender</label>
              <select name="gender" value={profile.gender} onChange={handleChange} style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)'
              }}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={profile.phone} onChange={handleChange} placeholder="e.g. +91 9876543210" required />
          </div>

          {user?.role === 'DRIVER' && (
            <>
              <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Driver Verification (KYC)</h3>
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="input-group" style={{flex: 1}}>
                  <label>National ID / Aadhaar</label>
                  <input type="text" name="nationalId" value={profile.nationalId || ''} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" />
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label>Driver License</label>
                  <input type="text" name="driverLicense" value={profile.driverLicense || ''} onChange={handleChange} placeholder="DL-14-2023..." />
                </div>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="input-group" style={{flex: 1}}>
                  <label>Bank Account Number</label>
                  <input type="text" name="bankAccount" value={profile.bankAccount || ''} onChange={handleChange} placeholder="Account for Payouts" />
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label>UPI ID</label>
                  <input type="text" name="upiId" value={profile.upiId} onChange={handleChange} placeholder="e.g. driver@upi" required />
                </div>
              </div>

              <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: '#10b981', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Vehicle Details</h3>
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="input-group" style={{flex: 1}}>
                  <label>Vehicle Type</label>
                  <select name="vehicle.type" value={profile.vehicle.type || 'E-Rickshaw'} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)'}}>
                    <option value="E-Rickshaw">E-Rickshaw</option>
                    <option value="Auto Rickshaw">Auto Rickshaw</option>
                    <option value="Cab / Sedan">Cab / Sedan</option>
                  </select>
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label>Vehicle Model</label>
                  <input type="text" name="vehicle.model" value={profile.vehicle.model} onChange={handleChange} placeholder="e.g. Mahindra Treo" required />
                </div>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="input-group" style={{flex: 1}}>
                  <label>Registration Number (RC)</label>
                  <input type="text" name="vehicle.rcNumber" value={profile.vehicle.rcNumber || ''} onChange={handleChange} placeholder="RC Number" />
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label>License Plate</label>
                  <input type="text" name="vehicle.licensePlate" value={profile.vehicle.licensePlate} onChange={handleChange} placeholder="e.g. UK08 AB 1234" required />
                </div>
              </div>
              <div className="input-group">
                <label>Color</label>
                <input type="text" name="vehicle.color" value={profile.vehicle.color} onChange={handleChange} placeholder="e.g. Black" required />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem'}}>
            Save Profile
          </button>
        </form>
      </div>

      {/* App Menu Dashboard */}
      <div className="glass" style={{borderRadius: 'var(--radius-lg)', overflow: 'hidden'}}>
        {[
          { icon: '🚗', label: 'My Rides', path: '/history' },
          { icon: '💳', label: 'Payments & Wallets', path: '/payments' },
          { icon: '⚙️', label: 'Settings', path: '/settings' },
          { icon: '❓', label: 'Help & Support', path: '/help' }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => item.path ? navigate(item.path) : alert(`${item.label} page is coming soon!`)}
            style={{
              padding: '1.2rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: idx < 3 ? '1px solid var(--border-color)' : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem'}}>
              <span>{item.icon}</span>
              <span style={{fontWeight: '500'}}>{item.label}</span>
            </div>
            <span style={{color: 'var(--text-secondary)'}}>›</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Profile;
