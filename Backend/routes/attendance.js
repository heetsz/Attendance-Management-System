const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Subject = require('../models/Subject');
const QRSession = require('../models/QRSession');
const Attendance = require('../models/Attendance');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ─── [ADMIN] Get all subjects (optionally filter by year) ───
router.get('/subjects', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.year) filter.year = Number(req.query.year);
    const subjects = await Subject.find(filter).sort({ year: 1, name: 1 });
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── [ADMIN] Create subject ───
router.post('/subjects', protect, adminOnly, async (req, res) => {
  try {
    const { name, teacher, year } = req.body;
    if (!name || !teacher || !year) {
      return res.status(400).json({ message: 'name, teacher and year are required' });
    }
    const subject = await Subject.create({ name, teacher, year: Number(year) });
    res.status(201).json({ subject });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Subject already exists for this year' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── [ADMIN] Delete subject ───
router.delete('/subjects/:id', protect, adminOnly, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── [ADMIN] Generate QR code for a subject ───
// Returns base64 PNG and saves a token (valid 10 min)
router.post('/qr/generate', protect, adminOnly, async (req, res) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId) return res.status(400).json({ message: 'subjectId is required' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    // Deactivate previous sessions for this subject
    await QRSession.updateMany({ subjectId, active: true }, { active: false });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const session = await QRSession.create({
      token,
      subjectId,
      year: subject.year,
      createdBy: req.user.id,
      expiresAt,
    });

    // Encode token as QR image (data URL)
    const qrDataUrl = await QRCode.toDataURL(token, {
      width: 300,
      margin: 2,
      color: { dark: '#6366f1', light: '#0b0f1a' },
    });

    res.json({
      qrDataUrl,
      token,
      sessionId: session._id,
      subject: { name: subject.name, teacher: subject.teacher, year: subject.year },
      expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── [STUDENT] Scan QR & Mark Attendance ───
router.post('/qr/scan', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can mark attendance' });
    }

    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'QR token is required' });

    const session = await QRSession.findOne({ token, active: true }).populate('subjectId');
    if (!session) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    if (new Date() > session.expiresAt) {
      session.active = false;
      await session.save();
      return res.status(410).json({ message: 'QR code has expired' });
    }

    // Check if student is in the right year
    const Student = require('../models/Student');
    const student = await Student.findById(req.user.id);
    if (student.year !== session.year) {
      return res.status(403).json({ message: `This QR is for Year ${session.year} students only` });
    }

    // Check duplicate scan
    const existing = await Attendance.findOne({ studentId: req.user.id, qrSessionId: session._id });
    if (existing) {
      return res.status(409).json({ message: 'Attendance already marked for this lecture' });
    }

    const record = await Attendance.create({
      studentId: req.user.id,
      subjectId: session.subjectId._id,
      qrSessionId: session._id,
      status: 'present',
    });

    // ── Emit real-time update to admin ──
    const io = req.app.get('io');
    io.emit('student_scanned', {
      sessionId: session._id.toString(),
      studentName: student.name,
      studentId: student._id
    });

    res.status(201).json({
      message: 'Attendance marked successfully!',
      subject: session.subjectId.name,
      teacher: session.subjectId.teacher,
      markedAt: record.markedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── [STUDENT] Get my attendance summary per subject ───
router.get('/my-attendance', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Students only' });
    }

    const Student = require('../models/Student');
    const student = await Student.findById(req.user.id);

    // All subjects for this student's year
    const subjects = await Subject.find({ year: student.year });

    // All QR sessions for those subjects
    const subjectIds = subjects.map(s => s._id);
    const sessions = await QRSession.find({ subjectId: { $in: subjectIds } });

    // Build per-subject stats
    const results = await Promise.all(subjects.map(async (subject) => {
      const subjectSessions = sessions.filter(s => s.subjectId.toString() === subject._id.toString());
      const totalLectures = subjectSessions.length;

      const attended = await Attendance.countDocuments({
        studentId: req.user.id,
        subjectId: subject._id,
        status: 'present',
      });

      const missed = totalLectures - attended;
      const percentage = totalLectures > 0 ? Math.round((attended / totalLectures) * 100) : 0;

      return {
        subjectId: subject._id,
        name: subject.name,
        teacher: subject.teacher,
        totalLectures,
        attended,
        missed,
        percentage,
      };
    }));

    res.json({ attendance: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── [ADMIN] Get attendance overview for a subject ───
router.get('/subject-attendance/:subjectId', protect, adminOnly, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const sessions = await QRSession.find({ subjectId: subject._id });
    const totalLectures = sessions.length;

    const Student = require('../models/Student');
    const students = await Student.find({ year: subject.year }).select('-password');

    const rows = await Promise.all(students.map(async (student) => {
      const attended = await Attendance.countDocuments({
        studentId: student._id,
        subjectId: subject._id,
        status: 'present',
      });
      return {
        studentId: student._id,
        uid: student.uid,
        name: student.name,
        attended,
        missed: totalLectures - attended,
        percentage: totalLectures > 0 ? Math.round((attended / totalLectures) * 100) : 0,
      };
    }));

    res.json({ subject, totalLectures, rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
