const mongoose = require('mongoose');
require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Timetable = require('./models/Timetable');
const QRSession = require('./models/QRSession');
const Attendance = require('./models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_management';

// ─── Year 3 Student Roster (as provided) ───
// All passwords default to "student123" for seeded accounts
const YEAR_3_STUDENTS = [
  { uid: '2023300195', name: 'Vishwajit Sarnobat' },
  { uid: '2023300196', name: 'Ansh Santosh Savarkar' },
  { uid: '2023300197', name: 'Arsalan Sayed' },
  { uid: '2023300198', name: 'Asmiya Kadir Sayyad' },
  { uid: '2023300199', name: 'Hetanshi Shah' },
  { uid: '2023300200', name: 'Aaryan Shah' },
  { uid: '2023300201', name: 'Aayush Pritesh Shah' },
  { uid: '2023300202', name: 'Bhavya Tushar Shah' },
  { uid: '2023300203', name: 'Devansh Shah' },
  { uid: '2023300204', name: 'Dhruv Suchitkumar Shah' },
  { uid: '2023300205', name: 'Hardik Rahul Shah' },
  { uid: '2023300206', name: 'Harshal Samir Shah' },
  { uid: '2023300207', name: 'Harshav Kunal Shah' },
  { uid: '2023300208', name: 'Heet Shah' },
  { uid: '2023300209', name: 'Heet Prakash Shah' },
  { uid: '2023300210', name: 'Het Shah' },
  { uid: '2023300211', name: 'Shah Hitarth Jinendra' },
  { uid: '2023300212', name: 'Jash Samir Shah' },
  { uid: '2024301008', name: 'Saina Abdul Hamid' },
  { uid: '2024301020', name: 'Kalpak Shankar Patil' },
];

// ─── Year 2 Timetable (Heet's year) — Full week ───
const YEAR_2_TIMETABLE = {
  Monday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Data Structures', teacher: 'Dr. Sunita Rao' },
    { startTime: '10:00', endTime: '11:00', subject: 'Operating Systems', teacher: 'Prof. Rajesh Sharma' },
    { startTime: '11:15', endTime: '12:15', subject: 'Database Management', teacher: 'Dr. Kavita Patel' },
    { startTime: '13:00', endTime: '14:00', subject: 'Computer Networks', teacher: 'Prof. Deepak Verma' },
    { startTime: '14:00', endTime: '15:00', subject: 'Mathematics III', teacher: 'Dr. Priya Nair' },
  ],
  Tuesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Operating Systems', teacher: 'Prof. Rajesh Sharma' },
    { startTime: '10:00', endTime: '11:00', subject: 'Data Structures', teacher: 'Dr. Sunita Rao' },
    { startTime: '11:15', endTime: '12:15', subject: 'Mathematics III', teacher: 'Dr. Priya Nair' },
    { startTime: '13:00', endTime: '14:00', subject: 'Database Management', teacher: 'Dr. Kavita Patel' },
    { startTime: '14:00', endTime: '15:00', subject: 'Computer Networks', teacher: 'Prof. Deepak Verma' },
  ],
  Wednesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Database Management', teacher: 'Dr. Kavita Patel' },
    { startTime: '10:00', endTime: '11:00', subject: 'Computer Networks', teacher: 'Prof. Deepak Verma' },
    { startTime: '11:15', endTime: '12:15', subject: 'Data Structures', teacher: 'Dr. Sunita Rao' },
    { startTime: '13:00', endTime: '14:00', subject: 'Mathematics III', teacher: 'Dr. Priya Nair' },
    { startTime: '14:00', endTime: '15:00', subject: 'Operating Systems', teacher: 'Prof. Rajesh Sharma' },
  ],
  Thursday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Mathematics III', teacher: 'Dr. Priya Nair' },
    { startTime: '10:00', endTime: '11:00', subject: 'Database Management', teacher: 'Dr. Kavita Patel' },
    { startTime: '11:15', endTime: '12:15', subject: 'Operating Systems', teacher: 'Prof. Rajesh Sharma' },
    { startTime: '13:00', endTime: '14:00', subject: 'Data Structures', teacher: 'Dr. Sunita Rao' },
    { startTime: '14:00', endTime: '15:00', subject: 'Computer Networks', teacher: 'Prof. Deepak Verma' },
  ],
  Friday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Computer Networks', teacher: 'Prof. Deepak Verma' },
    { startTime: '10:00', endTime: '11:00', subject: 'Mathematics III', teacher: 'Dr. Priya Nair' },
    { startTime: '11:15', endTime: '12:15', subject: 'Database Management', teacher: 'Dr. Kavita Patel' },
    { startTime: '13:00', endTime: '14:00', subject: 'Operating Systems', teacher: 'Prof. Rajesh Sharma' },
    { startTime: '14:00', endTime: '15:00', subject: 'Data Structures', teacher: 'Dr. Sunita Rao' },
  ],
};

// ─── Year 1 Timetable ───
const YEAR_1_TIMETABLE = {
  Monday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Engineering Mathematics I', teacher: 'Prof. Anil Mehta' },
    { startTime: '10:00', endTime: '11:00', subject: 'Physics', teacher: 'Dr. Meena Joshi' },
    { startTime: '11:15', endTime: '12:15', subject: 'Programming in C', teacher: 'Prof. Suresh Kumar' },
    { startTime: '13:00', endTime: '14:00', subject: 'Engineering Drawing', teacher: 'Prof. Vikram Singh' },
  ],
  Tuesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Physics', teacher: 'Dr. Meena Joshi' },
    { startTime: '10:00', endTime: '11:00', subject: 'Engineering Mathematics I', teacher: 'Prof. Anil Mehta' },
    { startTime: '11:15', endTime: '12:15', subject: 'Engineering Drawing', teacher: 'Prof. Vikram Singh' },
    { startTime: '13:00', endTime: '14:00', subject: 'Programming in C', teacher: 'Prof. Suresh Kumar' },
  ],
  Wednesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Programming in C', teacher: 'Prof. Suresh Kumar' },
    { startTime: '10:00', endTime: '11:00', subject: 'Engineering Drawing', teacher: 'Prof. Vikram Singh' },
    { startTime: '11:15', endTime: '12:15', subject: 'Physics', teacher: 'Dr. Meena Joshi' },
    { startTime: '13:00', endTime: '14:00', subject: 'Engineering Mathematics I', teacher: 'Prof. Anil Mehta' },
  ],
  Thursday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Engineering Drawing', teacher: 'Prof. Vikram Singh' },
    { startTime: '10:00', endTime: '11:00', subject: 'Programming in C', teacher: 'Prof. Suresh Kumar' },
    { startTime: '11:15', endTime: '12:15', subject: 'Engineering Mathematics I', teacher: 'Prof. Anil Mehta' },
    { startTime: '13:00', endTime: '14:00', subject: 'Physics', teacher: 'Dr. Meena Joshi' },
  ],
  Friday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Engineering Mathematics I', teacher: 'Prof. Anil Mehta' },
    { startTime: '10:00', endTime: '11:00', subject: 'Physics', teacher: 'Dr. Meena Joshi' },
    { startTime: '11:15', endTime: '12:15', subject: 'Programming in C', teacher: 'Prof. Suresh Kumar' },
  ],
};

// ─── Year 3 Timetable ───
const YEAR_3_TIMETABLE = {
  Monday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '10:00', endTime: '11:00', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '11:15', endTime: '12:15', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
    { startTime: '13:00', endTime: '14:00', subject: 'Theory of Computation', teacher: 'Dr. Meena Joshi' },
    { startTime: '14:00', endTime: '15:00', subject: 'DevOps', teacher: 'Prof Anas Ansari' },
  ],
  Tuesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '10:00', endTime: '11:00', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '11:15', endTime: '12:15', subject: 'Theory of Computation', teacher: 'Dr. Meena Joshi' },
    { startTime: '13:00', endTime: '14:00', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
    { startTime: '14:00', endTime: '15:00', subject: 'DevOps', teacher: 'Prof Anas Ansari' },
  ],
  Wednesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
    { startTime: '10:00', endTime: '11:00', subject: 'Theory of Computation', teacher: 'Dr. Meena Joshi' },
    { startTime: '11:15', endTime: '12:15', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '13:00', endTime: '14:00', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '14:00', endTime: '15:00', subject: 'DevOps', teacher: 'Prof Anas Ansari' },
  ],
  Thursday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Theory of Computation', teacher: 'Dr. Meena Joshi' },
    { startTime: '10:00', endTime: '11:00', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
    { startTime: '11:15', endTime: '12:15', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '13:00', endTime: '14:00', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '14:00', endTime: '15:00', subject: 'DevOps', teacher: 'Prof Anas Ansari' },
  ],
  Friday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '10:00', endTime: '11:00', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '11:15', endTime: '12:15', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
    { startTime: '13:00', endTime: '14:00', subject: 'DevOps', teacher: 'Prof Anas Ansari' },
  ],
};

// ─── Year 4 Timetable ───
const YEAR_4_TIMETABLE = {
  Monday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Cloud Computing', teacher: 'Prof. Vikram Singh' },
    { startTime: '10:00', endTime: '11:00', subject: 'Artificial Intelligence', teacher: 'Dr. Kavita Patel' },
    { startTime: '11:15', endTime: '12:15', subject: 'Cyber Security', teacher: 'Prof. Deepak Verma' },
  ],
  Tuesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Artificial Intelligence', teacher: 'Dr. Kavita Patel' },
    { startTime: '10:00', endTime: '11:00', subject: 'Cyber Security', teacher: 'Prof. Deepak Verma' },
    { startTime: '11:15', endTime: '12:15', subject: 'Cloud Computing', teacher: 'Prof. Vikram Singh' },
  ],
  Wednesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Cyber Security', teacher: 'Prof. Deepak Verma' },
    { startTime: '10:00', endTime: '11:00', subject: 'Cloud Computing', teacher: 'Prof. Vikram Singh' },
    { startTime: '11:15', endTime: '12:15', subject: 'Artificial Intelligence', teacher: 'Dr. Kavita Patel' },
  ],
  Thursday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Cloud Computing', teacher: 'Prof. Vikram Singh' },
    { startTime: '10:00', endTime: '11:00', subject: 'Artificial Intelligence', teacher: 'Dr. Kavita Patel' },
    { startTime: '11:15', endTime: '12:15', subject: 'Cyber Security', teacher: 'Prof. Deepak Verma' },
  ],
  Friday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Artificial Intelligence', teacher: 'Dr. Kavita Patel' },
    { startTime: '10:00', endTime: '11:00', subject: 'Cloud Computing', teacher: 'Prof. Vikram Singh' },
  ],
};

const ALL_TIMETABLES = {
  1: YEAR_1_TIMETABLE,
  2: YEAR_2_TIMETABLE,
  3: YEAR_3_TIMETABLE,
  4: YEAR_4_TIMETABLE,
};

const hashStringToUint32 = (input) => {
  // Small deterministic hash (FNV-1a style)
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededFloat01 = (seedStr) => {
  // xorshift32 -> [0,1)
  let x = hashStringToUint32(seedStr) || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  // 2^32
  return (x >>> 0) / 4294967296;
};

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Subject.deleteMany({});
    await Timetable.deleteMany({});
    await QRSession.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed single Admin
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin',
      name: 'Administrator',
    });
    console.log('👑 Created admin account');

    // Seed Students (all with default password "student123")
    const students = await Student.create([
      // Year 3 roster
      ...YEAR_3_STUDENTS.map(s => ({ ...s, password: 'student123', year: 3 })),

      // Minimal demo students for other years (use non-conflicting UIDs)
      { uid: '2025300001', name: 'Year 1 Demo Student', password: 'student123', year: 1 },
      { uid: '2025300002', name: 'Year 2 Demo Student', password: 'student123', year: 2 },
      { uid: '2025300004', name: 'Year 4 Demo Student', password: 'student123', year: 4 },
    ]);
    console.log(`🎓 Created ${students.length} student accounts`);

    // ─── Seed Subjects (auto-extracted from timetables) ───
    const subjectSet = new Set();
    const subjectsToCreate = [];

    for (const [yearStr, days] of Object.entries(ALL_TIMETABLES)) {
      const year = Number(yearStr);
      for (const slots of Object.values(days)) {
        for (const slot of slots) {
          const key = `${slot.subject}__${year}`;
          if (!subjectSet.has(key)) {
            subjectSet.add(key);
            subjectsToCreate.push({ name: slot.subject, teacher: slot.teacher, year });
          }
        }
      }
    }

    await Subject.insertMany(subjectsToCreate);
    console.log(`📚 Created ${subjectsToCreate.length} subjects from timetable`);

    // ─── Seed Timetables ───
    const timetableDocs = [];
    for (const [yearStr, days] of Object.entries(ALL_TIMETABLES)) {
      const year = Number(yearStr);
      for (const [day, slots] of Object.entries(days)) {
        timetableDocs.push({ year, day, slots });
      }
    }

    await Timetable.insertMany(timetableDocs);
    console.log(`📅 Created ${timetableDocs.length} timetable entries (${Object.keys(ALL_TIMETABLES).length} years × 5 days)`);

    // ─── Seed Year 3 Attendance (QR sessions + per-student records) ───
    const year3Subjects = await Subject.find({ year: 3 }).sort({ name: 1 });
    const year3Students = students.filter(s => s.year === 3);

    const sessionsPerSubject = 12;
    const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const qrSessionsToCreate = [];
    const qrSessionMeta = [];

    year3Subjects.forEach((subject, subjectIdx) => {
      for (let sessionIdx = 0; sessionIdx < sessionsPerSubject; sessionIdx++) {
        const createdAt = new Date(Date.now() - ((sessionIdx + 1) * 24 * 60 * 60 * 1000) - (subjectIdx * 60 * 60 * 1000));
        qrSessionsToCreate.push({
          token: uuidv4(),
          subjectId: subject._id,
          year: 3,
          createdBy: admin._id,
          expiresAt: farFuture,
          active: false,
          createdAt,
          updatedAt: createdAt,
        });
        qrSessionMeta.push({ subjectName: subject.name, subjectId: subject._id, sessionIdx, createdAt });
      }
    });

    const createdSessions = await QRSession.insertMany(qrSessionsToCreate);
    console.log(`🧾 Created ${createdSessions.length} Year 3 QR sessions (${year3Subjects.length} subjects × ${sessionsPerSubject})`);

    const attendanceToCreate = [];
    createdSessions.forEach((sessionDoc, i) => {
      const meta = qrSessionMeta[i];
      year3Students.forEach((student) => {
        const r = seededFloat01(`${student.uid}|${meta.subjectName}|${meta.sessionIdx}`);
        const present = r < 0.86;
        attendanceToCreate.push({
          studentId: student._id,
          subjectId: meta.subjectId,
          qrSessionId: sessionDoc._id,
          status: present ? 'present' : 'absent',
          markedAt: new Date(meta.createdAt.getTime() + (present ? 3 : 55) * 60 * 1000),
          createdAt: new Date(meta.createdAt.getTime() + (present ? 3 : 55) * 60 * 1000),
          updatedAt: new Date(meta.createdAt.getTime() + (present ? 3 : 55) * 60 * 1000),
        });
      });
    });

    await Attendance.insertMany(attendanceToCreate);
    console.log(`✅ Seeded Year 3 attendance records: ${attendanceToCreate.length}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SEED DATA SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Admin Credentials:');
    console.log('   Username: admin | Password: admin');
    console.log('\n🎓 Student Credentials (all passwords: student123):');
    students.forEach(s => {
      console.log(`   UID: ${s.uid} - ${s.name} (Year ${s.year})`);
    });
    console.log('\n📅 Timetable Summary:');
    for (const [year, days] of Object.entries(ALL_TIMETABLES)) {
      const totalSlots = Object.values(days).reduce((sum, s) => sum + s.length, 0);
      console.log(`   Year ${year}: ${Object.keys(days).length} days, ${totalSlots} lecture slots/week`);
    }

    console.log('\n🧾 Attendance Seed Summary:');
    console.log(`   Year 3 subjects: ${year3Subjects.length}`);
    console.log(`   Year 3 sessions/subject: ${sessionsPerSubject}`);
    console.log(`   Year 3 students: ${year3Students.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('✅ Seeding complete! Database disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();
