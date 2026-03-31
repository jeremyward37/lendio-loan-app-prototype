# Lendio — AI-Powered Loan Application Prototype

An interactive prototype for a small business loan application flow, built with React, TypeScript, Vite, and Tailwind CSS. Demonstrates an AI-assisted application experience: automated business profile research via simulated agents, an AI Loan Advisor chat (powered by Claude), smart document collection with delegation, and AI-simulated document verification.

---

## Table of Contents

- [What This Prototype Does](#what-this-prototype-does)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Sharing via ngrok](#sharing-via-ngrok)
- [Full Application Flow](#full-application-flow)
- [Demo Guide — Screen by Screen](#demo-guide--screen-by-screen)
- [Testing Specific Features](#testing-specific-features)

---

## What This Prototype Does

This is a **5-screen loan application prototype** that showcases how AI can reduce friction for small business borrowers:

1. **Intake Form** — Collect basic business info
2. **Funding Questions** — Credit score, revenue, loan amount, use of funds
3. **AI Profile Resolution** — 15 simulated agents scrape public data sources in the background and pre-fill the applicant's business profile
4. **Loan Product Selection** — Interactive product cards + real-time AI Loan Advisor chat (Claude)
5. **Document Collection** — Smart checklist based on selected products, with upload, verification, bank connect, accounting connect, and third-party delegation

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- **ngrok** (optional, for sharing) — [ngrok.com](https://ngrok.com)

---

## Getting Started

### 1. Install dependencies

```bash
cd app-vision
npm install
```

### 2. Set up your API key

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste in your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> The API key is used for the AI Loan Advisor chat on Screen 4. Without it, the rest of the prototype still works — just the chat panel will fail to respond.

### 3. Start the dev server

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## Sharing via ngrok

ngrok creates a public HTTPS URL that tunnels to your local machine — no deployment needed.

### 1. Install ngrok

```bash
brew install ngrok
```

Or download from [ngrok.com/download](https://ngrok.com/download).

### 2. Authenticate ngrok (one-time setup)

Sign up at ngrok.com, then:

```bash
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

### 3. Start everything

In one terminal:

```bash
npm run dev
```

In a second terminal:

```bash
ngrok http 5173
```

ngrok will print a public URL like `https://abc123.ngrok-free.app`. Share that link — anyone with it can access the prototype.

> **Note:** The URL changes each time you restart ngrok unless you have a paid plan with a reserved domain.

---

## Full Application Flow

```
[Screen 1] Intake Form
     ↓  (agents start in background)
[Screen 2] Funding Questions
     ↓  (agents complete, interstitial shown)
[Screen 3] Profile Review
     ↓
[Screen 4] Loan Product Selection + AI Chat
     ↓
[Screen 5] Document Collection
     ↓
[Completion Screen]
```

State is persisted in `localStorage` — refreshing the page or returning to it later will restore exactly where you left off. To fully reset, clear localStorage from DevTools → Application → Local Storage → delete `lendio-application-storage` and `lendio-document-storage`.

---

## Demo Guide — Screen by Screen

### Screen 1: Intake Form

**What to show:**
- The form validates all required fields before allowing submission
- Website and EIN are optional — intentionally reduced friction
- Submitting the form kicks off the background agent simulation immediately (before the user even finishes funding questions)

**Good demo inputs:**
```
Business Name: Acme Landscaping
Owner Name:    Jane Smith
City:          Austin
State:         TX
Website:       acmelandscaping.com  (optional)
```

> The mock data system seeds realistic fake profile data based on the business name, so different business names give visually different results on Screen 3.

---

### Screen 2: Funding Questions

**What to show:**
- One question at a time — reduces cognitive load
- Progress indicator at the top tracks where the user is
- Runs in parallel with the agent simulation (agents are working in the background the whole time the user is answering)

**Demo tip:** Move through quickly — the agent animation on the next screen is timed to still be running when you land there if you answer promptly.

**Suggested answers:**
- Credit Score: 680–719
- Monthly Revenue: $50,000
- Loan Amount: $100,000
- Use of Funds: Working Capital + Equipment

---

### Screen 3: Agent Interstitial + Profile Review

**Agent Interstitial (auto-advances):**
- Shows 15 named agents (Business Website, D&B, Secretary of State, Yelp, LinkedIn, etc.) running in parallel with live status updates
- Each agent has a randomized 3–12 second delay to simulate real async scraping
- A "Data Guardian" step harmonizes conflicting results using source priority
- The screen auto-advances once all agents complete — no action needed

**Profile Review:**
- Shows all 17 pre-filled business profile fields
- Fields found by agents are labeled with a blue "AI" badge
- Fields the agents couldn't find (ZIP Code, Number of Employees) are highlighted in orange — user must fill these in
- All fields are editable so users can correct anything the agents got wrong
- User must check an acknowledgment checkbox before proceeding

**What to highlight:**
- How much manual data entry is eliminated
- The "AI" badge vs. empty-state contrast — showing where AI added value
- The editable nature — AI assists but doesn't override

---

### Screen 4: Loan Product Selection + AI Chat

**Product Cards:**
- 5 products: Revenue Based Financing, Line of Credit, Term Loan, SBA Loan, Equipment Loan
- Multi-select — users can select more than one to see document requirements for each
- Each card shows key terms (amount range, term, interest rate indicator)

**AI Loan Advisor Chat (right panel):**
- Powered by Claude (claude-sonnet-4-20250514)
- Has full context: business name, owner, city/state, credit score, revenue, loan amount, use of funds, and resolved profile data
- Constrained to discuss only the 5 products shown
- Good demo prompts:
  - *"Which product makes the most sense for my credit score?"*
  - *"How long does the SBA loan process typically take?"*
  - *"What's the difference between a Line of Credit and Revenue Based Financing?"*
  - *"What documents will I need for a Term Loan?"*
  - *"Based on my revenue and loan amount, what would monthly payments look like?"*

> **Requires API key** — if the chat is not responding, check that `VITE_ANTHROPIC_API_KEY` is set in `.env.local`.

---

### Screen 5: Document Collection

**What to show:**
- The document list is dynamically generated based on which loan products were selected on Screen 4 — selecting an SBA Loan adds SBA-specific docs, Equipment Loan adds equipment-specific docs, etc.
- Documents are grouped into required vs. optional
- Each row shows current status: Outstanding → Verifying → Complete (or Failed)

**Upload flow:**
1. Click the upload button on any document row
2. Select a file from your computer (any file works — the "AI verification" is simulated)
3. The document enters a "Verifying" spinner state for ~2 seconds
4. Then resolves to Complete (green) or Failed (red) based on filename keywords (see below)

**Bank Connect:**
- Click "Connect Bank Account" at the top of the document list
- Shows a modal simulating Plaid-style bank linking
- Walk through the bank selection and account connection steps
- On completion, marks Bank Statements as automatically verified

**Accounting Connect:**
- Click "Connect Accounting Software"
- Simulates QuickBooks/Xero-style OAuth connection
- Marks P&L and Balance Sheet as automatically verified

---

## Testing Specific Features

### Document Verification — Controlling Pass/Fail

The simulated AI verifier reads the **filename** to decide the outcome. Rename your test files before uploading:

| Filename contains | Verification result |
|---|---|
| `issue-type` | Fails — "Document type does not match" |
| `issue-time` | Fails — "Document is outdated" |
| `issue-association` | Fails — "Document does not appear to be associated with this business" |
| Anything else | Passes — marked Complete |

**Examples:**
- `bank-statement.pdf` → passes
- `bank-statement-issue-time.pdf` → fails with outdated error
- `articles-issue-association.pdf` → fails with association error

After a failure, the row shows the specific error message and a re-upload option.

---

### Document Delegation (Third-Party Upload)

This flow lets an applicant delegate document collection to a third party (e.g., their accountant).

**Steps to demo:**

1. On the Document Collection screen, click **"Assign to someone else"** on any document row
2. In the modal, enter any email address and an optional note, then click **"Send invitation"**
3. The document row will show "Waiting on [email]" status
4. To simulate the third party's experience:
   - Open DevTools → Application → Local Storage → `lendio-document-storage`
   - Find the `delegations` array and copy the `sessionId` of the delegation you just created
   - Navigate to `/delegate/SESSION_ID` in the browser (or a new tab)
5. The delegate page shows **only the assigned documents** — the delegatee has no access to the rest of the application
6. Upload and verify documents on the delegate page
7. When all assigned documents are uploaded, the delegate page shows a completion screen
8. Back on the main Document Collection page, the document status updates automatically (shared via localStorage)

---

### Resetting the Application

The app persists all state to localStorage so it survives page refreshes. To start fresh:

**Option 1 — DevTools:**
DevTools → Application → Local Storage → right-click `lendio-application-storage` and `lendio-document-storage` → Delete

**Option 2 — Console:**
```js
localStorage.removeItem('lendio-application-storage');
localStorage.removeItem('lendio-document-storage');
location.reload();
```

Then navigate back to `/` (the Intake Form).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 4 |
| Styling | Tailwind CSS 3 + custom Lendio theme |
| State | Zustand (with localStorage persistence) |
| Forms | React Hook Form + Zod validation |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Routing | React Router 7 |
| UI | Headless UI, React Hot Toast |

---

## Project Structure

```
src/
├── pages/              # One file per screen
│   ├── IntakeForm.tsx
│   ├── FundingQuestions.tsx
│   ├── AgentInterstitial.tsx
│   ├── ProfileReview.tsx
│   ├── LoanProductSelection.tsx
│   ├── DocumentCollection.tsx
│   └── DelegateUpload.tsx
├── components/
│   ├── agents/         # Agent status panel
│   ├── chat/           # AI Loan Advisor chat
│   ├── documents/      # Checklist, rows, modals
│   ├── layout/         # App shell / header
│   └── ui/             # Progress bar, step indicator, toasts
├── store/              # Zustand stores (application, documents, agents)
├── lib/                # Claude client, agent simulator, document verifier
├── data/               # Loan products, document matrix, mock profile data
└── types/              # TypeScript interfaces
```
