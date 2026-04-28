import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';

const DonorDashboard = () => {
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
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Donor <span className="text-gradient-red">Dashboard</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Welcome back. Manage your donations and legacy here.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(255, 51, 102, 0.3)' }}>
              <h3>My Donor Card</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>View and download your official Govt. Donor Card.</p>
              <button className="btn-primary" style={{ marginTop: '20px', padding: '10px 20px', fontSize: '0.9rem' }}>View Card</button>
            </div>
            
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
              <h3>Update Preferences</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Modify your organ/blood donation preferences.</p>
              <button className="btn-secondary" style={{ marginTop: '20px', padding: '10px 20px', fontSize: '0.9rem' }}>Edit Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
