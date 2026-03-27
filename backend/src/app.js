const express = require('express');
const cors = require('cors');
const { runMigrations } = require('./db/migrations');

const leadsRouter        = require('./routes/leads');
const opportunitiesRouter = require('./routes/opportunities');
const activitiesRouter   = require('./routes/activities');
const dashboardRouter    = require('./routes/dashboard');
const copilotRouter      = require('./routes/copilot');

const app = express();

app.use(cors());
app.use(express.json());

runMigrations();

app.use('/api/leads',         leadsRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/activities',    activitiesRouter);
app.use('/api/dashboard',     dashboardRouter);
app.use('/api/copilot',       copilotRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
