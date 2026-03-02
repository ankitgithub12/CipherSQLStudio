require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenAI } = require("@google/genai");

// POST /api/hint
// Retrieve a hint from the LLM based on user query and expected solution/question
router.post('/', async (req, res) => {
  const { question, userQuery, expectedOutput } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required for context.' });
  }

  const provider = process.env.LLM_PROVIDER || 'gemini';
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'LLM API Key is not configured on the server.' });
  }

  const prompt = `
    You are an intelligent SQL tutor assisting a student.
    The student is asked to solve this problem: "${question}"
    
    The student's current query is: 
    \`\`\`sql
    ${userQuery || '(Blank - no query started yet)'}
    \`\`\`

    Provide a helpful hint to guide the student towards the correct query. 
    CRITICAL INSTRUCTION: Do NOT provide the complete solution. Guide them, point out syntax errors, or suggest functions to use. Keep it under 3 sentences.
    `;

  try {
    let hintText = '';

    if (provider.toLowerCase() === 'gemini') {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      hintText = response.text;

    } else if (provider.toLowerCase() === 'openai') {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: prompt }]
        },
        {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        }
      );
      hintText = response.data.choices[0].message.content;
    } else {
      return res.status(500).json({ error: 'Unsupported LLM Provider' });
    }

    res.json({ hint: hintText });
  } catch (err) {
    console.error('LLM API Error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate hint from the LLM service.' });
  }
});

module.exports = router;
