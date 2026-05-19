import mongoose from 'mongoose';

const sosRequestSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodType: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['Emergency', 'High', 'Medium'],
    default: 'Emergency',
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'Cancelled'],
    default: 'Active',
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
  address: String,
}, { timestamps: true });

sosRequestSchema.index({ location: '2dsphere' });

export default mongoose.model('SosRequest', sosRequestSchema);
