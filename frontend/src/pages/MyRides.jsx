import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyRides = () => {
  const { user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5000/api/rides/history`);
        setRides(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="container" style={{paddingTop: '6rem', maxWidth: '800px', paddingBottom: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button onClick={() => navigate('/profile')} className="btn" style={{padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)'}}>
          ← Back
        </button>
        <h2 style={{margin: 0}}>Ride History</h2>
      </div>

      {loading ? (
        <p>Loading your past rides...</p>
      ) : rides.length === 0 ? (
        <div className="glass" style={{padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)'}}>
          <p style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>You haven't taken any rides yet!</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {rides.map(ride => (
            <div key={ride.id} className="glass" style={{padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    backgroundColor: ride.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: ride.status === 'COMPLETED' ? 'var(--accent-success)' : 'var(--accent-danger)',
                    marginBottom: '0.5rem'
                  }}>
                    {ride.status}
                  </span>
                  <p style={{margin: 0, fontWeight: 'bold'}}>{new Date(ride.createdAt).toLocaleString()}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{margin: 0, fontWeight: 'bold', fontSize: '1.2rem'}}>₹{ride.fare}</p>
                </div>
              </div>
              
              <div style={{marginTop: '0.5rem'}}>
                <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>From: {ride.pickupAddress}</p>
                <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>To: {ride.destAddress}</p>
              </div>

              <div style={{marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)'}}>
                <p style={{margin: 0, fontSize: '0.9rem'}}>
                  {user?.role === 'PASSENGER' 
                    ? `Driver: ${ride.driver?.name || 'Unknown'}`
                    : `Passenger: ${ride.passenger?.name || 'Unknown'}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides;
