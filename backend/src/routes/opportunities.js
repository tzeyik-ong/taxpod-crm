const express = require('express');
const router  = express.Router();
const svc     = require('../services/opportunitiesService');

router.get('/', (req, res) => {
  try {
    res.json(svc.getAllOpportunities(req.query));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  const opp = svc.getOpportunityById(req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  res.json(opp);
});

router.post('/', (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    res.status(201).json(svc.createOpportunity(req.body));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const opp = svc.updateOpportunity(req.params.id, req.body);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = svc.deleteOpportunity(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
