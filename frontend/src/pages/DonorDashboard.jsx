import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, Globe, LogOut, Heart, Activity, 
  MapPin, Calendar, Clock, TrendingUp, Bell, CheckCircle2,
  ChevronRight, Award, User, Droplets
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import Navbar from '../components/Navbar';

// --- Sub-components ---

const DashboardHeader = ({ name }) => {
  const [greeting, setGreeting] = useState('');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="flex items-center justify-between py-6 px-8 border-b border-white/5 bg-[#0a0a0b]">
      <div className="flex items-center gap-4">
        <div className="bg-white/5 p-2 rounded-full border border-white/10">
          <User size={24} className="text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {greeting}, {name || 'Donor'}
            <CheckCircle2 size={20} className="text-red-500" />
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="badge-verified">
              <ShieldCheck size={14} /> Govt. Authorized
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
               Status: <span className="text-red-500 font-semibold">Active Donor</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button className="flex items-center gap-2 text-sm font-medium text-white bg-white/5 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <Globe size={16} />
            {language}
          </button>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

const IdentityCard = ({ profile }) => {
  const calculateDaysRemaining = (lastDate) => {
    if (!lastDate) return 0;
    const nextEligible = new Date(lastDate);
    nextEligible.setDate(nextEligible.getDate() + 56);
    const diff = nextEligible - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = calculateDaysRemaining(profile?.lastDonationDate);
  const isEligible = daysRemaining === 0;

  return (
    <div className="bento-item col-span-4 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-6">
        <div className={`w-4 h-4 rounded-full ${isEligible ? 'bg-green-500 animate-pulse' : 'bg-red-500'} ring-4 ring-opacity-20 ${isEligible ? 'ring-green-500' : 'ring-red-500'}`}></div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Donor Identity</h3>
            <p className="text-xs text-gray-400">ID: LG-2024-{profile?._id?.slice(-4).toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-white">{profile?.bloodType || 'O+'}</span>
            <span className="text-sm font-medium text-gray-400">Blood Group</span>
          </div>
          
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm font-semibold text-white mb-1">
              {isEligible ? 'Eligible to Donate Blood Today.' : `Eligible in ${daysRemaining} Days.`}
            </p>
            <p className="text-xs text-gray-400">
              {isEligible ? 'Your contribution can save up to 3 lives.' : 'Next donation cycle starts soon.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className={profile?.remindMe ? 'text-red-500' : 'text-gray-400'} />
          <span className="text-xs font-medium text-gray-400">Remind Me</span>
        </div>
        <button className={`w-10 h-6 rounded-full transition-all relative ${profile?.remindMe ? 'bg-red-500' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile?.remindMe ? 'left-5' : 'left-1'}`}></div>
        </button>
      </div>
    </div>
  );
};

const ImpactTimeline = ({ donations }) => {
  const stats = [
    { label: 'Units Donated', value: donations?.length || 0, icon: Heart },
    { label: 'Lives Impacted', value: (donations?.length || 0) * 3, icon: Award }
  ];

  return (
    <div className="bento-item col-span-4">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        Live Impact Timeline <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <s.icon size={20} className="text-red-500" />
            <p className="text-2xl font-black text-white mt-2">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative pl-6 border-l-2 border-white/10 space-y-6">
        {(donations || []).length > 0 ? donations.map((d, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20"></div>
            <p className="text-sm font-bold text-white">{d.location || 'Central Hospital'}</p>
            <p className="text-xs text-gray-400">{new Date(d.date).toLocaleDateString()}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded">SUCCESSFULLY UTILIZED</span>
          </div>
        )) : (
          <p className="text-sm text-gray-400 italic">No donations yet. Start your journey today!</p>
        )}
      </div>
    </div>
  );
};

const HealthDashboard = ({ vitals }) => {
  const data = vitals?.length > 0 ? vitals : [
    { name: 'Jan', hemoglobin: 14.5, bp: 120, pulse: 72 },
    { name: 'Feb', hemoglobin: 14.2, bp: 118, pulse: 75 },
    { name: 'Mar', hemoglobin: 14.8, bp: 122, pulse: 70 },
  ];

  return (
    <div className="bento-item col-span-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-white">Personal Health Vitals</h3>
          <p className="text-xs text-gray-400">Track your hemoglobin and vitals over time</p>
        </div>
        <button className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
          Download PDF Vault
        </button>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ff2d55" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
            <Tooltip 
              contentStyle={{ background: '#0a0a0b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
            <Area type="monotone" dataKey="hemoglobin" stroke="#ff2d55" strokeWidth={3} fillOpacity={1} fill="url(#colorHb)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl text-red-500 border border-red-500/20"><Activity size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Avg Hemoglobin</p>
            <p className="text-sm font-bold text-white">14.5 g/dL</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-xl text-blue-400 border border-blue-500/20"><TrendingUp size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Blood Pressure</p>
            <p className="text-sm font-bold text-white">120/80 mmHg</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-xl text-orange-400 border border-orange-500/20"><Clock size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Pulse Rate</p>
            <p className="text-sm font-bold text-white">72 bpm</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-bold text-white mb-4">Medical Checkup Vault</h4>
        <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Report Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Annual Blood Work', date: 'Oct 12, 2023' },
                { name: 'Pre-Donation Screening', date: 'Jan 24, 2024' },
              ].map((report, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{report.name}</td>
                  <td className="px-6 py-4 text-gray-400">{report.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-400 font-bold hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HospitalFinder = ({ profile }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const findHospitals = async () => {
    setLoading(true);
    try {
      let lat, lon;
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;

      const res = await axios.get(`http://localhost:5000/api/donor/nearby-hospitals?lat=${lat}&lon=${lon}&radius=20000`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
      if (profile?.location?.coordinates) {
        const [pLon, pLat] = profile.location.coordinates;
        const res = await axios.get(`http://localhost:5000/api/donor/nearby-hospitals?lat=${pLat}&lon=${pLon}&radius=20000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHospitals(res.data);
      } else {
        alert('Please allow location access to find centers near you.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    findHospitals();
  }, []);

  return (
    <div className="bento-item col-span-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Nearby Centers</h3>
          <p className="text-[10px] text-gray-400">{hospitals.length} centers found within 20km</p>
        </div>
        <button 
          onClick={findHospitals}
          className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors shadow-sm"
          title="Refresh Location"
        >
          <MapPin size={20} />
        </button>
      </div>
      
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Clock className="animate-spin text-red-500" size={32} />
            <p className="text-xs font-bold text-gray-400">Authenticating Location...</p>
          </div>
        ) : hospitals.length > 0 ? hospitals.map((h, i) => (
          <div key={i} className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500/50 transition-all shadow-sm hover:shadow-md group">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white truncate w-48 group-hover:text-red-400 transition-colors">{h.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg border border-red-400/20">{h.distance?.toFixed(1)} km</span>
                <div className="flex items-center gap-1 text-orange-400 font-bold text-[10px]">
                  <span>{h.rating || '4.5'}</span>
                  <Heart size={8} fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <MapPin size={10} className="text-red-500" />
                <p className="truncate">{h.address}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <Activity size={10} className="text-red-400" />
                <p>{h.phone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${h.openNow !== false ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
                {h.openNow !== false ? 'READY FOR DONATION' : 'CLOSED NOW'}
              </span>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-red-400 hover:underline"
              >
                Get Directions
              </a>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <div className="bg-white/5 p-4 rounded-full mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <p className="text-sm font-bold text-white">Allow location access</p>
            <p className="text-xs text-gray-400 mt-1">We need your specific location to show centers correctly.</p>
            <button onClick={findHospitals} className="mt-4 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20">Retry Now</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

const DonorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/donor/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.data?.needsOnboarding) {
          navigate('/donor-onboarding');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return (
    <div className="dashboard-dark min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="dashboard-dark min-h-screen font-['Plus_Jakarta_Sans']">
      <Navbar />
      <div className="pt-20">
        <DashboardHeader name={localStorage.getItem('name')} />
        
        <main className="bento-grid">
          {profile ? (
            <>
              {/* Row 1: Profile + Health Graph */}
              <IdentityCard profile={profile} />
              <HealthDashboard vitals={profile?.vitalsHistory} />
              
              {/* Row 2: Impact + Finder + Actions */}
              <ImpactTimeline donations={profile?.donationHistory} />
              <HospitalFinder profile={profile} />
              
              <div className="bento-item col-span-4 bg-gradient-to-br from-red-600 to-red-900 text-white flex flex-col justify-between border-none">
                <div>
                  <h3 className="text-xl font-bold">Ready to Save Lives?</h3>
                  <p className="text-white/80 text-sm mt-2">Schedule your next donation at a certified center near you.</p>
                </div>
                <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors mt-6">
                  Book Appointment <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="col-span-12 py-20 text-center text-white">
               <Droplets size={48} className="text-red-500 animate-bounce mx-auto mb-4" />
               <p className="font-bold">Synchronizing Secure Profile...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;
