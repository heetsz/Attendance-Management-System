const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Timetable = require('./models/Timetable');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_management';

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
  ],
  Tuesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '10:00', endTime: '11:00', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '11:15', endTime: '12:15', subject: 'Theory of Computation', teacher: 'Dr. Meena Joshi' },
    { startTime: '13:00', endTime: '14:00', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
  ],
  Wednesday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
    { startTime: '10:00', endTime: '11:00', subject: 'Theory of Computation', teacher: 'Dr. Meena Joshi' },
    { startTime: '11:15', endTime: '12:15', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '13:00', endTime: '14:00', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
  ],
  Thursday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Theory of Computation', teacher: 'Dr. Meena Joshi' },
    { startTime: '10:00', endTime: '11:00', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
    { startTime: '11:15', endTime: '12:15', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '13:00', endTime: '14:00', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
  ],
  Friday: [
    { startTime: '09:00', endTime: '10:00', subject: 'Software Engineering', teacher: 'Dr. Anita Desai' },
    { startTime: '10:00', endTime: '11:00', subject: 'Machine Learning', teacher: 'Prof. Anil Mehta' },
    { startTime: '11:15', endTime: '12:15', subject: 'Web Development', teacher: 'Prof. Suresh Kumar' },
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

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Subject.deleteMany({});
    await Timetable.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed single Admin
    await Admin.create({
      username: 'admin',
      password: 'admin',
      name: 'Administrator',
    });
    console.log('👑 Created admin account');

    // Seed Students (all with default password "student123")
    const students = await Student.create([
      { uid: '2023300208', name: 'Heet Shah',     password: 'student123', year: 2 },
      { uid: '2023300209', name: 'Priya Singh',   password: 'student123', year: 2 },
      { uid: '2023300210', name: 'Rohit Verma',   password: 'student123', year: 2 },
      { uid: '2023300211', name: 'Neha Gupta',    password: 'student123', year: 3 },
      { uid: '2023300212', name: 'Vikram Joshi',  password: 'student123', year: 4 },
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
