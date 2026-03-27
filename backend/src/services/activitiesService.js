const db = require('../db/database');

const WITH_JOINS = `
  SELECT a.*,
         l.name    AS lead_name,
         l.company AS lead_company,
         o.title   AS opportunity_title
  FROM activities a
  LEFT JOIN leads l        ON a.lead_id        = l.id
  LEFT JOIN opportunities o ON a.opportunity_id = o.id
`;

function getAllActivities({ lead_id, opportunity_id, limit = 50 } = {}) {
  let query = WITH_JOINS + ' WHERE 1=1';
  const params = [];

  if (lead_id) {
    query += ' AND a.lead_id = ?';
    params.push(lead_id);
  }
  if (opportunity_id) {
    query += ' AND a.opportunity_id = ?';
    params.push(opportunity_id);
  }

  query += ' ORDER BY a.activity_date DESC LIMIT ?';
  params.push(Number(limit));

  return db.prepare(query).all(...params);
}

function createActivity({ type, description, activity_date, lead_id, opportunity_id }) {
  const result = db.prepare(`
    INSERT INTO activities (type, description, activity_date, lead_id, opportunity_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    type,
    description,
    activity_date || new Date().toISOString(),
    lead_id        || null,
    opportunity_id || null
  );

  return db.prepare(WITH_JOINS + ' WHERE a.id = ?').get(result.lastInsertRowid);
}

function deleteActivity(id) {
  return db.prepare('DELETE FROM activities WHERE id = ?').run(id);
}

module.exports = { getAllActivities, createActivity, deleteActivity };
