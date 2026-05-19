import mongoose from 'mongoose';

const donorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
  },
  lastDonationDate: {
    type: Date,
  },
  weight: {
    type: Number,
    required: true,
  },
  medicalHistory: {
    type: String,
    default: 'None',
  },
  remindMe: {
    type: Boolean,
    default: false,
  },
  vitalsHistory: [{
    date: { type: Date, default: Date.now },
    hemoglobin: Number,
    bloodPressure: String, // e.g., "120/80"
    pulseRate: Number
  }],
  donationHistory: [{
    date: { type: Date },
    status: { type: String, enum: ['Success', 'Pending', 'Scheduled'], default: 'Success' },
    location: String,
    units: { type: Number, default: 1 }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  aiReports: [{
    content: String,
    title: { type: String, default: 'AI Health Assessment' },
    date: { type: Date, default: Date.now }
  }],
  address: {
    type: String,
  },
  prescriptions: [{
    name: String,
    fileData: String, // Base64 encoded PDF string
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });


donorProfileSchema.index({ location: '2dsphere' });

export default mongoose.model('DonorProfile', donorProfileSchema);

