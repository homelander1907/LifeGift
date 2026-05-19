import mongoose from 'mongoose';

const hospitalProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  registrationId: {
    type: String,
    required: true,
  },
  locationName: {
    type: String,
    required: true,
  },
  bloodInventory: {
    'A+': { type: Number, default: 15 },
    'A-': { type: Number, default: 8 },
    'B+': { type: Number, default: 12 },
    'B-': { type: Number, default: 4 },
    'AB+': { type: Number, default: 10 },
    'AB-': { type: Number, default: 3 },
    'O+': { type: Number, default: 18 },
    'O-': { type: Number, default: 5 }
  },
  donationIntents: [{
    donorName: { type: String, required: true },
    type: { type: String, enum: ['blood', 'organ'], default: 'blood' },
    bloodGroup: { type: String, default: null },
    organ: { type: String, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
  }],
  alerts: [{
    severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
    message: { type: String, required: true }
  }]
}, { timestamps: true });

export default mongoose.model('HospitalProfile', hospitalProfileSchema);
