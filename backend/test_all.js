const { connectMongoDB, executeSandboxQuery } = require('./config/db');
require('dotenv').config();

async function test() {
  try {
    await connectMongoDB();

    // Test postgres
    console.log('Testing PG query...');
    const res = await executeSandboxQuery('SELECT 1 as num', []);
    console.log('PG query result:', res);

    // Test progress
    const UserProgress = require('./models/UserProgress');
    const p = new UserProgress({
      userId: 'test_user',
      assignmentId: '68b9cecd921ef51e88f0a0c4',
      sqlQuery: 'SELECT 1'
    });
    console.log('Testing progress save...');
    await p.save();
    console.log('Progress saved successfully');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    process.exit(0);
  }
}
test();
