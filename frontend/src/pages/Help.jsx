import React from 'react';
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{paddingTop: '6rem', maxWidth: '600px', paddingBottom: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button onClick={() => navigate('/profile')} className="btn" style={{padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)'}}>
          ← Back
        </button>
        <h2 style={{margin: 0}}>Help & Support</h2>
      </div>

      <div className="glass" style={{padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '2rem'}}>
        <h1 style={{fontSize: '3rem', margin: 0}}>🎧</h1>
        <h3 style={{marginTop: '1rem'}}>How can we help you?</h3>
        <p style={{color: 'var(--text-secondary)'}}>Our campus support team is available 24/7</p>
      </div>

      <h3 style={{marginBottom: '1rem'}}>Frequently Asked Questions</h3>
      <div className="glass" style={{borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2rem'}}>
        {[
          { q: 'How do I report a lost item?', a: 'Contact the driver immediately through the app, or reach out to Campus Security at Century Gate.' },
          { q: 'Can I pay with cash?', a: 'Yes! You can choose the cash option at the end of the ride and pay the driver directly.' },
          { q: 'Is the OTP mandatory?', a: 'Yes, the 4-digit PIN ensures you are getting into the correct e-rickshaw.' }
        ].map((item, idx) => (
          <div key={idx} style={{
            padding: '1.5rem', 
            borderBottom: idx < 2 ? '1px solid var(--border-color)' : 'none'
          }}>
            <p style={{margin: '0 0 0.5rem 0', fontWeight: 'bold'}}>{item.q}</p>
            <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{item.a}</p>
          </div>
        ))}
      </div>
      
      <button className="btn btn-danger" style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}>
        Emergency Help (Call Security)
      </button>
    </div>
  );
};

export default Help;
