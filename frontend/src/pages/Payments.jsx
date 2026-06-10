import React from 'react';
import { useNavigate } from 'react-router-dom';

const Payments = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{paddingTop: '6rem', maxWidth: '600px', paddingBottom: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button onClick={() => navigate('/profile')} className="btn" style={{padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)'}}>
          ← Back
        </button>
        <h2 style={{margin: 0}}>Payments & Wallets</h2>
      </div>

      <div className="glass" style={{padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '2rem'}}>
        <p style={{color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Campus Wallet Balance</p>
        <h1 style={{fontSize: '3rem', margin: 0, color: 'var(--accent-primary)'}}>₹240.50</h1>
        <button className="btn btn-primary" style={{marginTop: '1.5rem', padding: '0.8rem 2rem', borderRadius: '999px'}}>
          + Add Money
        </button>
      </div>

      <h3 style={{marginBottom: '1rem'}}>Payment Methods</h3>
      <div className="glass" style={{borderRadius: 'var(--radius-lg)', overflow: 'hidden'}}>
        {[
          { icon: '📱', name: 'Google Pay (UPI)', detail: 'campusride@upi' },
          { icon: '💳', name: 'HDFC Credit Card', detail: '**** **** **** 1234' },
          { icon: '💵', name: 'Cash', detail: 'Pay directly to driver' }
        ].map((method, idx) => (
          <div key={idx} style={{
            padding: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            borderBottom: idx < 2 ? '1px solid var(--border-color)' : 'none'
          }}>
            <div style={{fontSize: '1.5rem'}}>{method.icon}</div>
            <div>
              <p style={{margin: 0, fontWeight: 'bold'}}>{method.name}</p>
              <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{method.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payments;
