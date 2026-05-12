import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin, Hospital, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    bloodType: '',
    phone: '',
    address: ''
  });
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user profile
    const getProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { 'x-auth-token': token }
        });
        setProfile(res.data);
        setFormData({
          age: res.data.age || '',
          bloodType: res.data.bloodType || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
        if (res.data.location) {
          setLocation(res.data.location);
          searchHospitals(res.data.location);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    getProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: { 'x-auth-token': token }
      });
      setProfile(res.data);
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          searchHospitals(loc);
          // Update profile with location
          updateLocation(loc);
        },
        (err) => {
          setError('Unable to retrieve your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const updateLocation = async (loc) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/profile', { location: loc }, {
        headers: { 'x-auth-token': token }
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  const searchHospitals = (loc) => {
    if (!window.google) {
      setError('Google Maps API not loaded');
      return;
    }

    setLoading(true);
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      location: new window.google.maps.LatLng(loc.lat, loc.lng),
      radius: 5000, // 5km
      type: 'hospital'
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setHospitals(results.slice(0, 10)); // Top 10
      } else {
        setError('Failed to find nearby hospitals');
      }
      setLoading(false);
    });
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
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Complete your profile and find nearby hospitals for donation.</p>
          
          {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3>Donor Details</h3>
              <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }}>
                <div style={{ marginBottom: '15px' }}>
                  <label>Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    value={formData.age} 
                    onChange={onChange} 
                    placeholder="Enter your age"
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>Blood Type</label>
                  <select 
                    name="bloodType" 
                    value={formData.bloodType} 
                    onChange={onChange}
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={onChange} 
                    placeholder="Enter your phone number"
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={onChange} 
                    placeholder="Enter your address"
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                  <Save size={18} style={{ marginRight: '10px' }} /> Save Profile
                </button>
              </form>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3>Nearby Hospitals</h3>
              <button onClick={getLocation} className="btn-secondary" style={{ marginBottom: '20px', width: '100%', padding: '10px' }}>
                <MapPin size={18} style={{ marginRight: '10px' }} /> Get My Location & Find Hospitals
              </button>
              {loading && <p>Loading hospitals...</p>}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {hospitals.map((hospital, index) => (
                  <div key={index} className="glass-panel" style={{ padding: '10px', marginBottom: '10px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                    <Hospital size={16} style={{ marginRight: '10px' }} />
                    <strong>{hospital.name}</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{hospital.vicinity}</p>
                    {hospital.rating && <p>Rating: {hospital.rating} ⭐</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
