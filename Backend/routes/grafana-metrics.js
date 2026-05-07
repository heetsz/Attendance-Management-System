const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// 1. GAUGE: Real-time Attendance Rate (Today)
router.get('/attendance-gauge', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayData = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          present: 1,
          percentage: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }
            ]
          }
        }
      }
    ]);
    
    res.json(todayData[0] || { total: 0, present: 0, percentage: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. KEY METRICS
router.get('/key-metrics', async (req, res) => {
  try {
    const totalRecords = await Attendance.countDocuments();
    const uniqueStudents = await Attendance.distinct('studentId');
    const uniqueSubjects = await Attendance.distinct('subjectId');
    
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentCount: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          lateCount: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      }
    ]);
    
    const stat = stats[0] || {};
    
    res.json({
      totalRecords,
      uniqueStudents: uniqueStudents.length,
      uniqueSubjects: uniqueSubjects.length,
      presentCount: stat.presentCount || 0,
      absentCount: stat.absentCount || 0,
      lateCount: stat.lateCount || 0,
      averageAttendance: totalRecords > 0 ? 
        Math.round((stat.presentCount / totalRecords) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. WEEKLY TREND
router.get('/weekly-trend', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const data = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          percentage: {
            $round: [
              { $multiply: [{ $divide: [
                { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                { $sum: 1 }
              ] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. TOP PERFORMERS
router.get('/top-performers', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
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
      { $unwind: '$student' },
      {
        $project: {
          studentId: '$_id',
          studentName: '$student.name',
          totalDays: 1,
          presentDays: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }, 1] }
        }
      },
      { $match: { percentage: { $gte: 90 } } },
      { $sort: { percentage: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. LOW PERFORMERS
router.get('/low-performers', async (req, res) => {
  try {
    const threshold = req.query.threshold || 75;
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
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
      { $unwind: '$student' },
      {
        $project: {
          studentId: '$_id',
          studentName: '$student.name',
          email: '$student.email',
          totalDays: 1,
          presentDays: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }, 1] }
        }
      },
      { $match: { percentage: { $lt: Number(threshold) } } },
      { $sort: { percentage: 1 } },
      { $limit: 15 }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. STATUS DISTRIBUTION (Pie Chart)
router.get('/status-distribution', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    const result = data.map(item => ({
      status: item._id,
      count: item.count,
      percentage: ((item.count / total) * 100).toFixed(1)
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. SUBJECT PERFORMANCE
router.get('/subject-performance', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$subjectId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
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
      { $unwind: '$subject' },
      {
        $project: {
          subjectName: '$subject.name',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }
        }
      },
      { $sort: { percentage: -1 } }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. MONTHLY TREND
router.get('/monthly-trend', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
        }
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          total: 1,
          present: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. CLASS OCCUPANCY TODAY
router.get('/class-occupancy', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const data = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: '$subjectId',
          studentCount: { $addToSet: '$studentId' }
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
      { $unwind: '$subject' },
      {
        $project: {
          subjectName: '$subject.name',
          occupancy: { $size: '$studentCount' }
        }
      },
      { $sort: { occupancy: -1 } }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. STUDENT RANKINGS
router.get('/student-rankings', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
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
      { $unwind: '$student' },
      {
        $project: {
          studentName: '$student.name',
          email: '$student.email',
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }, 1] }
        }
      },
      { $sort: { percentage: -1 } }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LEGACY ENDPOINTS (kept for compatibility)

// Attendance by Student
router.get('/attendance-by-student', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
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
      { $unwind: '$student' },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          studentName: '$student.name',
          totalDays: 1,
          presentDays: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }, 2] }
        }
      },
      { $sort: { percentage: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance by Date
router.get('/attendance-by-date', async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
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
          percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2] }
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
      { $unwind: '$subject' },
      {
        $project: {
          _id: 0,
          subjectId: '$_id',
          subjectName: '$subject.name',
          total: 1,
          present: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2] }
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
          presentPercentage: { $round: [{ $multiply: [{ $divide: ['$presentCount', '$totalRecords'] }, 100] }, 2] },
          absentPercentage: { $round: [{ $multiply: [{ $divide: ['$absentCount', '$totalRecords'] }, 100] }, 2] }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Low Attendance Students
router.get('/low-attendance', async (req, res) => {
  try {
    const threshold = req.query.threshold || 75;
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
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
      { $unwind: '$student' },
      {
        $project: {
          studentId: '$_id',
          studentName: '$student.name',
          email: '$student.email',
          totalDays: 1,
          presentDays: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }, 2] }
        }
      },
      { $match: { percentage: { $lt: Number(threshold) } } },
      { $sort: { percentage: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
