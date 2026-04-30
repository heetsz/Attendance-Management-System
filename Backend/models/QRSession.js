const mongoose = require('mongoose');

const qrSessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Auto-expire TTL index
qrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('QRSession', qrSessionSchema);
