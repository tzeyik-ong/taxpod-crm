const express = require('express');
const router  = express.Router();
const { queryCopilot } = require('../services/copilotService');

router.post('/query', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await queryCopilot(message.trim(), history);
    res.json(result);
  } catch (err) {
    if (err.message?.includes('not configured')) {
      return res.status(503).json({ error: 'CRM Copilot is not configured. Please set GEMINI_API_KEY in your .env file.' });
    }
    if (err.status === 429 || err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
      return res.status(429).json({ error: 'Rate limit reached. Please try again in a moment.' });
    }
    if (err.status >= 400 && err.status < 500) {
      const apiMsg = err.message ?? 'API error';
      console.error('[Copilot API error]', err.status, apiMsg);
      return res.status(502).json({ error: apiMsg });
    }
    console.error('[Copilot error]', err.message);
    res.status(502).json({ error: 'Copilot service error. Please try again.' });
  }
});

module.exports = router;
