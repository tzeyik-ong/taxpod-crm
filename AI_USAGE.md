# AI Usage Log

## Tools Used

| Tool                                 | Purpose                                                                              |
|--------------------------------------|--------------------------------------------------------------------------------------|
| Claude Code (claude-sonnet-4-6)      | Scaffolded architecture, wrote backend/frontend code, designed Copilot system prompt |
| Google Gemini API (gemini-2.5-flash) | Powers the CRM Copilot feature at runtime (free tier, Google AI Studio)              |

---

## How AI Helped Most

**Architecture design** — Claude Code produced the full component diagram, data model, API route table, and AI integration strategy in a single pass. This saved significant upfront planning time and surfaced considerations (e.g., intent-based context slicing to avoid token waste) that I might have missed.

**Boilerplate elimination** — Writing 5 CRUD route files and their matching service files is repetitive. Claude Code handled this in parallel, ensuring consistent patterns (thin routes / fat services, same error handling shape) across all modules.

**Kanban drag-and-drop** — `@hello-pangea/dnd` has nuanced setup (DragDropContext → Droppable → Draggable nesting). Claude Code got this right on the first attempt, including the optimistic update pattern for stage changes.

**Copilot system prompt** — Designing the system prompt to be grounded (no hallucination), formatted correctly (RM currency), and scoped to CRM-only answers was something Claude Code iterated on thoughtfully.

---

## Where AI Fell Short

**Tailwind class conflicts** — On one occasion Claude Code suggested a Tailwind class combination that created unexpected layout behaviour (`flex-1` inside a fixed-height flex container without `overflow-hidden` on the parent). Required manual correction.

**SQLite `better-sqlite3` synchronous API nuance** — Claude Code initially drafted a service method using `.then()` on a `better-sqlite3` query, which is synchronous and doesn't return a Promise. Required a correction to remove the `.then()` chain.

---

## Real Prompt Example

**Prompt given to Claude Code:**

> "Design the architecture for a lightweight CRM system with AI integration for YYC taxPOD. The requirements are: Core modules: Leads, Opportunities (Kanban), Activity Log, Dashboard. AI feature: Option A - CRM Copilot (natural language query using Groq API). Preferred stack: Node.js + Express backend, React + Vite frontend, SQLite database. Give me: 1. The exact project folder/file structure to scaffold. 2. The full data model (tables, columns, relationships). 3. The API routes needed. 4. How the AI integration should be structured (prompt design, context passing). 5. Key npm packages to include. Keep it practical and minimal — no over-engineering. SQLite with built-in node:sqlite, no ORM needed."

**Output received (excerpt):**

> The agent returned a complete architecture plan including:
> - Full folder tree (backend/src/db, routes, services; frontend/src/api, components, pages, store)
> - SQL CREATE TABLE statements for all 3 tables with correct constraints and indexes
> - 15-row API route table with methods, paths, and descriptions
> - The intent-based context fetching strategy (keyword matching → targeted DB queries)
> - The system prompt template with grounding rules and `<context>` injection pattern
> - Annotated package.json for both backend and frontend with rationale per dependency

**What I changed after testing and debugging:**

- **Replaced `better-sqlite3` with Node's built-in `node:sqlite`** — Running `npm install` failed immediately on Node.js v24 because `better-sqlite3` is a native addon with no prebuilt binary for that version. Rather than downgrading Node, I switched to the built-in `DatabaseSync` from `node:sqlite`, which requires no compilation and works across all supported versions.

- **Switched the AI provider from Anthropic to Google Gemini** — The initial implementation used the Anthropic SDK. On first run the Copilot returned an error because the Anthropic free tier requires credits. After checking the assessment brief, Google Gemini is one of the four explicitly listed providers and Google AI Studio offers a genuinely free tier with no credit card, so I migrated to `@google/generative-ai`.

- **Fixed the Gemini model name after a 404 error** — The first model I tried (`gemini-1.5-flash`) returned a 404 Not Found from the API. I tested several candidates programmatically and found `gemini-2.5-flash` to be the working model, then updated the constant and all documentation.

- **Fixed the Copilot error response** — When the API key was missing or invalid the frontend showed a generic "Something went wrong" message instead of the actual API error. I updated the error handler in `copilot.js` to pass the API's error message through to the client so the failure reason is visible.

- **Simplified the intent detection logic** — The generated code used regex patterns to detect keywords in the user message. During testing this was harder to trace when debugging wrong context slices, so I replaced it with straightforward `string.includes()` checks, which are easier to read and produce the same results for the CRM vocabulary used.

- **UI corrections found during manual testing** — Several issues only appeared when interacting with the app: the hover tooltip on the dashboard activity feed was being clipped at the bottom of the screen and caused the page to scroll-jump (fixed by switching to `position: fixed` with viewport-aware placement); the phone field in the lead form was too narrow in a two-column layout (moved to its own full-width row); the native `<input type="date">` looked inconsistent across browsers (replaced with a custom calendar component).

**Why:**

Each change above was driven by a concrete failure or usability problem found during testing — not upfront design decisions. The pattern was: run the app, observe the issue, identify root cause, fix it.

---

## CRM Copilot — Technical Details

### What it does

The Copilot is a chat interface in a slide-out panel. When the user types a question, the backend:

1. **Parses intent** from keywords in the message (`lead`, `opportunit`, `activit`, etc.)
2. **Fetches only the relevant CRM data** from SQLite (avoids dumping the entire DB into the prompt)
3. **Builds a system prompt** that includes the data as a JSON `<context>` block
4. **Calls the Gemini API** (`startChat` + `sendMessage`) with the system instruction + full conversation history
5. **Returns the answer** to the frontend, which renders it in the chat UI

### The actual API call (from `copilotService.js`)

```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: systemPrompt,  // includes live CRM data in <context> block
});
// Gemini uses 'model' role instead of 'assistant'
const geminiHistory = conversationHistory.map(m => ({
  role:  m.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: m.content }],
}));
const chat   = model.startChat({ history: geminiHistory });
const result = await chat.sendMessage(userMessage);
```

### System prompt structure

```
You are a CRM assistant for YYC taxPOD, a Malaysian tax advisory firm.
Rules:
- Answer ONLY using the CRM data in the <context> block.
- Never invent records. Format currency as "RM X,XXX".
- Do not answer questions unrelated to the CRM.

<context>
{ ...live JSON snapshot of leads/opportunities/activities... }
</context>
```

This design ensures the model is grounded in real data, cannot hallucinate CRM records, and stays on-topic.
