const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// Attendance by Student
router.get('/attendance-by-student', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          studentName: '$student.name',
          totalDays: 1,
          presentDays: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { percentage: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance by Date (Time series)
router.get('/attendance-by-date', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }
        }
      },
      {
        $project: {
          date: '$_id',
          total: 1,
          present: 1,
          absent: 1,
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2]
          }
        }
      },
      { $sort: { date: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subject-wise Attendance
router.get('/attendance-by-subject', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$subjectId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      {
        $unwind: '$subject'
      },
      {
        $project: {
          _id: 0,
          subjectId: '$_id',
          subjectName: '$subject.name',
          total: 1,
          present: 1,
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2]
          }
        }
      },
      { $sort: { percentage: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Overall Attendance Statistics
router.get('/overall-stats', async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentCount: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          lateCount: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalRecords: 1,
          presentCount: 1,
          absentCount: 1,
          lateCount: 1,
          presentPercentage: {
            $round: [{ $multiply: [{ $divide: ['$presentCount', '$totalRecords'] }, 100] }, 2]
          },
          absentPercentage: {
            $round: [{ $multiply: [{ $divide: ['$absentCount', '$totalRecords'] }, 100] }, 2]
          }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Low Attendance Students (Below 75%)
router.get('/low-attendance', async (req, res) => {
  try {
    const threshold = req.query.threshold || 75;
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $project: {
          studentId: '$_id',
          studentName: '$student.name',
          email: '$student.email',
          totalDays: 1,
          presentDays: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] },
              2
            ]
          }
        }
      },
      {
        $match: {
          percentage: { $lt: Number(threshold) }
        }
      },
      { $sort: { percentage: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
