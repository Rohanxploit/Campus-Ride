import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';

import Profile from './pages/Profile';
import { Link } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="container" style={{paddingTop: '2rem'}}>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div className="container" style={{paddingTop: '2rem'}}>Loading application...</div>;

  return (
    <Router>
      <div className="page-wrapper animate-fade-in">
        {/* Navigation Bar */}
        <nav className={`nav-bar container glass ${user ? 'floating-nav' : ''}`} style={user ? { borderRadius: '1rem', marginTop: 0 } : { marginTop: '1rem', borderRadius: '0.5rem' }}>
          <Link to="/" style={{textDecoration: 'none'}}>
            <div className="nav-logo">CampusRide</div>
          </Link>
          {user && (
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <span style={{color: 'var(--text-secondary)', display: 'none'}} className="sm-show">Hi, {user.name}</span>
              <Link to="/profile" className="btn" style={{backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '0.5rem 1rem', textDecoration: 'none'}}>
                Profile
              </Link>
              <button onClick={logout} className="btn" style={{backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.5rem 1rem'}}>
                Logout
              </button>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className={user ? "" : "container"} style={user ? { flex: 1 } : { flex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/" element={
              <ProtectedRoute>
                {user?.role === 'PASSENGER' ? <PassengerDashboard /> : <DriverDashboard />}
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
