const db = require('./database');

function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT,
      phone      TEXT,
      company    TEXT,
      status     TEXT    NOT NULL DEFAULT 'Lead'
                 CHECK(status IN ('Lead','Prospect','Customer')),
      notes      TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      title               TEXT    NOT NULL,
      value               REAL    NOT NULL DEFAULT 0,
      stage               TEXT    NOT NULL DEFAULT 'New'
                          CHECK(stage IN ('New','Contacted','Qualified','Proposal','Won','Lost')),
      lead_id             INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      notes               TEXT,
      expected_close_date TEXT,
      created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      type           TEXT    NOT NULL
                     CHECK(type IN ('Call','Email','Meeting','Note')),
      description    TEXT    NOT NULL,
      activity_date  TEXT    NOT NULL DEFAULT (datetime('now')),
      lead_id        INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_leads_status           ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_opportunities_stage    ON opportunities(stage);
    CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id  ON opportunities(lead_id);
    CREATE INDEX IF NOT EXISTS idx_activities_lead_id     ON activities(lead_id);
    CREATE INDEX IF NOT EXISTS idx_activities_opp_id      ON activities(opportunity_id);
  `);

  console.log('[DB] Migrations complete');
}

module.exports = { runMigrations };
