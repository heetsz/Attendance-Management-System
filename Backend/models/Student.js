const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: [true, 'UID is required'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 4,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    enum: [1, 2, 3, 4],
  },
  role: {
    type: String,
    default: 'student',
    immutable: true,
  },
}, { timestamps: true });

// Hash password before saving
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
