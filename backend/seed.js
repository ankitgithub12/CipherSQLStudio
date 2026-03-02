require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Assignment = require('./models/Assignment');

const dataPath = path.join(__dirname, '..', 'CipherSqlStudio-assignment.json');
const assignmentsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the .env file.');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');

    console.log('Clearing old Assignments...');
    await Assignment.deleteMany({});

    console.log('Inserting new Assignments...');
    await Assignment.insertMany(assignmentsData);
    console.log('✓ MongoDB Seed Complete — inserted', assignmentsData.length, 'assignments');

    // Note: PostgreSQL sandbox tables are created on-demand per request
    // using better-sqlite3 in-memory. No seeding of PG required.

    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
