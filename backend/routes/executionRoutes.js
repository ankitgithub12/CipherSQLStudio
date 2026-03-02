const express = require('express');
const router = express.Router();
const { executeSandboxQuery } = require('../config/db');
const Assignment = require('../models/Assignment');

// Basic SQL injection validation — only SELECT queries allowed
const containsForbiddenKeywords = (query) => {
  const upper = query.toUpperCase().trim();
  const forbidden = ['DROP', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'GRANT', 'REVOKE'];
  return forbidden.some(word => upper.includes(word));
};

// POST /api/execute
// Execute a SELECT query against a PostgreSQL sandbox schema seeded with the
// assignment's sample tables. Requires { query, assignmentId } in the body.
router.post('/', async (req, res) => {
  const { query, assignmentId } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Valid SQL query is required' });
  }

  if (containsForbiddenKeywords(query)) {
    return res.status(403).json({
      error: 'This sandbox only allows SELECT queries. Modification queries are forbidden.'
    });
  }

  // Fetch assignment to get sampleTables for the sandbox
  let sampleTables = [];
  if (assignmentId) {
    try {
      const assignment = await Assignment.findById(assignmentId).lean();
      if (assignment && assignment.sampleTables) {
        sampleTables = assignment.sampleTables;
      }
    } catch (err) {
      console.error('Could not load assignment sampleTables:', err.message);
    }
  }

  try {
    const result = await executeSandboxQuery(query, sampleTables);
    res.json(result);
  } catch (err) {
    console.error('Execution Database Error:', err);
    // Surface DB errors back to the student (helpful for learning)
    res.status(400).json({ error: err.message || 'Execution error' });
  }
});

module.exports = router;
