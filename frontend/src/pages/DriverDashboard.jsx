import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function RecenterAutomatically({lat, lng}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

// Custom icons for driver and ride markers
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.DivIcon({
  className: 'driver-dot',
  html: '<div style="width: 15px; height: 15px; background-color: #10b981; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);"></div>',
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5]
});

const passengerIcon = new L.DivIcon({
  className: 'passenger-dot',
  html: '<div style="width: 15px; height: 15px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>',
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5]
});

const center = {
  lat: 29.864, // IIT Roorkee
  lng: 77.896
};

const DriverDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [activeRide, setActiveRide] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Start tracking driver live location
    let geoId;
    if ('geolocation' in navigator) {
      geoId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setDriverLocation({ lat, lng });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }

    const fetchData = async () => {
      try {
        const rideRes = await axios.get('http://localhost:5000/api/rides/active');
        setActiveRide(rideRes.data);
        
        const historyRes = await axios.get('http://localhost:5000/api/rides/history');
        setHistory(historyRes.data);

        const profileRes = await axios.get('http://localhost:5000/api/users/profile');
        setProfile(profileRes.data);

        if (user?.isOnline) {
          const reqRes = await axios.get('http://localhost:5000/api/rides/requests');
          setIncomingRequests(reqRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

    if (socket) {
      socket.on('incoming_ride_request', (ride) => {
        setIncomingRequests(prev => [...prev, ride]);
      });
      socket.on('ride_status_updated', (ride) => {
        setActiveRide(ride);
        if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
          setTimeout(() => setActiveRide(null), 3000);
        }
      });
      socket.on('ride_cancelled_by_passenger', (data) => {
        setIncomingRequests(prev => prev.filter(r => r.id !== data.rideId));
      });
      socket.on('passenger_location_update', (data) => {
        if (activeRide && activeRide.id === data.rideId) {
          setPassengerLocation({ lat: data.lat, lng: data.lng });
        }
      });
      socket.on('ride_already_taken', (data) => {
        setIncomingRequests(prev => prev.filter(r => r.id !== data.rideId));
        alert("This ride was already accepted by another driver!");
      });
    }

    return () => {
      if (socket) {
        socket.off('incoming_ride_request');
        socket.off('ride_status_updated');
        socket.off('ride_cancelled_by_passenger');
        socket.off('passenger_location_update');
        socket.off('ride_already_taken');
      }
      if (geoId) navigator.geolocation.clearWatch(geoId);
    };
  }, [socket, user, activeRide]);

  // Emit driver location periodically
  useEffect(() => {
    if (socket && isOnline && driverLocation) {
      socket.emit('update_driver_location', { lat: driverLocation.lat, lng: driverLocation.lng });
    }
  }, [driverLocation, isOnline, socket]);

  const toggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await axios.put('http://localhost:5000/api/rides/availability', {
        isOnline: newStatus,
        lat: 29.864 + (Math.random() - 0.5) * 0.01,
        lng: 77.896 + (Math.random() - 0.5) * 0.01
      });
      setIsOnline(newStatus);
      
      if (newStatus) {
        const reqRes = await axios.get('http://localhost:5000/api/rides/requests');
        setIncomingRequests(reqRes.data);
      } else {
        setIncomingRequests([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRide = (rideId) => {
    if (socket) {
      socket.emit('accept_ride', { rideId });
      setIncomingRequests(prev => prev.filter(r => r.id !== rideId));
      // Active ride will update via fetch or socket update shortly
      setTimeout(async () => {
        const rideRes = await axios.get('http://localhost:5000/api/rides/active');
        setActiveRide(rideRes.data);
      }, 500);
    }
  };

  const rejectRequest = (rideId) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== rideId));
  };

  const updateRideStatus = (status) => {
    if (socket && activeRide) {
      socket.emit('update_ride_status', { rideId: activeRide.id, status });
    }
  };

  return (
    <>
      <div className="full-screen-map">
        <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
          {driverLocation && <RecenterAutomatically lat={driverLocation.lat} lng={driverLocation.lng} />}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution="&copy; Google Maps"
          />

          {/* Driver Live Location */}
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Passenger Live Location */}
          {activeRide && passengerLocation && (
            <Marker position={[passengerLocation.lat, passengerLocation.lng]} icon={passengerIcon}>
              <Popup>Passenger Location</Popup>
            </Marker>
          )}
          
          {/* Active Ride Markers */}
          {activeRide && (
            <>
              <Marker position={[activeRide.pickupLat, activeRide.pickupLng]} icon={pickupIcon}>
                <Popup>Pickup: {activeRide.pickupAddress}</Popup>
              </Marker>
              <Marker position={[activeRide.destLat, activeRide.destLng]} icon={destIcon}>
                <Popup>Destination: {activeRide.destAddress}</Popup>
              </Marker>
            </>
          )}

          {/* Incoming Request Markers */}
          {!activeRide && incomingRequests.map(req => (
            <Marker key={req.id} position={[req.pickupLat, req.pickupLng]} icon={pickupIcon}>
              <Popup>Request from: {req.passenger.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="top-pill">
        <div style={{
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          backgroundColor: isOnline ? 'var(--accent-success)' : 'var(--text-secondary)'
        }}></div>
        <span style={{color: isOnline ? 'var(--text-primary)' : 'var(--text-secondary)'}}>
          {isOnline ? 'You\'re Online' : 'You\'re Offline'}
        </span>
        <button 
          onClick={toggleOnline} 
          className="btn" 
          style={{
            padding: '0.25rem 0.75rem', 
            marginLeft: '0.5rem', 
            backgroundColor: isOnline ? 'var(--bg-secondary)' : 'var(--accent-primary)',
            color: 'white'
          }}>
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {isOnline && !activeRide && incomingRequests.length > 0 && (
        <div className="floating-card" style={{bottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem', textAlign: 'center'}}>New Ride Request</h3>
          
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
            <div className="glass" style={{flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
              <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Today's Rides</p>
              <h3 style={{margin: '0.5rem 0 0 0', fontSize: '1.5rem'}}>{history.filter(h => h.status === 'COMPLETED').length}</h3>
            </div>
            <div className="glass" style={{flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
              <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Rating</p>
              <h3 style={{margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: '#f59e0b'}}>
                {profile?.ratingsReceived?.length > 0 
                  ? (profile.ratingsReceived.reduce((a,b)=>a+b.score,0)/profile.ratingsReceived.length).toFixed(1) 
                  : 'N/A'}★
              </h3>
            </div>
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '0.5rem'}}>
              <div style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-success)', marginTop: '0.4rem'}}></div>
              <p style={{margin: 0, color: 'var(--text-primary)'}}>{incomingRequests[0].pickupAddress}</p>
            </div>
            <div style={{borderLeft: '2px dashed var(--border-color)', height: '20px', marginLeft: '4px', marginBottom: '0.5rem'}}></div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{width: '10px', height: '10px', backgroundColor: 'var(--accent-danger)', marginTop: '0.4rem'}}></div>
              <p style={{margin: 0, color: 'var(--text-primary)'}}>{incomingRequests[0].destAddress}</p>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <span style={{color: 'var(--text-secondary)'}}>Passenger</span>
            <span style={{fontWeight: 'bold'}}>{incomingRequests[0].passenger.name}</span>
          </div>
          
          <div style={{display: 'flex', gap: '1rem'}}>
            <button onClick={() => rejectRequest(incomingRequests[0].id)} className="btn btn-danger" style={{flex: 1, padding: '1rem', fontSize: '1rem'}}>
              Reject
            </button>
            <button onClick={() => acceptRide(incomingRequests[0].id)} className="btn btn-primary" style={{flex: 2, padding: '1rem', fontSize: '1.1rem'}}>
              Accept Request
            </button>
          </div>
        </div>
      )}

      {activeRide && (
        <div className="bottom-sheet">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.5rem', margin: 0}}>
              {activeRide.status === 'ACCEPTED' ? 'Pick up passenger' : 'Drop off passenger'}
            </h2>
            <span style={{
              fontWeight: 'bold', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '999px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: 'var(--accent-primary)'
            }}>
              {activeRide.status}
            </span>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem'}}>
            <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold'}}>
              {activeRide.passenger?.name?.charAt(0) || 'P'}
            </div>
            <div style={{flex: 1}}>
              <p style={{fontWeight: '600', fontSize: '1.1rem', margin: 0}}>{activeRide.passenger?.name || 'Passenger'}</p>
              <p style={{color: 'var(--text-secondary)', margin: 0}}>Contact: {activeRide.passenger?.phone || 'N/A'}</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <p style={{fontWeight: 'bold', fontSize: '1.2rem', margin: 0}}>4.9★</p>
            </div>
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '0.5rem'}}>
              <div style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-success)', marginTop: '0.4rem'}}></div>
              <p style={{margin: 0, color: 'var(--text-secondary)'}}>{activeRide.pickupAddress}</p>
            </div>
            <div style={{borderLeft: '2px dashed var(--border-color)', height: '20px', marginLeft: '4px', marginBottom: '0.5rem'}}></div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{width: '10px', height: '10px', backgroundColor: 'var(--accent-danger)', marginTop: '0.4rem'}}></div>
              <p style={{margin: 0, color: 'var(--text-secondary)'}}>{activeRide.destAddress}</p>
            </div>
          </div>

          {activeRide.status === 'ACCEPTED' && (
            <button onClick={() => updateRideStatus('IN_PROGRESS')} className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}>
              Start Ride
            </button>
          )}
          {activeRide.status === 'IN_PROGRESS' && (
            <button onClick={() => updateRideStatus('COMPLETED')} className="btn btn-success" style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}>
              Complete Ride
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default DriverDashboard;
