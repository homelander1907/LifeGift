import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['donor', 'recipient', 'hospital'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  location: {
    lat: Number,
    lng: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('User', userSchema);
