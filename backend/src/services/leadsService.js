const db = require('../db/database');

function getAllLeads({ status, search, field } = {}) {
  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    const like = `%${search}%`;
    if (field === 'name')         { query += ' AND name LIKE ?';    params.push(like); }
    else if (field === 'email')   { query += ' AND email LIKE ?';   params.push(like); }
    else if (field === 'company') { query += ' AND company LIKE ?'; params.push(like); }
    else {
      query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      params.push(like, like, like);
    }
  }

  query += ' ORDER BY created_at DESC';
  return db.prepare(query).all(...params);
}

function getLeadById(id) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!lead) return null;

  const activities = db.prepare(
    'SELECT * FROM activities WHERE lead_id = ? ORDER BY activity_date DESC'
  ).all(id);

  const opportunities = db.prepare(
    'SELECT * FROM opportunities WHERE lead_id = ? ORDER BY created_at DESC'
  ).all(id);

  return { ...lead, activities, opportunities };
}

function createLead({ name, email, phone, company, status = 'Lead', notes }) {
  const result = db.prepare(`
    INSERT INTO leads (name, email, phone, company, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, email || null, phone || null, company || null, status, notes || null);

  return getLeadById(result.lastInsertRowid);
}

function updateLead(id, fields) {
  const allowed = ['name', 'email', 'phone', 'company', 'status', 'notes'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return getLeadById(id);

  const setClauses = [...keys.map(k => `${k} = ?`), "updated_at = datetime('now')"];
  const values = keys.map(k => fields[k]);

  db.prepare(`UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`).run(...values, id);
  return getLeadById(id);
}

function deleteLead(id) {
  return db.prepare('DELETE FROM leads WHERE id = ?').run(id);
}

module.exports = { getAllLeads, getLeadById, createLead, updateLead, deleteLead };
