const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');

// GET /api/progress/:userId/:assignmentId
// Fetch the user's progress for a specific assignment
router.get('/:userId/:assignmentId', async (req, res) => {
  const { userId, assignmentId } = req.params;

  try {
    const progress = await UserProgress.findOne({ userId, assignmentId });
    if (!progress) {
      return res.status(200).json({ sqlQuery: '', attemptCount: 0 }); // Default state
    }
    res.json(progress);
  } catch (err) {
    console.error(`Error fetching progress for user ${userId}, assignment ${assignmentId}:`, err);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
});

// POST /api/progress
// Save or update the user's progress for a specific assignment
router.post('/', async (req, res) => {
  const { userId, assignmentId, sqlQuery } = req.body;

  if (!userId || !assignmentId) {
    return res.status(400).json({ error: 'userId and assignmentId are required' });
  }

  try {
    // Find existing progress or create a new one
    let progress = await UserProgress.findOne({ userId, assignmentId });

    if (progress) {
      progress.sqlQuery = sqlQuery;
      progress.lastAttempt = Date.now();
      progress.attemptCount += 1;
      await progress.save();
    } else {
      progress = new UserProgress({
        userId,
        assignmentId,
        sqlQuery,
        lastAttempt: Date.now(),
        attemptCount: 1,
        // Optional logic can set isCompleted automatically by checking output against expected string
        isCompleted: false
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).json({ error: 'Server error saving progress' });
  }
});

module.exports = router;
