import express from 'express';
import authMiddleware from '../middleware/auth.js';
import DonorProfile from '../models/DonorProfile.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/donor/profile
 * Save or update donor profile details
 */
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      fullName,
      age,
      bloodType,
      gender,
      weight,
      lastDonationDate,
      medicalHistory,
      location,
      address,
      vitals,
      remindMe
    } = req.body;

    const updateData = {
      fullName,
      age,
      bloodType,
      gender,
      weight,
      lastDonationDate,
      medicalHistory,
      address,
      remindMe
    };

    // Handle GeoJSON Location
    if (location && location.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    }

    let profile = await DonorProfile.findOne({ userId: req.user.id });

    if (profile) {
      // Update existing profile
      const updateQuery = { $set: updateData };
      if (vitals) {
        updateQuery.$push = { vitalsHistory: vitals };
      }
      
      profile = await DonorProfile.findOneAndUpdate(
        { userId: req.user.id },
        updateQuery,
        { new: true }
      );
    } else {
      // Create new profile
      const newProfileData = {
        userId: req.user.id,
        ...updateData
      };
      if (vitals) {
        newProfileData.vitalsHistory = [vitals];
      }
      profile = new DonorProfile(newProfileData);
      await profile.save();
    }

    res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/**
 * GET /api/donor/profile
 * Get current donor profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found', needsOnboarding: true });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Helper: Haversine distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * GET /api/donor/nearby-hospitals
 * Fetch nearby hospitals and nursing homes
 */
router.get('/nearby-hospitals', authMiddleware, async (req, res) => {
  try {
    const { lat, lon, radius = 20000 } = req.query;
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Location required' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    let hospitals = [];

    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hospital&key=${apiKey}`;
      const gRes = await fetch(googleUrl);
      const gData = await gRes.json();

      if (gData.status === 'OK' || gData.status === 'ZERO_RESULTS') {
        hospitals = (gData.results || []).map(place => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat,
          lon: place.geometry.location.lng,
          address: place.vicinity,
          rating: place.rating,
          phone: place.formatted_phone_number || 'Contact not available',
          openNow: place.opening_hours?.open_now
        }));
      } else {
        throw new Error(gData.status);
      }
    } catch (err) {
      console.warn('Google Places failed, falling back to Overpass:', err.message);
      
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          node["healthcare"="hospital"](around:${radius},${lat},${lon});
          way["healthcare"="hospital"](around:${radius},${lat},${lon});
          node["healthcare"="blood_bank"](around:${radius},${lat},${lon});
          way["healthcare"="blood_bank"](around:${radius},${lat},${lon});
        );
        out center tags;
      `.trim();

      const oRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`, {
        headers: { 'User-Agent': 'LifeGift-BloodDonationApp/1.0' }
      });
      
      if (!oRes.ok) throw new Error('Overpass failed');
      const oData = await oRes.json();
      
      hospitals = (oData.elements || []).map(el => ({
        id: el.id,
        name: el.tags?.name || el.tags?.['name:en'] || 'Unnamed Hospital',
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        address: el.tags ? `${el.tags['addr:street'] || ''} ${el.tags['addr:city'] || ''}`.trim() : 'Address not available',
        phone: el.tags?.phone || el.tags?.['contact:phone'] || 'Contact not available',
        rating: null,
        openNow: null
      }));
    }

    // Filter, Calculate Distance, and Sort
    const finalResults = hospitals
      .filter(h => {
        const name = h.name.toLowerCase();
        // Exclude eye/vision centers as requested
        return !name.includes('eye') && !name.includes('vision') && !name.includes('optometrist');
      })
      .map(h => ({
        ...h,
        distance: getDistance(userLat, userLon, h.lat, h.lon)
      }))
      .filter(h => h.lat && h.lon) // Ensure valid coordinates
      .sort((a, b) => a.distance - b.distance); // Sort nearest to farthest

    res.json(finalResults);
  } catch (err) {
    console.error('Final Hospital Fetch Error:', err.message);
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});

export default router;
