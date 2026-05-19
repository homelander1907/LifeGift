import express from 'express';
import authMiddleware from '../middleware/auth.js';
import HospitalProfile from '../models/HospitalProfile.js';
import User from '../models/User.js';
import SosRequest from '../models/SosRequest.js';

const router = express.Router();

// Helper to determine status based on units
const getStatus = (units) => {
  if (units <= 5) return 'CRITICAL';
  if (units <= 10) return 'LOW';
  return 'SAFE';
};

// Database upgrade and sanitization helper to guarantee schema compliance
const ensureProfileFields = (profile, user) => {
  let modified = false;
  
  if (!profile.registrationId) {
    profile.registrationId = 'HOSP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    modified = true;
  }
  
  if (!profile.locationName) {
    profile.locationName = user.address || 'Main Campus';
    modified = true;
  }
  
  if (!profile.bloodInventory) {
    profile.bloodInventory = {
      'A+': 15, 'A-': 8, 'B+': 12, 'B-': 4, 'AB+': 10, 'AB-': 3, 'O+': 18, 'O-': 5
    };
    profile.markModified('bloodInventory');
    modified = true;
  } else {
    // Ensure all 8 groups are present
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    groups.forEach(g => {
      if (profile.bloodInventory[g] === undefined) {
        profile.bloodInventory[g] = 10;
        profile.markModified('bloodInventory');
        modified = true;
      }
    });
  }

  if (!profile.alerts) {
    profile.alerts = [];
    modified = true;
  }

  if (!profile.donationIntents) {
    profile.donationIntents = [];
    modified = true;
  }
  
  return modified;
};

// Helper to generate dynamic dashboard response
const generateDashboardData = (user, profile) => {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const bloodInventory = {};
  let totalUnits = 0;
  let criticalCount = 0;
  let lowCount = 0;
  let safeCount = 0;
  
  bloodGroups.forEach(bg => {
    const units = profile.bloodInventory[bg] !== undefined ? profile.bloodInventory[bg] : 10;
    const status = getStatus(units);
    
    bloodInventory[bg] = { units, status };
    totalUnits += units;
    
    if (status === 'CRITICAL') criticalCount++;
    else if (status === 'LOW') lowCount++;
    else if (status === 'SAFE') safeCount++;
  });

  const intents = profile.donationIntents || [];
  const pendingCount = intents.filter(i => i.status === 'pending').length;
  const approvedCount = intents.filter(i => i.status === 'approved').length;
  const rejectedCount = intents.filter(i => i.status === 'rejected').length;

  // Auto-generate alerts based on critical inventories
  const finalAlerts = [...(profile.alerts || [])];
  
  bloodGroups.forEach(bg => {
    const units = profile.bloodInventory[bg] !== undefined ? profile.bloodInventory[bg] : 10;
    if (units <= 5) {
      // Check if alert already exists
      const exists = finalAlerts.some(a => a.message.includes(`Blood group ${bg} is CRITICAL`));
      if (!exists) {
        finalAlerts.push({
          severity: 'critical',
          message: `Blood group ${bg} is CRITICAL (${units} units remaining). Immediate donations requested!`
        });
      }
    } else if (units <= 10) {
      const exists = finalAlerts.some(a => a.message.includes(`Blood group ${bg} is LOW`));
      if (!exists) {
        finalAlerts.push({
          severity: 'warning',
          message: `Blood group ${bg} is LOW (${units} units remaining).`
        });
      }
    }
  });

  if (finalAlerts.length === 0) {
    finalAlerts.push({
      severity: 'info',
      message: 'All systems operational. Blood supplies are currently stable.'
    });
  }

  return {
    hospital: {
      name: user.name,
      registration_id: profile.registrationId,
      location: user.address || profile.locationName || 'Main Campus'
    },
    blood_inventory: bloodInventory,
    inventory_summary: {
      total_units: totalUnits,
      critical_count: criticalCount,
      low_count: lowCount,
      safe_count: safeCount
    },
    donation_intent_queue: {
      pending_count: pendingCount,
      approved_count: approvedCount,
      rejected_count: rejectedCount,
      intents: intents.map(i => ({
        _id: i._id,
        donor_name: i.donorName,
        type: i.type,
        blood_group: i.bloodGroup,
        organ: i.organ,
        timestamp: i.timestamp.toISOString(),
        status: i.status
      }))
    },
    alerts: finalAlerts.map(a => ({
      _id: a._id,
      severity: a.severity,
      message: a.message
    }))
  };
};

/**
 * GET /api/hospital/dashboard
 * Fetch hospital dashboard details. Auto-creates a default profile if not present.
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    let profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      // Create a default hospital profile
      const randomReg = 'HOSP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      profile = new HospitalProfile({
        userId: req.user.id,
        registrationId: randomReg,
        locationName: user.address || 'Main Campus',
        bloodInventory: {
          'A+': 15,
          'A-': 8,
          'B+': 12,
          'B-': 4,
          'AB+': 10,
          'AB-': 3,
          'O+': 18,
          'O-': 5
        },
        donationIntents: [
          { donorName: 'Jane Doe', type: 'blood', bloodGroup: 'O-', status: 'pending', timestamp: new Date(Date.now() - 3600000 * 2) },
          { donorName: 'Alex Smith', type: 'organ', organ: 'Kidney', status: 'approved', timestamp: new Date(Date.now() - 3600000 * 12) },
          { donorName: 'Bob Johnson', type: 'blood', bloodGroup: 'AB-', status: 'pending', timestamp: new Date(Date.now() - 3600000 * 24) },
          { donorName: 'Alice Williams', type: 'blood', bloodGroup: 'A+', status: 'rejected', timestamp: new Date(Date.now() - 3600000 * 48) }
        ],
        alerts: [
          { severity: 'info', message: 'Welcome to your new Hospital Dashboard portal.' }
        ]
      });
      await profile.save();
    } else {
      // Upgrade document in database if missing fields from older database states
      const isModified = ensureProfileFields(profile, user);
      if (isModified) {
        await profile.save();
      }
    }

    const data = generateDashboardData(user, profile);
    res.json(data);
  } catch (err) {
    console.error('Fetch Hospital Dashboard Error:', err);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

/**
 * PUT /api/hospital/inventory
 * Update units of specific blood types
 */
router.put('/inventory', authMiddleware, async (req, res) => {
  try {
    const { bloodInventory } = req.body; // Expects object: { 'A+': 15, 'O-': 2, ... }
    
    if (!bloodInventory) {
      return res.status(400).json({ message: 'Blood inventory data required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    let profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    // Backfill any missing schema fields
    ensureProfileFields(profile, user);

    // Merge/update
    Object.keys(bloodInventory).forEach(bg => {
      profile.bloodInventory[bg] = Number(bloodInventory[bg]);
    });

    profile.markModified('bloodInventory');
    await profile.save();
    
    const data = generateDashboardData(user, profile);
    res.json(data);
  } catch (err) {
    console.error('Update Inventory Error:', err);
    res.status(500).json({ message: 'Server error updating inventory' });
  }
});

/**
 * PUT /api/hospital/intent/:intentId
 * Approve or reject a donation intent
 */
router.put('/intent/:intentId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const { intentId } = req.params;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    let profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    // Backfill any missing schema fields
    ensureProfileFields(profile, user);

    const intent = profile.donationIntents.id(intentId);
    if (!intent) {
      return res.status(404).json({ message: 'Donation intent not found' });
    }

    const oldStatus = intent.status;
    intent.status = status;

    // If changing to approved and it's a blood donation, increment blood supply by 1 unit
    if (status === 'approved' && oldStatus !== 'approved' && intent.type === 'blood' && intent.bloodGroup) {
      const bg = intent.bloodGroup;
      profile.bloodInventory[bg] = (profile.bloodInventory[bg] || 0) + 1;
      profile.markModified('bloodInventory');
    }

    await profile.save();
    
    const data = generateDashboardData(user, profile);
    res.json(data);
  } catch (err) {
    console.error('Update Intent Error:', err);
    res.status(500).json({ message: 'Server error updating intent' });
  }
});

/**
 * POST /api/hospital/alert
 * Add new custom alert
 */
router.post('/alert', authMiddleware, async (req, res) => {
  try {
    const { severity, message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Alert message is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    let profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    // Backfill any missing schema fields
    ensureProfileFields(profile, user);

    profile.alerts.push({
      severity: severity || 'info',
      message
    });

    await profile.save();
    
    const data = generateDashboardData(user, profile);
    res.json(data);
  } catch (err) {
    console.error('Add Alert Error:', err);
    res.status(500).json({ message: 'Server error adding alert' });
  }
});

/**
 * DELETE /api/hospital/alert/:alertId
 * Dismiss/delete alert
 */
router.delete('/alert/:alertId', authMiddleware, async (req, res) => {
  try {
    const { alertId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    let profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    // Backfill any missing schema fields
    ensureProfileFields(profile, user);

    profile.alerts = profile.alerts.filter(a => a._id.toString() !== alertId);
    await profile.save();
    
    const data = generateDashboardData(user, profile);
    res.json(data);
  } catch (err) {
    console.error('Delete Alert Error:', err);
    res.status(500).json({ message: 'Server error deleting alert' });
  }
});

/**
 * GET /api/hospital/sos-requests
 * Fetch active recipient SOS requests
 */
router.get('/sos-requests', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const sosRequests = await SosRequest.find({ status: 'Active' })
      .populate('recipientId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(sosRequests);
  } catch (err) {
    console.error('Fetch SOS Requests Error:', err);
    res.status(500).json({ message: 'Server error fetching SOS requests' });
  }
});

/**
 * PUT /api/hospital/sos-requests/:id/resolve
 * Resolve/Dismiss an active SOS request
 */
router.put('/sos-requests/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const sos = await SosRequest.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: 'SOS Request not found' });

    sos.status = 'Resolved';
    await sos.save();

    res.json({ message: 'SOS request marked as resolved successfully.' });
  } catch (err) {
    console.error('Resolve SOS Error:', err);
    res.status(500).json({ message: 'Server error resolving SOS request' });
  }
});

export default router;
