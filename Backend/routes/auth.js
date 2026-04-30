const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Admin Login (username + password) ───
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(admin._id, 'admin');

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Student Login (uid + password) ───
router.post('/student/login', async (req, res) => {
  try {
    const { uid, password } = req.body;

    if (!uid || !password) {
      return res.status(400).json({ message: 'Please provide UID and password' });
    }

    const student = await Student.findOne({ uid });
    if (!student) {
      return res.status(401).json({ message: 'Invalid UID or password' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid UID or password' });
    }

    const token = generateToken(student._id, 'student');

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        uid: student.uid,
        year: student.year,
        role: 'student',
      },
    });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Student Change Password (protected) ───
router.post('/student/change-password', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can change their password here' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    student.password = newPassword;
    await student.save(); // triggers bcrypt pre-save hook

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Get Current User ───
router.get('/me', protect, async (req, res) => {
  try {
    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id).select('-password');
    } else {
      user = await Student.findById(req.user.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: { ...user.toObject(), role: req.user.role } });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Logout ───
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
