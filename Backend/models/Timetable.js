const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },  // "09:00"
  endTime:   { type: String, required: true },  // "10:00"
  subject:   { type: String, required: true },
  teacher:   { type: String, required: true },
}, { _id: true });

const timetableSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  slots: [slotSchema],
}, { timestamps: true });

// One timetable entry per year per day
timetableSchema.index({ year: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
