const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// GET /api/assignments
// Fetch all available assignments (listing page)
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find({}, 'title description question');
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
});

// GET /api/assignments/:id
// Fetch specific assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (err) {
    console.error(`Error fetching assignment ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error fetching assignment' });
  }
});

module.exports = router;
