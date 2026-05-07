const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL;

const buildSystemPrompt = () => {
  return [
    'You are an admin dashboard assistant for an Attendance Management System.',
    'You will be given the current dashboard state (selected tab/year/subject and any loaded attendance rows).',
    'Answer ONLY using the provided dashboard state. If the information is missing, say what is missing and how to obtain it (e.g., open the Check Attendance tab, select year/subject).',
    'Be concise and practical.',
    'If asked for a specific student attendance, search within the provided attendance rows by name/uid and report attended/missed/percentage and total lectures when available.',
  ].join('\n');
};

router.get('/health', protect, adminOnly, (req, res) => {
  res.json({
    configured: Boolean(process.env.GROQ_API_KEY),
    model: GROQ_MODEL,
    apiUrl: GROQ_API_URL,
  });
});

router.post('/chat', protect, adminOnly, async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Groq is not configured on the server (missing GROQ_API_KEY).' });
    }

    if (!GROQ_MODEL) {
      return res.status(500).json({
        message: 'Groq is not configured on the server (missing GROQ_MODEL). Set GROQ_MODEL to an available model from your Groq console.',
      });
    }

    const { messages, dashboardState } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages[] is required' });
    }

    // Basic validation/sanitization
    const cleanedMessages = messages
      .filter(m => m && typeof m === 'object')
      .map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : '',
      }))
      .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content.trim().length > 0)
      .slice(-20);

    if (cleanedMessages.length === 0) {
      return res.status(400).json({ message: 'No valid messages provided' });
    }

    const contextMessage = {
      role: 'user',
      content: `Dashboard state (JSON):\n${JSON.stringify(dashboardState || {}, null, 2)}`,
    };

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        contextMessage,
        ...cleanedMessages,
      ],
    };

    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!groqRes.ok) {
      let details = '';
      const contentType = groqRes.headers.get('content-type') || '';
      try {
        if (contentType.includes('application/json')) {
          const errJson = await groqRes.json();
          details = JSON.stringify(errJson);
        } else {
          details = await groqRes.text();
        }
      } catch {
        // ignore
      }

      return res.status(502).json({
        message: 'Groq request failed',
        groqStatus: groqRes.status,
        details: (details || '').slice(0, 4000),
      });
    }

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ message: 'Groq returned no content' });
    }

    res.json({ message: content });
  } catch (err) {
    console.error('Groq chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
