const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db/database');

const MODEL = 'gemini-2.5-flash';

/**
 * Inspect the user message and fetch only the CRM data slices
 * that are relevant — avoids sending the whole DB on every request.
 */
function buildContextSnapshot(message) {
  const msg = message.toLowerCase();
  const snapshot = {};

  const wantsLeads =
    msg.includes('lead') || msg.includes('contact') ||
    msg.includes('prospect') || msg.includes('customer');

  const wantsOpps =
    msg.includes('opportunit') || msg.includes('deal') ||
    msg.includes('pipeline') || msg.includes('stage') || msg.includes('proposal');

  const wantsActivities =
    msg.includes('activit') || msg.includes('call') ||
    msg.includes('email') || msg.includes('meeting') || msg.includes('note');

  const wantsSummary =
    msg.includes('total') || msg.includes('dashboard') ||
    msg.includes('summary') || msg.includes('overview') || msg.includes('how many');

  if (wantsLeads || (!wantsLeads && !wantsOpps && !wantsActivities)) {
    snapshot.leads = db.prepare(
      'SELECT id, name, email, company, status, created_at FROM leads ORDER BY created_at DESC LIMIT 100'
    ).all();
  }

  if (wantsOpps || (!wantsLeads && !wantsOpps && !wantsActivities)) {
    snapshot.opportunities = db.prepare(`
      SELECT o.id, o.title, o.value, o.stage, o.expected_close_date,
             l.name AS lead_name, l.company AS lead_company
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      ORDER BY o.created_at DESC
    `).all();
  }

  if (wantsActivities) {
    snapshot.activities = db.prepare(`
      SELECT a.type, a.description, a.activity_date,
             l.name AS lead_name, o.title AS opportunity_title
      FROM activities a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN opportunities o ON a.opportunity_id = o.id
      ORDER BY a.activity_date DESC LIMIT 50
    `).all();
  }

  if (wantsSummary || Object.keys(snapshot).length === 0) {
    snapshot.stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM leads)                                                   AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'Lead')                             AS leads_count,
        (SELECT COUNT(*) FROM leads WHERE status = 'Prospect')                         AS prospects_count,
        (SELECT COUNT(*) FROM leads WHERE status = 'Customer')                         AS customers_count,
        (SELECT COUNT(*) FROM opportunities)                                            AS total_opportunities,
        (SELECT COUNT(*) FROM opportunities WHERE stage NOT IN ('Won','Lost'))          AS open_opportunities,
        (SELECT COALESCE(SUM(value),0) FROM opportunities WHERE stage NOT IN ('Won','Lost')) AS pipeline_value,
        (SELECT COALESCE(SUM(value),0) FROM opportunities WHERE stage = 'Won')         AS won_value
    `).get();
  }

  return snapshot;
}

function buildSystemPrompt(contextSnapshot) {
  const contextJson = JSON.stringify(contextSnapshot, null, 2);

  return `You are a CRM assistant for YYC taxPOD, a Malaysian tax advisory and e-learning firm.
You help sales staff query and understand their CRM data.

Rules:
- Answer ONLY using the CRM data provided in the <context> block below.
- If the data does not contain enough information to answer, say so clearly. Never invent records.
- Be concise. Use bullet points for lists of records.
- Format currency as "RM X,XXX" (e.g., RM 10,000).
- When listing contacts, include their name, company, and status.
- Do not answer questions unrelated to the CRM.

<context>
${contextJson}
</context>`;
}

async function queryCopilot(userMessage, conversationHistory = []) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const contextSnapshot = buildContextSnapshot(userMessage);
  const systemPrompt    = buildSystemPrompt(contextSnapshot);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
  });

  // Convert OpenAI-style history (role: 'assistant') to Gemini format (role: 'model')
  const geminiHistory = conversationHistory.map(m => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat   = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(userMessage);

  return {
    answer:       result.response.text(),
    context_used: Object.keys(contextSnapshot).join(', '),
  };
}

module.exports = { queryCopilot };
