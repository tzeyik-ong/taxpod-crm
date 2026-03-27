# Architecture — CRM

## Stack

| Layer    | Technology                                | Reason                                                                    |
|----------|-------------------------------------------|---------------------------------------------------------------------------|
| Backend  | Node.js + Express                         | Lightweight, fast to build REST APIs, large ecosystem                     |
| Database | SQLite (node:sqlite built-in)             | Zero-config, file-based, no native compilation required                   |
| Frontend | React + Vite                              | Fast HMR, modern tooling, component-based UI                              |
| Styling  | Tailwind CSS                              | Utility-first, quick to build clean UI without a component library        |
| AI       | Google Gemini API (`gemini-2.5-flash`)    | Free tier via Google AI Studio, explicitly listed in brief, strong instruction follow |

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Port 5173)                      │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  Dashboard  │  │  Leads Page  │  │  Opportunities Page  │    │
│  └─────────────┘  └──────────────┘  └──────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           CRM Copilot Panel (slide-out chat)            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         │ Axios (HTTP)                          │
└─────────────────────────┼───────────────────────────────────────┘
                          │ /api/*  (proxied in dev)
┌─────────────────────────┼───────────────────────────────────────┐
│                 Express Server (Port 3001)                      │
│                                                                 │
│  ┌──────────┐  ┌───────────────┐  ┌────────────┐  ┌─────────┐   │
│  │  /leads  │  │/opportunities │  │/activities │  │/copilot │   │
│  └────┬─────┘  └───────┬───────┘  └─────┬──────┘  └─────┬───┘   │
│       │                │                │               │       │
│  ┌────▼─────────────────▼─────────────────▼──────────┐  │       │
│  │               Services Layer                      │  │       │
│  │  leadsService  │  opportunitiesService  │  ...    │  │       │
│  └────────────────────────┬──────────────────────────┘  │       │
│                           │                             │       │
│  ┌────────────────────────▼───────────────────────────┐ │       │
│  │      node:sqlite built-in (database.js singleton)  │ │       │
│  └────────────────────────┬───────────────────────────┘ │       │
│                           │                             │       │
│  ┌────────────────────────▼───────────────────────────┐ │       │
│  │              crm.db (SQLite file)                  │ │       │
│  └────────────────────────────────────────────────────┘ │       │
│                                                         │       │
│  ┌────────────────────────────────────────────────────  │       │
│  │            copilotService.js                       ◄─┘       │
│  │  1. Parse intent from user message                  │        │
│  │  2. Fetch relevant CRM data slices from DB          │        │
│  │  3. Build system prompt with JSON context           │        │
│  │  4. Call Gemini API (startChat + sendMessage)       │        │
│  │  5. Return text answer                              │        │
│  └─────────────────────────┬───────────────────────────┘        │
│                            │ HTTPS                              │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│              Google Gemini API (External)                        │
│              Model: gemini-2.5-flash                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Entity Relationship Diagram

```
┌──────────────────────┐         ┌───────────────────────────┐
│         leads        │         │       opportunities       │
├──────────────────────┤         ├───────────────────────────┤
│ id          INTEGER PK│◄───────│ id           INTEGER PK   │
│ name        TEXT      │  1:N   │ title        TEXT         │
│ email       TEXT      │        │ value        REAL (RM)    │
│ company     TEXT      │        │ stage        TEXT         │
│ phone       TEXT      │        │ lead_id      INTEGER FK   │
│ status      TEXT      │        │ notes        TEXT         │
│ notes       TEXT      │        │ expected_close_date TEXT  │
│ created_at  TEXT      │        │ created_at   TEXT         │
│ updated_at  TEXT      │        │ updated_at   TEXT         │
└──────────┬────────────┘        └──────────┬────────────────┘
           │                                │
           │ 1:N                            │ 1:N
           ▼                                ▼
┌──────────────────────────────────────────────────────────┐
│                       activities                         │
├──────────────────────────────────────────────────────────┤
│ id              INTEGER  PRIMARY KEY AUTOINCREMENT       │
│ type            TEXT     (Call / Email / Meeting / Note) │
│ description     TEXT                                     │
│ activity_date   TEXT                                     │
│ lead_id         INTEGER  FK → leads(id)     nullable     │
│ opportunity_id  INTEGER  FK → opportunities(id) nullable │
│ created_at      TEXT                                     │
└──────────────────────────────────────────────────────────┘
```

### Table Definitions

**leads**
```sql
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
```

**opportunities**
```sql
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
```

**activities**
```sql
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
```

---

## API Routes

| Method | Path                     | Description                                   |
|--------|--------------------------|-----------------------------------------------|
| GET    | `/api/leads`             | List leads (`?status=&search=`)               |
| POST   | `/api/leads`             | Create lead                                   |
| GET    | `/api/leads/:id`         | Get lead + activities                         |
| PUT    | `/api/leads/:id`         | Update lead                                   |
| DELETE | `/api/leads/:id`         | Delete lead                                   |
| GET    | `/api/opportunities`     | List opportunities grouped by stage           |
| POST   | `/api/opportunities`     | Create opportunity                            |
| GET    | `/api/opportunities/:id` | Get opportunity + activities                  |
| PUT    | `/api/opportunities/:id` | Update opportunity (incl. stage drag-drop)    |
| DELETE | `/api/opportunities/:id` | Delete opportunity                            |
| GET    | `/api/activities`        | List activities (`?lead_id=&opportunity_id=`) |
| POST   | `/api/activities`        | Log activity                                  |
| DELETE | `/api/activities/:id`    | Delete activity                               |
| GET    | `/api/dashboard`         | Aggregate stats + recent activity feed        |
| POST   | `/api/copilot/query`     | Natural language CRM query → AI answer        |

---

## AI Integration Design (Option A — CRM Copilot)

### Flow

```
User message → intent parsing → DB context fetch → prompt build → Gemini API → answer
```

### Intent-Based Context Fetching

Rather than dumping the entire database into the prompt, `copilotService.js` inspects the user message for keywords and fetches only relevant data:

| Keyword detected                              | Data fetched                            |
|-----------------------------------------------|-----------------------------------------|
| `lead`, `contact`, `prospect`, `customer`     | All leads (capped at 100)               |
| `opportunit`, `deal`, `pipeline`              | All opportunities with joined lead name |
| `activit`, `call`, `email`, `meeting`, `note` | Last 50 activities                      |
| `dashboard`, `total`, `value`, `summary`      | Dashboard aggregates                    |
| (fallback)                                    | All three summaries                     |

### System Prompt Template

```
You are a CRM assistant for YYC taxPOD, a Malaysian tax advisory firm.
You help staff query and understand their CRM data.

Rules:
- Answer ONLY using the CRM data in the <context> block below.
- If the data is insufficient, say so clearly. Never invent records.
- Be concise. Use bullet points for lists of records.
- Format currency as "RM X,XXX".
- Do not answer questions unrelated to the CRM.

<context>
{JSON snapshot of relevant CRM data}
</context>
```

### API Call

```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: buildSystemPrompt(contextSnapshot),
});
// Convert history: OpenAI 'assistant' role → Gemini 'model' role
const geminiHistory = conversationHistory.map(m => ({
  role:  m.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: m.content }],
}));
const chat   = model.startChat({ history: geminiHistory });
const result = await chat.sendMessage(userMessage);
const answer = result.response.text();
```

### Multi-Turn Support

The frontend (`CopilotPanel.jsx`) maintains a local `messages[]` array in Zustand state. Each request sends the full history so the model can answer follow-up questions in context. The panel is resizable — the user can drag its left edge to adjust the width.

### Error Handling Strategy

| Scenario                       | Handling                                                   |
|--------------------------------|------------------------------------------------------------|
| Missing `GEMINI_API_KEY`  | Return HTTP 503 with "Copilot is not configured"           |
| Gemini rate limit / 5xx   | Catch, return HTTP 502 with user-friendly message          |
| Empty CRM data                 | System prompt note: "The CRM currently has no data."       |
| Response too long              | `max_tokens: 1024` cap + client-side scroll                |
| Context too large (>6k tokens) | Truncate to most recent N rows, append `[Results trimmed]` |

---

## What I Would Do Differently With More Time

1. **Authentication** — Add JWT-based auth with role support (Admin / Sales). Currently a single hardcoded user is used.
2. **Multi-turn copilot with full history sent to backend** — Currently history is managed client-side; moving it server-side with a session ID would be more robust.
3. **Real-time updates** — Use WebSockets or Server-Sent Events so the activity feed and Kanban update live across browser tabs.
4. **Pagination** — All list endpoints return all rows; production would need cursor-based pagination.
5. **Migration versioning** — Replace `CREATE TABLE IF NOT EXISTS` with a proper migration tool (e.g., `db-migrate`) for safe schema evolution.
6. **Test coverage** — Add integration tests for service layer and E2E tests for critical user flows.
7. **Richer Copilot** — Use Gemini's function calling to let the AI query the DB directly rather than relying on keyword-based pre-fetching.
