import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', backgroundColor: 'var(--primary-dark)' }}>
      <Navbar />
      <div className="container">
        <div className="glass-panel" style={{ padding: '40px', marginTop: '40px', position: 'relative' }}>
          <button 
            onClick={handleLogout} 
            className="btn-secondary"
            style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 20px' }}
          >
            <LogOut size={18} /> Logout
          </button>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Hospital <span style={{ color: '#ffd700' }}>Admin</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Manage transplant queues and donor availability.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
              <h3>Active Transplant Queue</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>15 Patients pending matches.</p>
              <button className="btn-primary" style={{ marginTop: '20px', padding: '10px 20px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #b8860b, #ffd700)', color: '#000' }}>Manage Queue</button>
            </div>
            
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3>Available Resources</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Update current inventory and donor availability.</p>
              <button className="btn-secondary" style={{ marginTop: '20px', padding: '10px 20px', fontSize: '0.9rem' }}>Update Database</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
