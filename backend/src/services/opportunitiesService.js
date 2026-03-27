const db = require('../db/database');

const WITH_LEAD = `
  SELECT o.*, l.name AS lead_name, l.company AS lead_company
  FROM opportunities o
  LEFT JOIN leads l ON o.lead_id = l.id
`;

function getAllOpportunities({ lead_id } = {}) {
  let query = WITH_LEAD + ' WHERE 1=1';
  const params = [];

  if (lead_id) {
    query += ' AND o.lead_id = ?';
    params.push(lead_id);
  }

  query += ' ORDER BY o.created_at DESC';
  return db.prepare(query).all(...params);
}

function getOpportunityById(id) {
  const opp = db.prepare(WITH_LEAD + ' WHERE o.id = ?').get(id);
  if (!opp) return null;

  const activities = db.prepare(
    'SELECT * FROM activities WHERE opportunity_id = ? ORDER BY activity_date DESC'
  ).all(id);

  return { ...opp, activities };
}

function createOpportunity({ title, value = 0, stage = 'New', lead_id, notes, expected_close_date }) {
  const result = db.prepare(`
    INSERT INTO opportunities (title, value, stage, lead_id, notes, expected_close_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, value, stage, lead_id || null, notes || null, expected_close_date || null);

  return getOpportunityById(result.lastInsertRowid);
}

function updateOpportunity(id, fields) {
  const allowed = ['title', 'value', 'stage', 'lead_id', 'notes', 'expected_close_date'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return getOpportunityById(id);

  const setClauses = [...keys.map(k => `${k} = ?`), "updated_at = datetime('now')"];
  const values = keys.map(k => fields[k]);

  db.prepare(`UPDATE opportunities SET ${setClauses.join(', ')} WHERE id = ?`).run(...values, id);
  return getOpportunityById(id);
}

function deleteOpportunity(id) {
  return db.prepare('DELETE FROM opportunities WHERE id = ?').run(id);
}

module.exports = {
  getAllOpportunities, getOpportunityById,
  createOpportunity, updateOpportunity, deleteOpportunity
};
