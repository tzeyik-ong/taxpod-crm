const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

router.get('/', (_req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM leads)                                                          AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'Lead')                                   AS leads_count,
        (SELECT COUNT(*) FROM leads WHERE status = 'Prospect')                               AS prospects_count,
        (SELECT COUNT(*) FROM leads WHERE status = 'Customer')                               AS customers_count,
        (SELECT COUNT(*) FROM opportunities)                                                  AS total_opportunities,
        (SELECT COUNT(*) FROM opportunities WHERE stage NOT IN ('Won','Lost'))                AS open_opportunities,
        (SELECT COALESCE(SUM(value),0) FROM opportunities)                                   AS total_value,
        (SELECT COALESCE(SUM(value),0) FROM opportunities WHERE stage NOT IN ('Won','Lost')) AS pipeline_value,
        (SELECT COALESCE(SUM(value),0) FROM opportunities WHERE stage = 'Won')               AS won_value
    `).get();

    const recent_activities = db.prepare(`
      SELECT a.*,
             l.name    AS lead_name,
             l.company AS lead_company,
             o.title   AS opportunity_title
      FROM activities a
      LEFT JOIN leads l        ON a.lead_id        = l.id
      LEFT JOIN opportunities o ON a.opportunity_id = o.id
      ORDER BY a.activity_date DESC
      LIMIT 10
    `).all();

    const by_stage = db.prepare(`
      SELECT stage, COUNT(*) AS count, COALESCE(SUM(value),0) AS value
      FROM opportunities
      GROUP BY stage
      ORDER BY CASE stage
        WHEN 'New' THEN 1 WHEN 'Contacted' THEN 2 WHEN 'Qualified' THEN 3
        WHEN 'Proposal' THEN 4 WHEN 'Won' THEN 5 WHEN 'Lost' THEN 6
        ELSE 7 END
    `).all();

    res.json({ ...stats, recent_activities, by_stage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
