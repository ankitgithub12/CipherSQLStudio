require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongoDB } = require('./config/db');

const assignmentRoutes = require('./routes/assignmentRoutes');
const executionRoutes = require('./routes/executionRoutes');
const hintRoutes = require('./routes/hintRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/hint', hintRoutes);
app.use('/api/progress', progressRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CipherSQLStudio Backend is running' });
});

// Start Servers
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
