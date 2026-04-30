const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');
const Student = require('./models/Student');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_management';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Admin.deleteMany({});
    await Student.deleteMany({});
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
      {
        uid: '2023300208',
        name: 'Heet Shah',
        password: 'student123',
        year: 2,
      },
      {
        uid: '2023300209',
        name: 'Priya Singh',
        password: 'student123',
        year: 2,
      },
      {
        uid: '2023300210',
        name: 'Rohit Verma',
        password: 'student123',
        year: 2,
      },
      {
        uid: '2023300211',
        name: 'Neha Gupta',
        password: 'student123',
        year: 3,
      },
      {
        uid: '2023300212',
        name: 'Vikram Joshi',
        password: 'student123',
        year: 4,
      },
    ]);
    console.log(`🎓 Created ${students.length} student accounts`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SEED DATA SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Admin Credentials:');
    console.log('   Username: admin | Password: admin');
    console.log('\n🎓 Student Credentials (all passwords: student123):');
    students.forEach(s => {
      console.log(`   UID: ${s.uid} - ${s.name} (Year ${s.year})`);
    });
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
