import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../contexts/SocketContext';
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

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for driver and ride markers
const driverIcon = new L.DivIcon({
  className: 'driver-rickshaw',
  html: '<div style="font-size: 24px; background: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid #3b82f6;">🛺</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

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

const center = {
  lat: 29.864, // IIT Roorkee roughly
  lng: 77.896
};

const CAMPUS_LOCATIONS = [
  // Gates
  { name: 'Main Gate', lat: 29.8644, lng: 77.8965 },
  { name: 'Century Gate', lat: 29.8633, lng: 77.8975 },
  // Admin & Academics
  { name: 'Thomason Building (Main Admin)', lat: 29.8649, lng: 77.8966 },
  { name: 'Central Library', lat: 29.8655, lng: 77.8968 },
  { name: 'LHC (Lecture Hall Complex)', lat: 29.8640, lng: 77.8980 },
  { name: 'Computer Center (ICC)', lat: 29.8650, lng: 77.8950 },
  // Departments
  { name: 'Department of Architecture', lat: 29.8625, lng: 77.8955 },
  { name: 'Department of Civil Engineering', lat: 29.8645, lng: 77.8955 },
  { name: 'Department of Computer Science', lat: 29.8650, lng: 77.8952 },
  { name: 'Department of Electrical Engineering', lat: 29.8640, lng: 77.8965 },
  { name: 'Department of ECE', lat: 29.8635, lng: 77.8960 },
  { name: 'Department of Mechanical Engineering', lat: 29.8655, lng: 77.8955 },
  { name: 'Department of Management Studies (DOMS)', lat: 29.8630, lng: 77.8930 },
  // Hostels / Bhawans
  { name: 'Azad Bhawan', lat: 29.8660, lng: 77.8975 },
  { name: 'Cautley Bhawan', lat: 29.8610, lng: 77.8950 },
  { name: 'Ganga Bhawan', lat: 29.8670, lng: 77.9000 },
  { name: 'Govind Bhawan', lat: 29.8622, lng: 77.8970 },
  { name: 'Jawahar Bhawan', lat: 29.8665, lng: 77.8990 },
  { name: 'Kasturba Bhawan', lat: 29.8625, lng: 77.8985 },
  { name: 'Radhakrishnan Bhawan', lat: 29.8658, lng: 77.9015 },
  { name: 'Rajendra Bhawan', lat: 29.8650, lng: 77.9020 },
  { name: 'Rajiv Bhawan', lat: 29.8615, lng: 77.8995 },
  { name: 'Ravindra Bhawan', lat: 29.8645, lng: 77.9005 },
  { name: 'Sarojini Bhawan', lat: 29.8635, lng: 77.8990 },
  // Facilities & Landmarks
  { name: 'Hospital (Institute Wellness Centre)', lat: 29.8638, lng: 77.8942 },
  { name: 'MAC (Multi Activity Centre)', lat: 29.8660, lng: 77.8940 },
  { name: 'Student Club', lat: 29.8650, lng: 77.8945 },
  { name: 'Sports Complex (LBS Ground)', lat: 29.8675, lng: 77.8950 },
  { name: 'Hobbies Club', lat: 29.8665, lng: 77.8965 },
  { name: 'Nescafe', lat: 29.8652, lng: 77.8962 }
];

const passengerIcon = new L.DivIcon({
  className: 'passenger-dot',
  html: '<div style="width: 15px; height: 15px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>',
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5]
});

const PassengerDashboard = () => {
  const { socket } = useContext(SocketContext);
  const [activeRide, setActiveRide] = useState(null);
  const [drivers, setDrivers] = useState([]);
  
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  const [pickupFocused, setPickupFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Start tracking passenger live location
    let geoId;
    if ('geolocation' in navigator) {
      geoId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPassengerLocation({ lat, lng });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }

    const fetchActiveRide = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rides/active');
        setActiveRide(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchDrivers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rides/drivers');
        setDrivers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchActiveRide();
    fetchDrivers();

    if (socket) {
      socket.on('ride_accepted', (ride) => {
        setActiveRide(ride);
      });
      socket.on('ride_status_updated', (ride) => {
        setActiveRide(ride);
        if (ride.status === 'COMPLETED') {
          setShowPayment(true);
        } else if (ride.status === 'CANCELLED') {
          setTimeout(() => setActiveRide(null), 3000);
        }
      });
      socket.on('driver_location_update', (data) => {
        setDrivers(prev => prev.map(d => d.id === data.driverId ? { ...d, currentLat: data.lat, currentLng: data.lng } : d));
      });
      socket.on('driver_offline', (data) => {
        setDrivers(prev => prev.filter(d => d.id !== data.driverId));
      });
    }

    return () => {
      if (socket) {
        socket.off('ride_accepted');
        socket.off('ride_status_updated');
        socket.off('driver_location_update');
        socket.off('driver_offline');
      }
      if (geoId) navigator.geolocation.clearWatch(geoId);
    };
  }, [socket]);

  // Emit passenger location periodically if they have an active ride
  useEffect(() => {
    if (socket && activeRide && activeRide.status !== 'COMPLETED' && activeRide.status !== 'CANCELLED' && passengerLocation) {
      socket.emit('update_passenger_location', { rideId: activeRide.id, lat: passengerLocation.lat, lng: passengerLocation.lng });
    }
  }, [passengerLocation, activeRide, socket]);

  const requestRide = async (e) => {
    e.preventDefault();
    if (!pickup || !destination) return;
    
    try {
      let pLocLat = center.lat + (Math.random() - 0.5) * 0.01;
      let pLocLng = center.lng + (Math.random() - 0.5) * 0.01;
      let pLocName = pickup;

      if (pickup === '📍 Use Current Location' && passengerLocation) {
        pLocLat = passengerLocation.lat;
        pLocLng = passengerLocation.lng;
        pLocName = 'Current Location';
      } else {
        const pLoc = CAMPUS_LOCATIONS.find(l => l.name.toLowerCase() === pickup.toLowerCase());
        if (pLoc) { pLocLat = pLoc.lat; pLocLng = pLoc.lng; pLocName = pLoc.name; }
      }

      const dLoc = CAMPUS_LOCATIONS.find(l => l.name.toLowerCase() === destination.toLowerCase());

      const payload = {
        pickupAddress: pLocName,
        destAddress: dLoc ? dLoc.name : destination,
        pickupLat: pLocLat,
        pickupLng: pLocLng,
        destLat: dLoc ? dLoc.lat : center.lat + (Math.random() - 0.5) * 0.01,
        destLng: dLoc ? dLoc.lng : center.lng + (Math.random() - 0.5) * 0.01,
      };
      
      const res = await axios.post('http://localhost:5000/api/rides/request', payload);
      setActiveRide(res.data);
      
      if (socket) {
        socket.emit('new_ride_request', res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelRide = () => {
    if (socket && activeRide) {
      socket.emit('cancel_ride', { rideId: activeRide.id });
      setActiveRide({ ...activeRide, status: 'CANCELLED' });
      setTimeout(() => setActiveRide(null), 3000);
    }
  };

  const handlePayment = () => {
    // Simulate payment processing delay
    setTimeout(() => {
      setShowPayment(false);
      setShowRating(true);
    }, 1000);
  };

  const submitRating = async () => {
    try {
      await axios.post(`http://localhost:5000/api/rides/${activeRide.id}/rating`, { score: ratingScore, feedback });
      setShowRating(false);
      setActiveRide(null);
    } catch (err) {
      console.error(err);
      setShowRating(false);
      setActiveRide(null);
    }
  };

  return (
    <div style={{position: 'relative', height: '100%', width: '100%'}}>
      <div className="full-screen-map">
        <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
          {passengerLocation && <RecenterAutomatically lat={passengerLocation.lat} lng={passengerLocation.lng} />}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution="&copy; Google Maps"
          />

          {passengerLocation && (
            <Marker position={[passengerLocation.lat, passengerLocation.lng]} icon={passengerIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          
          {drivers.map(driver => (
            driver.currentLat && driver.currentLng && (
              <Marker key={driver.id} position={[driver.currentLat, driver.currentLng]} icon={driverIcon}>
                <Popup>{driver.name} (Driver)</Popup>
              </Marker>
            )
          ))}

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
        </MapContainer>
      </div>

      <div className="bottom-sheet">
        {!activeRide ? (
          <div>
            <h2 style={{marginBottom: '1rem', fontSize: '1.5rem'}}>Where to?</h2>
            <form onSubmit={requestRide}>
              <div className="input-group" style={{marginBottom: '1rem', position: 'relative'}}>
                <input 
                  type="text" 
                  placeholder="Pickup Location (e.g., Main Gate)" 
                  value={pickup} 
                  onChange={e => setPickup(e.target.value)} 
                  onFocus={() => setPickupFocused(true)}
                  onBlur={() => setTimeout(() => setPickupFocused(false), 200)}
                  required 
                  style={{padding: '1rem', fontSize: '1.1rem'}} 
                />
                {pickupFocused && (
                  <div style={{position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px'}}>
                    <div 
                      style={{padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 'bold'}}
                      onClick={() => { setPickup('📍 Use Current Location'); setPickupFocused(false); }}
                    >
                      📍 Use Current Location
                    </div>
                    {CAMPUS_LOCATIONS.filter(l => l.name.toLowerCase().includes(pickup.toLowerCase()) && pickup !== '📍 Use Current Location').map(loc => (
                      <div 
                        key={loc.name} 
                        style={{padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)'}}
                        onClick={() => { setPickup(loc.name); setPickupFocused(false); }}
                      >
                        {loc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="input-group" style={{marginBottom: '1.5rem', position: 'relative'}}>
                <input 
                  type="text" 
                  placeholder="Destination (e.g., Library)" 
                  value={destination} 
                  onChange={e => setDestination(e.target.value)} 
                  onFocus={() => setDestFocused(true)}
                  onBlur={() => setTimeout(() => setDestFocused(false), 200)}
                  required 
                  style={{padding: '1rem', fontSize: '1.1rem'}} 
                />
                {destFocused && destination.length > 0 && (
                  <div style={{position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', zIndex: 10, maxHeight: '150px', overflowY: 'auto', marginTop: '4px'}}>
                    {CAMPUS_LOCATIONS.filter(l => l.name.toLowerCase().includes(destination.toLowerCase())).map(loc => (
                      <div 
                        key={loc.name} 
                        style={{padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)'}}
                        onClick={() => { setDestination(loc.name); setDestFocused(false); }}
                      >
                        {loc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}>
                Request Campus Ride
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.5rem', margin: 0}}>
                {activeRide.status === 'REQUESTED' ? 'Finding your driver...' : 'Driver is on the way'}
              </h2>
              <span style={{
                fontWeight: 'bold', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '999px',
                backgroundColor: activeRide.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: activeRide.status === 'CANCELLED' ? 'var(--accent-danger)' : 'var(--accent-primary)'
              }}>
                {activeRide.status}
              </span>
            </div>

            {activeRide.driver && (
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem'}}>
                <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold'}}>
                  {activeRide.driver.name.charAt(0)}
                </div>
                <div style={{flex: 1}}>
                  <p style={{fontWeight: '600', fontSize: '1.1rem', margin: 0}}>{activeRide.driver.name}</p>
                  <p style={{color: 'var(--text-secondary)', margin: 0}}>{activeRide.driver.vehicle?.model} • {activeRide.driver.vehicle?.licensePlate}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontWeight: 'bold', fontSize: '1.2rem', margin: 0}}>4.8★</p>
                </div>
              </div>
            )}

            {activeRide.fare && (
              <div style={{marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
                <span style={{color: 'var(--text-secondary)'}}>Estimated Fare:</span>
                <span style={{fontWeight: 'bold', fontSize: '1.2rem', marginLeft: '0.5rem', color: 'var(--accent-primary)'}}>₹{activeRide.fare}</span>
              </div>
            )}

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
            
            {activeRide.status !== 'COMPLETED' && activeRide.status !== 'CANCELLED' && (
              <button onClick={cancelRide} className="btn btn-danger" style={{width: '100%', padding: '1rem', fontSize: '1rem'}}>
                Cancel Ride
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="glass animate-fade-in" style={{padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center'}}>
            <h2 style={{marginBottom: '1rem'}}>Complete Payment</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}>Total Fare: <strong style={{color: 'var(--accent-primary)', fontSize: '1.5rem'}}>₹{activeRide?.fare || 10}</strong></p>
            
            {!paymentMethod ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <button onClick={() => setPaymentMethod('CASH')} className="btn" style={{padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1.1rem'}}>💵 Cash</button>
                <button onClick={() => setPaymentMethod('UPI')} className="btn btn-primary" style={{padding: '1rem', fontSize: '1.1rem'}}>📱 UPI</button>
                <button onClick={() => setPaymentMethod('CARD')} className="btn" style={{padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1.1rem'}}>💳 Card</button>
              </div>
            ) : paymentMethod === 'UPI' ? (
              <>
                <p style={{marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>Pay to: <strong>{activeRide?.driver?.upiId || 'campusride@upi'}</strong></p>
                <div style={{width: '200px', height: '200px', backgroundColor: 'white', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem', padding: '1rem'}}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${activeRide?.driver?.upiId || 'campusride@upi'}&pn=${activeRide?.driver?.name || 'Driver'}&am=${activeRide?.fare || 10}`} alt="UPI QR" style={{width: '100%', height: '100%'}} />
                </div>
                <button onClick={handlePayment} className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: '#10b981'}}>
                  I have Paid
                </button>
              </>
            ) : paymentMethod === 'CARD' ? (
              <>
                <div className="input-group" style={{textAlign: 'left'}}>
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9101 1121" style={{marginBottom: '1rem'}} />
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div style={{flex: 1}}><label>Expiry</label><input type="text" placeholder="MM/YY" /></div>
                    <div style={{flex: 1}}><label>CVV</label><input type="text" placeholder="123" /></div>
                  </div>
                </div>
                <button onClick={handlePayment} className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1.5rem'}}>
                  Pay ₹{activeRide?.fare || 10}
                </button>
              </>
            ) : (
              <>
                <p style={{marginBottom: '1.5rem'}}>Please pay <strong>₹{activeRide?.fare || 10}</strong> in cash to <strong>{activeRide?.driver?.name || 'the driver'}</strong>.</p>
                <button onClick={handlePayment} className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: '#10b981'}}>
                  Done
                </button>
              </>
            )}

            {paymentMethod && (
              <button onClick={() => setPaymentMethod(null)} className="btn" style={{marginTop: '1rem', color: 'var(--text-secondary)', background: 'transparent'}}>
                ← Back to options
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="glass animate-fade-in" style={{padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center'}}>
            <h2 style={{marginBottom: '1rem'}}>Rate your ride</h2>
            <p style={{marginBottom: '1.5rem', color: 'var(--text-secondary)'}}>How was your trip with {activeRide?.driver?.name}?</p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '2.5rem', cursor: 'pointer'}}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} onClick={() => setRatingScore(star)} style={{color: star <= ratingScore ? '#f59e0b' : '#4b5563', transition: 'color 0.2s'}}>
                  ★
                </span>
              ))}
            </div>
            <textarea 
              placeholder="Leave optional feedback..." 
              value={feedback} 
              onChange={e => setFeedback(e.target.value)}
              style={{width: '100%', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', height: '100px', resize: 'none'}}
            />
            <button onClick={submitRating} className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}>
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDashboard;
