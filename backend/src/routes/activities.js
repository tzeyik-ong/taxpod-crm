const express = require('express');
const router  = express.Router();
const svc     = require('../services/activitiesService');

router.get('/', (req, res) => {
  try {
    res.json(svc.getAllActivities(req.query));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { type, description } = req.body;
    if (!type || !description?.trim()) {
      return res.status(400).json({ error: 'Type and description are required' });
    }
    res.status(201).json(svc.createActivity(req.body));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = svc.deleteActivity(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Activity not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
