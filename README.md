# CRM

A lightweight CRM system with AI integration built for YYC taxPOD. Manages leads, opportunities, activities, and includes an AI-powered CRM Copilot backed by Google Gemini Flash.

---

## Prerequisites

| Tool                         | Version                               | Download                                                                                |
|------------------------------|---------------------------------------|-----------------------------------------------------------------------------------------|
| **Node.js** (includes npm)   | v22.5 or later (v24 recommended)      | [nodejs.org/en/download](https://nodejs.org/en/download)                                |
| **Gemini API key**           |                   —                   | [aistudio.google.com](https://aistudio.google.com) — free tier, no credit card required |

> **Verify your setup** after installing Node.js:
> ```bash
> node -v   # should print v22.5.0 or higher
> npm -v    # should print 8.0 or higher
> ```

---

## Quick Start

### 1. Clone / extract the project

```bash
cd path/to/taxpod-crm
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your key:
```
PORT=3001
GEMINI_API_KEY=AIza...your key here...
```

Start the backend:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`. The SQLite database (`crm.db`) is created automatically on first run.

### 3. Set up the frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at **http://localhost:5173**

---

## Features

### Core CRM Modules

| Module            | What you can do                                                                                                                          |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **Leads**         | Create, edit, delete leads · Phone with country code picker · Search by all fields or name/email/company · Filter by status              |
| **Opportunities** | Kanban board with 6 stages · Drag cards to change stage · Stage-colored card border · Hover to reveal edit/delete actions                |
| **Activities**    | Log calls, emails, meetings, notes · Colored type badge · Click activity on dashboard to jump and highlight the entry                    |
| **Dashboard**     | Live stats with info tooltips · Collapsible per-stage pipeline breakdown · Recent activity feed with hover detail popover                |

### AI — CRM Copilot (Option A)

A slide-out chat panel powered by **Google Gemini** (`gemini-2.5-flash`).

**How to trigger it:**

Click **"CRM Copilot (AI)"** at the bottom of the sidebar.

The panel slides in from the right and can be **resized** by dragging its left edge.

**Example questions to ask:**
- *"Summarise my pipeline"*
- *"Which leads are still in Prospect status?"*
- *"Show all opportunities above RM 10,000"*
- *"How many open opportunities do I have?"*
- *"What activities were logged this week?"*

The Copilot fetches live CRM data, passes it as context to the model, and returns a natural language answer. Multi-turn follow-up questions are supported within the same session.

---

## Project Structure

```
taxpod-crm/
├── backend/
│   ├── src/
│   │   ├── db/           # SQLite connection + migrations (auto-run on start)
│   │   ├── routes/       # Express route handlers (thin — only HTTP logic)
│   │   └── services/     # Business logic + DB queries
│   ├── server.js         # Entry point
│   └── .env.example      # Environment variable template
├── frontend/
│   └── src/
│       ├── api/          # Axios client with typed API helpers
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page-level components (one per route)
│       └── store/        # Zustand store (Copilot chat state)
├── ARCHITECTURE.md
├── AI_USAGE.md
└── README.md
```

---

## Environment Variables

| Variable         | Required          | Description                    |
|------------------|-------------------|--------------------------------|
| `PORT`           | No                | Backend port (default: `3001`) |
| `GEMINI_API_KEY` | Yes (for Copilot) | Your Google AI Studio API key  |

---

## Tech Stack

- **Backend:** Node.js, Express, node:sqlite (built-in)
- **Frontend:** React 18, Vite, Tailwind CSS, @hello-pangea/dnd (Kanban), Zustand (state)
- **AI:** Google Gemini API (`gemini-2.5-flash`) — free tier via Google AI Studio
- **Database:** SQLite (file: `backend/crm.db`, auto-created)
