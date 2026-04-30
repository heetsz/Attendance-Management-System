const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  qrSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRSession',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present',
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// One attendance record per student per QR session
attendanceSchema.index({ studentId: 1, qrSessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
