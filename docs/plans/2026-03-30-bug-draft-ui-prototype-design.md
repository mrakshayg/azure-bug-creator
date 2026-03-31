# Bug Draft UI Prototype — Design Document
**Date:** 2026-03-30
**Status:** Approved
**Scope:** Interactive UI prototype only — no real backend integration

---

## 1. Goal

Build a fully interactive React UI prototype that demonstrates the complete bug drafting workflow as defined in the architecture doc (`bug_architecture_updated.md`). This prototype serves as a visual reference for the full production build.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Lightweight, fast, no config overhead |
| Styling | Tailwind CSS | Utility-first, consistent spacing/colors |
| Components | shadcn/ui | Polished out-of-the-box, accessible |
| State | React useState / useReducer | No external state library needed for prototype |
| Icons | lucide-react | Ships with shadcn/ui |

---

## 3. App Structure

```
src/
  App.jsx                  # Root: Dashboard + Wizard toggle
  components/
    Dashboard.jsx          # Bug list with mock data
    Wizard.jsx             # Step wizard shell + progress bar
    steps/
      Step1Describe.jsx    # Bug description input
      Step2Prompt.jsx      # Generated AI prompt display
      Step3Launch.jsx      # AI launcher buttons
      Step4Paste.jsx       # Paste AI output
      Step5Review.jsx      # Editable parsed fields
      Step6Attach.jsx      # Screenshot upload
      Step7Submit.jsx      # Summary + submit button
    Result.jsx             # Mock success / work item card
  lib/
    promptBuilder.js       # Builds AI prompt from user input
    outputParser.js        # Parses structured AI output into fields
    mockData.js            # Fake bug list, fake bug ID generator
```

---

## 4. Layout

### App Shell
- Top navbar: logo ("BugDraft"), "New Bug" CTA button, avatar placeholder
- Main content: Dashboard (default view) or Wizard (when active)

### Dashboard
- Table/card list of 3–4 mock bugs with: ID, Title, Status badge (Active/Resolved), Module, Date
- "Create Draft" button per row (opens wizard) + top-level "New Bug" button

### Step Wizard
- Full-page content area (replaces dashboard while active)
- Top: 7-step labeled progress bar with active/completed/pending states
- Center: active step content
- Bottom: Back / Next / Submit action buttons

---

## 5. Step-by-Step Design

### Step 1 — Describe Bug
- Large textarea: "Describe the bug in plain English..."
- Character counter (bottom right)
- Module dropdown: Login, Dashboard, Reports, Settings, Other
- Environment selector: QA / Staging / Production

### Step 2 — Build Prompt
- Read-only syntax-highlighted code block showing the full generated prompt
  - Includes bug template schema + user's description
- "Copy Prompt" button → copies to clipboard → shows ✓ checkmark for 2s

### Step 3 — Launch AI
- Three buttons with logos: ChatGPT | Claude | Gemini
- Each button: copies prompt to clipboard + opens real AI URL in new tab
  - ChatGPT → https://chat.openai.com
  - Claude → https://claude.ai
  - Gemini → https://gemini.google.com
- Status message: "Waiting for you to get the AI response and paste it in Step 4"
- "I'm ready to paste" link advances to Step 4

### Step 4 — Paste Output
- Large textarea: "Paste the structured bug output from your AI here..."
- "Parse & Continue" button → parses text → auto-advances to Step 5
- Mock parse: if text is empty or unrecognized, fills fields with mock data (so prototype always works)

### Step 5 — Review & Edit
- Editable form fields:
  - Title (text input)
  - Steps to Reproduce (textarea)
  - Expected Result (textarea)
  - Actual Result (textarea)
  - Priority (dropdown: Critical / High / Medium / Low)
  - Severity (dropdown: 1 / 2 / 3 / 4)
  - Module (pre-filled from Step 1)
  - Environment (pre-filled from Step 1)
- All fields inline-editable

### Step 6 — Attach Screenshots
- Drag-and-drop zone + "Browse Files" button
- Accepted types: PNG, JPG, GIF, WebP
- Uploaded images shown as thumbnail grid with × remove button
- Max 5 files shown (prototype limit)

### Step 7 — Submit
- Read-only summary card: all fields + attachment count
- "Submit to Azure DevOps" primary button
- On click: loading spinner overlay (1.5s mock delay)
- Transitions to Result View

### Result View
- Mock Azure DevOps work item card:
  - Bug ID: `#BUG-1042` (or random in range 1000–9999)
  - Title, Status: Active, Assigned To: Unassigned
  - Created: today's date
- "View in Azure DevOps" button (greyed out, non-functional)
- "Create Another Bug" button → resets wizard and returns to dashboard

---

## 6. Prompt Template (Step 2)

```
You are a QA engineer.
Convert the following bug description into a structured bug report.

Use EXACTLY this format:

BUG TITLE: <title>
MODULE: <module>
ENVIRONMENT: <environment>
STEPS TO REPRODUCE:
1. <step>
2. <step>
EXPECTED RESULT: <expected>
ACTUAL RESULT: <actual>
PRIORITY: <Critical|High|Medium|Low>
SEVERITY: <1|2|3|4>

Bug Description:
<user input>
```

---

## 7. Output Parser Logic (Step 4 → Step 5)

Regex-based extraction:
- `BUG TITLE:` → title field
- `MODULE:` → module field
- `ENVIRONMENT:` → environment field
- `STEPS TO REPRODUCE:` → steps field (multiline until next label)
- `EXPECTED RESULT:` → expectedResult field
- `ACTUAL RESULT:` → actualResult field
- `PRIORITY:` → priority dropdown
- `SEVERITY:` → severity dropdown

Fallback: if parsing fails, pre-fill with mock data so prototype flow never breaks.

---

## 8. State Shape

```js
{
  // Step 1
  description: "",
  module: "Login",
  environment: "QA",

  // Step 5 (populated from parse)
  title: "",
  steps: "",
  expectedResult: "",
  actualResult: "",
  priority: "High",
  severity: "2",

  // Step 6
  attachments: [], // { id, name, url, size }

  // Result
  submittedBugId: null,
}
```

---

## 9. Key Interactions Summary

| Interaction | Behavior |
|---|---|
| Copy Prompt | `navigator.clipboard.writeText()` → ✓ feedback |
| Launch AI | `window.open(url, '_blank')` |
| Parse Output | Regex extraction → populate Step 5 fields |
| Upload Screenshot | FileReader API → base64 thumbnail preview |
| Submit | 1.5s setTimeout mock → show Result View |
| Create Another | Reset all state → return to Step 1 |

---

## 10. Out of Scope (Prototype)

- No real Azure DevOps API calls
- No authentication
- No database / persistence
- No actual file upload to storage
- No real AI API calls
