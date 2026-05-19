import mongoose from 'mongoose';

const recipientProfileSchema = new mongoose.Schema({
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
  medicalCondition: {
    type: String,
    required: true,
  },
  urgencyLevel: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  address: {
    type: String,
  },
  prescriptions: [{
    name: String,
    fileData: String,
    date: { type: Date, default: Date.now }
  }],
  aiReports: [{
    content: String,
    title: { type: String, default: 'AI Health Assessment' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

recipientProfileSchema.index({ location: '2dsphere' });

export default mongoose.model('RecipientProfile', recipientProfileSchema);
