import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{paddingTop: '6rem', maxWidth: '600px', paddingBottom: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button onClick={() => navigate('/profile')} className="btn" style={{padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)'}}>
          ← Back
        </button>
        <h2 style={{margin: 0}}>App Settings</h2>
      </div>

      <div className="glass" style={{borderRadius: 'var(--radius-lg)', overflow: 'hidden'}}>
        {[
          { icon: '🌙', name: 'Dark Mode', description: 'Currently active globally' },
          { icon: '🔔', name: 'Push Notifications', description: 'Receive ride alerts and OTPs' },
          { icon: '📍', name: 'Location Services', description: 'Always on during active rides' },
          { icon: '🌐', name: 'Language', description: 'English (US)' },
        ].map((item, idx) => (
          <div key={idx} style={{
            padding: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: idx < 3 ? '1px solid var(--border-color)' : 'none'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{fontSize: '1.5rem'}}>{item.icon}</div>
              <div>
                <p style={{margin: 0, fontWeight: 'bold'}}>{item.name}</p>
                <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{item.description}</p>
              </div>
            </div>
            {idx < 3 && (
              <div style={{width: '40px', height: '24px', backgroundColor: 'var(--accent-primary)', borderRadius: '999px', position: 'relative'}}>
                <div style={{width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px'}}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
