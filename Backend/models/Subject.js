const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  teacher: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    enum: [1, 2, 3, 4],
  },
}, { timestamps: true });

// Prevent duplicate subject-year combo
subjectSchema.index({ name: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
