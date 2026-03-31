# Feature: AI-Powered Phased Loan Application Prototype

## Who is this for?
Small business owners applying for a business loan through Lendio's borrower portal.

## What should it do?
A business owner begins with a short intake form providing just a few key details about their business. While simulated AI agents run in the background researching their business profile from public sources, the applicant is guided through a series of questions about their funding needs — one question at a time. Once the background research and questions are both complete, the applicant reviews and verifies the profile data that was "found," correcting anything that is wrong or filling in anything that was missed. From there they are presented with loan product options, can chat with a live AI model to compare them, and select the product types they want to pursue. They then enter a document collection phase where they upload required and optional documents per the loan types selected — with simulated AI verification, the ability to delegate documents to a third party (e.g. an accountant), direct account linking for financial documents (mocked), and the ability to save progress and return across multiple sessions. The prototype ends when all required documents have been submitted.

---

## Screens & Flow

### Screen 1 — Intake Form
Collect the following fields in a single form before proceeding:

**Required:**
- Business Name
- Owner Name
- Business City
- Business State

**Optional:**
- Website URL
- EIN

On submit, simultaneously:
1. Launch all background AI research agents (simulated — see Agent Logic below)
2. Advance the user to the Funding Questions flow (Screen 2)

---

### Screen 2 — Funding Questions (one question per screen)
Ask the following questions one at a time, in order, with a progress indicator:

1. **Credit Score** — multiple choice: Below 500 / 500–599 / 600–649 / 650–699 / 700–749 / 750+
2. **Average Monthly Revenue** — currency input
3. **Loan Amount Seeking** — currency input
4. **How do you plan to use the funds?** — multi-select tile picker with options:
   - Working Capital
   - Equipment Purchase
   - Business Expansion
   - Real Estate
   - Inventory
   - Hiring / Payroll
   - Debt Refinancing
   - Other

When all four questions are answered, navigate directly to Screen 3. If agent research is still in progress, Screen 3 displays a loading spinner with explanatory text: a headline ("Gathering your business details...") and a subline ("Our AI agents are pulling information from public sources. This will only take a moment."). As soon as research resolves, the form populates automatically.

---

### Screen 3 — Profile Review & Verification
Display all researched data points in an editable form. Each field should show:
- The value "found" (pre-populated from simulated agent results)
- Which source it came from (e.g. "Source: Google Business Listing")
- If no value was found, display an empty field with placeholder text prompting the user to fill it in, and highlight the input with an amber border (`#E8A020`) to draw attention to fields that need the applicant's input

**Data points to display and allow editing:**
- Business Address (Street, City, State, Zip)
- Owner Address (Street, City, State, Zip)
- Business Start Date
- Number of Locations
- Entity Type (Sole Proprietor / LLC / S-Corp / C-Corp / Partnership / Nonprofit)
- EIN
- Number of Employees
- Is the business a franchise? (Yes / No)
- Is the business a nonprofit? (Yes / No)
- Has the business or owner had a bankruptcy? (Yes / No)
- If yes: What is the current bankruptcy status? (Discharged / Active / Dismissed)

Group fields logically: Business Details, Owner Details, Legal & Financial History.

**Display notes:**
- Do not show source attribution on any field (no "Source: X" labels).
- Simulate 1–2 fields that no agent was able to find — these should display as empty inputs with placeholder text prompting the user to fill them in, highlighted with an amber border (`#E8A020`). The empty fields should be deterministic (always the same fields regardless of business name): Number of Employees and Business ZIP Code.
- Fields that were successfully found by AI display a subtle indigo left-border accent and a small `✦ AI` badge next to the field label to communicate that the value was AI-collected and needs human review.
- When a user edits an AI-collected field (changes it from the original AI value), the `✦ AI` indicator is removed in real time — the field is now considered user-provided.
- A brief banner at the top of the form explains the `✦ AI` indicator.
- A single acknowledgment checkbox at the bottom of the form ("I've reviewed the AI-collected fields and confirmed they're correct") must be checked before the "This looks right, continue →" CTA is enabled.

User confirms the profile by clicking "This looks right, continue."

---

### Simulated Agent Logic
Spin up one simulated agent per source. Each agent should have a realistic randomized delay between 3–12 seconds to simulate real research time. Agents run in parallel.

**Sources (one agent each):**
Business Website, Google Business Listing, Manta, Dun & Bradstreet, Secretary of State, Yelp, Better Business Bureau, UCC, Bankruptcy Court Records, LinkedIn, Licensing Authorities, Facebook, ZoomInfo, Credit Databases, SBA Databases

**Data Guardian Agent:**
After all source agents complete, a Data Guardian agent consolidates results:
1. Checks each agent returned a value or an explicit "not found" for every requested data point. If an agent returns incomplete results, it is re-dispatched once. After the second attempt, any missing fields are treated as "not found."
2. Harmonizes values across sources by: (a) preferring the most frequently occurring value across sources, and (b) when tied, applying a source priority hierarchy: Secretary of State > Dun & Bradstreet > SBA Databases > Google Business Listing > BBB > Manta > all others.

**Mock data behavior:** Use the Business Name entered in Screen 1 to seed realistic-looking mock results. Pre-define a set of plausible data values that get assigned per data point. Sources should "agree" on most fields but introduce occasional disagreement (1–2 fields) to demonstrate the harmonization logic visually.

Show a live agent status panel on the interstitial screen displaying each agent's name and status: Searching → Complete / No Data Found.

---

### Screen 4 — Pre-Qualification: Loan Product Selection
Present the following five loan product types as comparable cards. Each card must include:
- Product name
- Plain-language description (2–3 sentences)
- Typical loan amounts
- Typical terms
- Best for (use case)
- Key requirement highlights

**Products to display:**
1. **Revenue Based Financing** — Flexible repayment tied to monthly revenue. Good for businesses with strong sales but limited credit history.
2. **Line of Credit** — Draw funds as needed up to a set limit. Good for managing cash flow and ongoing expenses.
3. **Term Loan** — Lump sum repaid over a fixed schedule. Good for planned investments with predictable ROI.
4. **SBA Loan** — Government-backed loan with low rates. Good for established businesses that can handle a longer process.
5. **Equipment Loan** — Collateralized by the equipment being purchased. Good for businesses needing specific machinery or vehicles.

**AI Chat Panel:**
- Display a persistent AI chat panel alongside (or below) the product cards
- Powered by the Claude API (claude-sonnet-4-20250514, max_tokens: 1000)
- System prompt: The assistant is a Lendio loan advisor helping a small business owner understand and compare loan product options. You know the applicant's business profile and funding needs (inject the collected data into the system prompt). Help them understand which products best fit their needs, explain trade-offs, and answer questions. Be conversational, clear, and never use jargon without explanation. Do not recommend specific lenders or quote specific rates.
- Inject the full collected profile (business details, funding amount, use of funds, credit score, monthly revenue) into the system prompt so the AI can give personalized guidance.

**Selection:**
- Each product card has a "Select" toggle / checkbox
- User must select at least one product to continue
- Selected state should be visually prominent
- CTA: "Continue with selected products →"

---

### Screen 5 — Document Collection
Display a full document checklist based on the loan product types selected in Screen 4. Deduplicate documents that appear across multiple selected product types (e.g. if both Term and SBA are selected, "3 months business bank statements" should appear once, resolved to the more stringent requirement — 6 months if SBA is selected).

**Document Requirements by Product:**

| Document | RBF | Line of Credit | Term | SBA | Equipment |
|---|---|---|---|---|---|
| 3 months business bank statements | Required | Required | Required | — | Required |
| 6 months business bank statements | — | — | — | Required | — |
| Prior year business tax return | — | — | Required | — | Optional |
| Prior 2 years business tax return | — | — | — | Required | — |
| Prior year personal tax return | — | — | Required | — | — |
| Prior 2 years personal tax return | — | — | — | Required | — |
| Current Balance Sheet | — | — | Required | Required | Optional |
| Year to Date Profit & Loss Statement | — | — | Required | Required | — |
| Equipment quote or invoice | — | — | — | — | Required |
| Front and back of Driver's License | Optional | Optional | Optional | Required | Optional |

**Per-product progress tracker (top of page, below header):**
For each selected loan product, show a progress bar or indicator displaying how many of that product's documents have been provided vs. total required (e.g. "SBA Loan — 2 of 6 documents complete"). This gives the applicant a clear at-a-glance view of their progress per product type.

**List structure:**
- Section 1: **Outstanding — Required** (alphabetical)
- Section 2: **Outstanding — Optional** (alphabetical, visually lighter weight, labeled "Optional — providing this now will speed up your closing")
- Section 3: **Completed** (alphabetical, below outstanding)

**Each document row includes:**
- Document name
- Which loan type(s) are driving the requirement — shown as small product pills (e.g. "SBA", "Term Loan") beneath the document name. If multiple selected products require the document, all are shown.
- Status indicator (outstanding / verifying / complete / failed)
- Upload CTA or completion badge
- "Learn more" expandable section (collapsed by default) containing: plain-language description of the document, where to obtain it, and (where applicable) an example or downloadable template link — use realistic placeholder templates
- Direct connection option for applicable documents (mocked): Bank statements → "Connect your bank" (Finicity-style, mocked), Balance Sheet / P&L → "Connect QuickBooks / Xero / FreshBooks" (mocked). These should launch a realistic-looking mock OAuth/connection modal and then mark the document as uploaded and verified.
- Delegate button (see Delegation section below)

**Upsell Tiles (tasteful, non-intrusive):**
Display contextual helper tiles at relevant moments:
- When bank statements are outstanding → "Need a business bank account? We can help." (tile with CTA, no navigation required)
- When insurance documents are relevant → "Need business insurance? Get a quote." (tile)
- When P&L or Balance Sheet is outstanding → "Don't have financials ready? Try QuickBooks." (tile with connect shortcut)

These should appear inline near the relevant document rows, styled subtly (not as ads).

**AI Document Verification (simulated):**
When a file is uploaded, show a short animated "Verifying document..." state before resolving. Three checks are always run and displayed as pills after verification:
1. **Correct document type** — fails if filename contains `issue-type`
2. **Valid time period** — fails if filename contains `issue-time`
3. **Belongs to this business** — fails if filename contains `issue-association`

Each pill shows a green ✓ if passed or a red ☐ if failed. All three pills are shown after every verification attempt (pass or fail).

If all checks pass → document moves to Completed. If any check fails → document stays Outstanding with the pills showing which checks failed and a "Upload a different file" CTA.

**Document Delegation:**
On any document row, the user can click "Assign to someone else." A modal appears:
- Input: email address of the assignee
- Input: optional note to the assignee
- On confirm: the document row updates to show "Requested from [email]" with a pending badge. The delegation is recorded in state.
- Simulate the email send visually (show a "Invitation sent to [email]" confirmation toast) — no real email is sent.
- The assignee experience: generate a unique URL per delegation session (can be a route like `/delegate/:sessionId`). When visited, this experience looks identical to the main document checklist but shows only the documents assigned to that person. Once all assigned documents are uploaded and verified, show a "You're all done — thank you!" completion screen. After that, the delegate session URL should show an "Access expired" screen if revisited.
- When a delegate completes a document, it should reflect as completed in the primary applicant's checklist (use localStorage to sync state).

**Saving Progress:**
All document state (uploaded, verified, delegated, completed) must persist in localStorage so the user can leave and return to find the checklist exactly as they left it.

**Advancement:**
The "Complete & Submit" CTA is only enabled when all **required** documents are in the Completed state. Optional documents may remain outstanding. Show a count of outstanding required documents when the CTA is disabled (e.g. "3 required documents still needed").

---

## Business Rules

- When the user submits Screen 1, both the agent research AND the funding questions begin simultaneously — neither waits for the other.
- When the user finishes all four funding questions before research completes, hold them on an animated interstitial until all agents resolve.
- When no value is found by any agent for a data point, display that field as blank and editable on Screen 3.
- When multiple agents return conflicting values, the Data Guardian resolves using frequency first, then source priority hierarchy.
- When SBA is selected alongside a product requiring 3 months of bank statements, the SBA requirement (6 months) takes precedence.
- When any selected product requires 2 years of business tax returns, suppress the 1-year business tax return requirement (2 years is a superset). Products that drove the 1-year requirement are merged into the driving products shown on the 2-year document row.
- When any selected product requires 2 years of personal tax returns, suppress the 1-year personal tax return requirement (2 years is a superset). Products that drove the 1-year requirement are merged into the driving products shown on the 2-year document row.
- When a document is delegated, the applicant can still upload that document themselves — whichever is completed first wins.
- When all documents assigned to a delegate are verified, the delegate session becomes permanently inaccessible.
- When a document filename contains any of the three `issue-*` keywords, it must fail verification regardless of file type or content.
- When all required documents are complete, the Submit CTA becomes active. Optional documents do not block advancement.
- All application state must persist in localStorage so returning users resume exactly where they left off.

---

## Success Criteria

- User can complete the full intake form and be immediately transitioned into the funding questions while agents run in the background.
- User can see a live agent status panel showing each of the 15 agents' progress in real time (simulated).
- User can review, edit, and confirm their pre-populated business profile on Screen 3.
- User can read loan product comparison cards and engage in a real AI-powered chat conversation that references their specific profile and funding needs.
- User can select one or multiple loan products and proceed to document collection.
- User can upload documents, see simulated AI verification resolve within seconds, and watch documents move from Outstanding to Completed.
- User can trigger a document failure by uploading a file with `issue-type`, `issue-time`, or `issue-association` in the filename.
- User can expand a "Learn more" section on any document row to read a plain-language description and see an example or template.
- User can mock-connect a bank account or accounting software and have the relevant document automatically marked as verified.
- User can delegate a document to another person by entering their email, see a confirmation toast, and see the row update to "Requested from [email]."
- Delegate can visit their unique URL, upload their assigned documents, and see a completion screen — after which their URL shows "Access expired."
- Primary applicant's checklist reflects delegate-submitted documents as completed in real time (via localStorage sync).
- User can leave mid-session and return to find all document states exactly as left.
- System prevents the Submit CTA from activating until all required documents are verified complete.
- System prevents a delegate from accessing their upload session after all assigned documents are completed and confirmed.

---

## Context

- This is a stakeholder-facing prototype intended to demonstrate the full borrower journey from intake through document collection.
- **Styling:** Use CSS and styling found in the `borrower-portal` directory. Ensure you use the most current styling and logos — this should feel like a real Lendio product. Primary button color: `#192526` (from `--bs-btn-bg` on `.btn-primary`). Brand/accent color (headers, progress, borders): `#0800A6`.
- **AI Chat:** Use the Anthropic Claude API (`claude-sonnet-4-20250514`, max_tokens: 1000). Inject the full collected applicant profile into the system prompt so responses are personalized.
- **State persistence:** Use localStorage for all session state including document status, delegation records, and profile data.
- **Hosting:** Host the prototype using ngrok so it can be shared with coworkers for review. Include setup instructions in the project README.

---

## Out of Scope

- Real web scraping or live agent research — all agent results are simulated with mocked data seeded from the business name.
- Sending real emails for document delegation — simulate visually only.
- Real bank or accounting software connections — mock the OAuth/connection flow UI only.
- Lender matching, real loan offers, or any post-document-collection screens.
- User authentication, login, or account creation.
- Mobile-responsive design (desktop-first is sufficient for stakeholder review).
- Any backend database — localStorage only for state persistence.
