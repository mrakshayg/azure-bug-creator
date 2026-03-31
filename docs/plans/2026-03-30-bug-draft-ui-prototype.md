# Bug Draft UI Prototype Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully interactive 7-step wizard UI prototype for the Bug Drafting Platform using React + Vite, with no backend integration.

**Architecture:** Single-page Vite + React app. App shell has a Dashboard (mock bug list) and a Step Wizard (full-page overlay). All state lives in a top-level `useWizard` hook. No routing needed — conditional rendering toggles between Dashboard and Wizard views.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, shadcn/ui, lucide-react, clsx/tailwind-merge

---

## Task 1: Scaffold Vite + React Project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

**Step 1: Scaffold the project**

```bash
cd /Users/akshay/Documents/codewave-internal-qa/azure-bug-creator
npm create vite@latest . -- --template react
```

Expected: project files created (package.json, src/, index.html, etc.)

**Step 2: Install dependencies**

```bash
npm install
npm install tailwindcss @tailwindcss/vite lucide-react clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-label @radix-ui/react-slot
npm install class-variance-authority
```

**Step 3: Configure Tailwind**

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

`src/index.css`:
```css
@import "tailwindcss";
```

**Step 4: Replace `src/App.jsx` with a blank shell**

```jsx
export default function App() {
  return <div className="min-h-screen bg-gray-50">Hello</div>
}
```

**Step 5: Run dev server and verify**

```bash
npm run dev
```
Expected: browser shows "Hello" on gray background at localhost:5173

**Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold vite react project with tailwind"
```

---

## Task 2: Utility Helpers + Mock Data

**Files:**
- Create: `src/lib/utils.js`
- Create: `src/lib/mockData.js`
- Create: `src/lib/promptBuilder.js`
- Create: `src/lib/outputParser.js`

**Step 1: Create `src/lib/utils.js`**

```js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateBugId() {
  return `BUG-${Math.floor(1000 + Math.random() * 9000)}`
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
```

**Step 2: Create `src/lib/mockData.js`**

```js
export const MOCK_BUGS = [
  { id: 'BUG-0891', title: 'Login page crashes on incorrect password', status: 'Active', module: 'Login', environment: 'QA', date: 'Mar 28, 2026' },
  { id: 'BUG-0876', title: 'Dashboard charts not loading on Safari', status: 'In Progress', module: 'Dashboard', environment: 'Staging', date: 'Mar 26, 2026' },
  { id: 'BUG-0854', title: 'Export to CSV missing last column', status: 'Resolved', module: 'Reports', environment: 'Production', date: 'Mar 22, 2026' },
  { id: 'BUG-0841', title: 'User avatar not updating after profile save', status: 'Active', module: 'Settings', environment: 'QA', date: 'Mar 20, 2026' },
]

export const MODULES = ['Login', 'Dashboard', 'Reports', 'Settings', 'Other']
export const ENVIRONMENTS = ['QA', 'Staging', 'Production']
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
export const SEVERITIES = ['1 - Critical', '2 - Major', '3 - Minor', '4 - Trivial']

export const STATUS_COLORS = {
  'Active': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Resolved': 'bg-green-100 text-green-700',
}

export const MOCK_PARSED_OUTPUT = {
  title: 'Login page crashes on submitting empty password field',
  steps: '1. Navigate to the login page\n2. Enter a valid username\n3. Leave the password field empty\n4. Click the "Login" button',
  expectedResult: 'An inline validation message should appear: "Password is required"',
  actualResult: 'The page crashes with a white screen and console error: TypeError: Cannot read property of undefined',
  priority: 'High',
  severity: '2 - Major',
}
```

**Step 3: Create `src/lib/promptBuilder.js`**

```js
export function buildPrompt({ description, module, environment }) {
  return `You are a QA engineer.
Convert the following bug description into a structured bug report.

Use EXACTLY this format:

BUG TITLE: <title>
MODULE: ${module}
ENVIRONMENT: ${environment}
STEPS TO REPRODUCE:
1. <step>
2. <step>
EXPECTED RESULT: <expected>
ACTUAL RESULT: <actual>
PRIORITY: <Critical|High|Medium|Low>
SEVERITY: <1 - Critical|2 - Major|3 - Minor|4 - Trivial>

Bug Description:
${description}`
}
```

**Step 4: Create `src/lib/outputParser.js`**

```js
import { MOCK_PARSED_OUTPUT } from './mockData'

export function parseAIOutput(text) {
  if (!text || text.trim().length < 20) return MOCK_PARSED_OUTPUT

  const extract = (label, nextLabel) => {
    const pattern = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, 'i')
    const match = text.match(pattern)
    return match ? match[1].trim() : ''
  }

  const result = {
    title: extract('BUG TITLE'),
    steps: extract('STEPS TO REPRODUCE'),
    expectedResult: extract('EXPECTED RESULT'),
    actualResult: extract('ACTUAL RESULT'),
    priority: extract('PRIORITY'),
    severity: extract('SEVERITY'),
  }

  // Fallback to mock if critical fields are missing
  const hasContent = result.title && result.steps && result.expectedResult && result.actualResult
  return hasContent ? result : { ...MOCK_PARSED_OUTPUT, ...Object.fromEntries(Object.entries(result).filter(([, v]) => v)) }
}
```

**Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add utility helpers, mock data, prompt builder, output parser"
```

---

## Task 3: Shared UI Components (shadcn-style)

**Files:**
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/Badge.jsx`
- Create: `src/components/ui/Textarea.jsx`
- Create: `src/components/ui/Input.jsx`
- Create: `src/components/ui/Select.jsx`
- Create: `src/components/ui/Card.jsx`

**Step 1: Create `src/components/ui/Button.jsx`**

```jsx
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'default', size = 'md', className, disabled, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Step 2: Create `src/components/ui/Badge.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Badge({ className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {children}
    </span>
  )
}
```

**Step 3: Create `src/components/ui/Input.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Input({ className, label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          className
        )}
        {...props}
      />
    </div>
  )
}
```

**Step 4: Create `src/components/ui/Textarea.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Textarea({ className, label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
          className
        )}
        {...props}
      />
    </div>
  )
}
```

**Step 5: Create `src/components/ui/Select.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Select({ className, label, options = [], ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
```

**Step 6: Create `src/components/ui/Card.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Card({ className, children }) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-6 py-4 border-b border-gray-100', className)}>{children}</div>
}

export function CardContent({ className, children }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}
```

**Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI components (Button, Badge, Input, Textarea, Select, Card)"
```

---

## Task 4: App Shell — Navbar + Layout

**Files:**
- Create: `src/components/Navbar.jsx`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

**Step 1: Create `src/components/Navbar.jsx`**

```jsx
import { Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Navbar({ onNewBug }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Bug size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">BugDraft</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onNewBug}>+ New Bug</Button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
        </div>
      </div>
    </nav>
  )
}
```

**Step 2: Update `src/App.jsx`**

```jsx
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Dashboard } from '@/components/Dashboard'
import { Wizard } from '@/components/Wizard'

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNewBug={() => setWizardOpen(true)} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {wizardOpen
          ? <Wizard onClose={() => setWizardOpen(false)} />
          : <Dashboard onCreateDraft={() => setWizardOpen(true)} />
        }
      </main>
    </div>
  )
}
```

**Step 3: Update `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Step 4: Commit**

```bash
git add src/App.jsx src/main.jsx src/components/Navbar.jsx
git commit -m "feat: add app shell with navbar and layout"
```

---

## Task 5: Dashboard Component

**Files:**
- Create: `src/components/Dashboard.jsx`

**Step 1: Create `src/components/Dashboard.jsx`**

```jsx
import { PlusCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { MOCK_BUGS, STATUS_COLORS } from '@/lib/mockData'

export function Dashboard({ onCreateDraft }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bug Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your Azure DevOps bug reports</p>
        </div>
        <Button onClick={onCreateDraft} size="lg">
          <PlusCircle size={18} />
          Create Draft
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Bugs', value: MOCK_BUGS.length, color: 'text-gray-900' },
          { label: 'Active', value: MOCK_BUGS.filter(b => b.status === 'Active').length, color: 'text-blue-600' },
          { label: 'Resolved', value: MOCK_BUGS.filter(b => b.status === 'Resolved').length, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bug table */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Recent Bug Reports</h2>
        </CardHeader>
        <div className="divide-y divide-gray-100">
          {MOCK_BUGS.map(bug => (
            <div key={bug.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-gray-400 w-20">{bug.id}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{bug.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{bug.module} · {bug.environment} · {bug.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={STATUS_COLORS[bug.status]}>{bug.status}</Badge>
                <Button variant="ghost" size="sm" onClick={onCreateDraft}>
                  <ExternalLink size={14} />
                  Draft
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

**Step 2: Verify dev server still works**

```bash
npm run dev
```
Expected: Dashboard renders with stats and bug list table.

**Step 3: Commit**

```bash
git add src/components/Dashboard.jsx
git commit -m "feat: add dashboard with mock bug list and stats"
```

---

## Task 6: Wizard Shell + Progress Bar

**Files:**
- Create: `src/components/Wizard.jsx`
- Create: `src/hooks/useWizard.js`

**Step 1: Create `src/hooks/useWizard.js`**

```js
import { useState } from 'react'

const INITIAL_STATE = {
  description: '',
  module: 'Login',
  environment: 'QA',
  title: '',
  steps: '',
  expectedResult: '',
  actualResult: '',
  priority: 'High',
  severity: '2 - Major',
  attachments: [],
  submittedBugId: null,
}

export function useWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState(INITIAL_STATE)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (fields) => setData(prev => ({ ...prev, ...fields }))

  const next = () => setCurrentStep(s => Math.min(s + 1, 7))
  const back = () => setCurrentStep(s => Math.max(s - 1, 1))
  const goTo = (step) => setCurrentStep(step)

  const submit = () => {
    setSubmitting(true)
    setTimeout(() => {
      const { generateBugId } = require('../lib/utils')
      update({ submittedBugId: generateBugId() })
      setSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  const reset = () => {
    setData(INITIAL_STATE)
    setCurrentStep(1)
    setSubmitted(false)
    setSubmitting(false)
  }

  return { currentStep, data, update, next, back, goTo, submit, submitting, submitted, reset }
}
```

**Step 2: Create `src/components/Wizard.jsx`**

```jsx
import { useWizard } from '@/hooks/useWizard'
import { ProgressBar } from '@/components/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Result } from '@/components/Result'

import { Step1Describe } from '@/components/steps/Step1Describe'
import { Step2Prompt } from '@/components/steps/Step2Prompt'
import { Step3Launch } from '@/components/steps/Step3Launch'
import { Step4Paste } from '@/components/steps/Step4Paste'
import { Step5Review } from '@/components/steps/Step5Review'
import { Step6Attach } from '@/components/steps/Step6Attach'
import { Step7Submit } from '@/components/steps/Step7Submit'

const STEPS = [
  'Describe Bug', 'Build Prompt', 'Launch AI',
  'Paste Output', 'Review & Edit', 'Attach Screenshots', 'Submit'
]

const STEP_COMPONENTS = {
  1: Step1Describe, 2: Step2Prompt, 3: Step3Launch,
  4: Step4Paste, 5: Step5Review, 6: Step6Attach, 7: Step7Submit,
}

export function Wizard({ onClose }) {
  const wizard = useWizard()
  const { currentStep, data, update, next, back, submit, submitting, submitted, reset } = wizard

  if (submitted) {
    return <Result bugId={data.submittedBugId} title={data.title} onReset={() => { reset(); onClose() }} />
  }

  const StepComponent = STEP_COMPONENTS[currentStep]
  const isLastStep = currentStep === 7

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Bug Report</h1>
          <p className="text-sm text-gray-500 mt-1">Step {currentStep} of 7 — {STEPS[currentStep - 1]}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>✕ Cancel</Button>
      </div>

      {/* Progress bar */}
      <ProgressBar steps={STEPS} currentStep={currentStep} />

      {/* Step content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-64">
        <StepComponent data={data} update={update} onNext={next} wizard={wizard} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={back} disabled={currentStep === 1}>← Back</Button>
        {isLastStep
          ? <Button onClick={submit} disabled={submitting} size="lg">
              {submitting ? 'Submitting...' : 'Submit to Azure DevOps →'}
            </Button>
          : <Button onClick={next}>Next →</Button>
        }
      </div>
    </div>
  )
}
```

**Step 3: Fix dynamic require in useWizard.js** — replace the require with import:

Update `src/hooks/useWizard.js` submit function:

```js
import { generateBugId } from '../lib/utils'
// ... inside submit():
const submit = () => {
  setSubmitting(true)
  setTimeout(() => {
    update({ submittedBugId: generateBugId() })
    setSubmitting(false)
    setSubmitted(true)
  }, 1500)
}
```

**Step 4: Commit**

```bash
git add src/hooks/ src/components/Wizard.jsx
git commit -m "feat: add wizard shell, progress bar stub, and useWizard hook"
```

---

## Task 7: Progress Bar Component

**Files:**
- Create: `src/components/ProgressBar.jsx`

**Step 1: Create `src/components/ProgressBar.jsx`**

```jsx
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProgressBar({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = idx === steps.length - 1

        return (
          <div key={label} className={cn('flex items-center', !isLast && 'flex-1')}>
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                isCompleted && 'border-blue-600 bg-blue-600 text-white',
                isActive && 'border-blue-600 bg-white text-blue-600',
                !isCompleted && !isActive && 'border-gray-300 bg-white text-gray-400'
              )}>
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>
              <span className={cn(
                'text-xs whitespace-nowrap',
                isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
              )}>
                {label}
              </span>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                'h-0.5 flex-1 mx-1 mb-5 transition-colors',
                isCompleted ? 'bg-blue-600' : 'bg-gray-200'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ProgressBar.jsx
git commit -m "feat: add step progress bar component"
```

---

## Task 8: Step 1 — Describe Bug

**Files:**
- Create: `src/components/steps/Step1Describe.jsx`

**Step 1: Create `src/components/steps/Step1Describe.jsx`**

```jsx
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { MODULES, ENVIRONMENTS } from '@/lib/mockData'

export function Step1Describe({ data, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Describe the Bug</h2>
        <p className="text-sm text-gray-500 mt-1">
          Write a plain English description of what went wrong. Don't worry about formatting — the AI will structure it.
        </p>
      </div>

      <Textarea
        label="Bug Description"
        placeholder="e.g. When I click the Login button with an empty password field, the page goes blank and shows a JavaScript error in the console..."
        rows={7}
        value={data.description}
        onChange={e => update({ description: e.target.value })}
      />
      <div className="text-right text-xs text-gray-400">{data.description.length} characters</div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Module"
          options={MODULES}
          value={data.module}
          onChange={e => update({ module: e.target.value })}
        />
        <Select
          label="Environment"
          options={ENVIRONMENTS}
          value={data.environment}
          onChange={e => update({ environment: e.target.value })}
        />
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/steps/Step1Describe.jsx
git commit -m "feat: add step 1 - describe bug"
```

---

## Task 9: Step 2 — Build Prompt

**Files:**
- Create: `src/components/steps/Step2Prompt.jsx`

**Step 1: Create `src/components/steps/Step2Prompt.jsx`**

```jsx
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buildPrompt } from '@/lib/promptBuilder'

export function Step2Prompt({ data }) {
  const [copied, setCopied] = useState(false)
  const prompt = buildPrompt(data)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Your AI Prompt is Ready</h2>
        <p className="text-sm text-gray-500 mt-1">
          Copy this prompt and paste it into your preferred AI tool in the next step.
        </p>
      </div>

      <div className="relative">
        <pre className="rounded-lg bg-gray-900 text-gray-100 text-xs p-4 overflow-auto max-h-72 whitespace-pre-wrap leading-relaxed font-mono">
          {prompt}
        </pre>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="absolute top-3 right-3 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
        </Button>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        Tip: In the next step, click your preferred AI tool button. It will copy the prompt and open the AI in a new tab.
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/steps/Step2Prompt.jsx
git commit -m "feat: add step 2 - build prompt with copy to clipboard"
```

---

## Task 10: Step 3 — Launch AI

**Files:**
- Create: `src/components/steps/Step3Launch.jsx`

**Step 1: Create `src/components/steps/Step3Launch.jsx`**

```jsx
import { useState } from 'react'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buildPrompt } from '@/lib/promptBuilder'

const AI_TOOLS = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    color: 'hover:border-green-400 hover:bg-green-50',
    activeColor: 'border-green-400 bg-green-50',
    logo: '🤖',
    desc: 'OpenAI ChatGPT',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    color: 'hover:border-orange-400 hover:bg-orange-50',
    activeColor: 'border-orange-400 bg-orange-50',
    logo: '✦',
    desc: 'Anthropic Claude',
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: 'hover:border-blue-400 hover:bg-blue-50',
    activeColor: 'border-blue-400 bg-blue-50',
    logo: '✦',
    desc: 'Google Gemini',
  },
]

export function Step3Launch({ data, onNext }) {
  const [launched, setLaunched] = useState(null)

  const handleLaunch = async (tool) => {
    const prompt = buildPrompt(data)
    await navigator.clipboard.writeText(prompt)
    window.open(tool.url, '_blank')
    setLaunched(tool.name)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Launch Your AI Tool</h2>
        <p className="text-sm text-gray-500 mt-1">
          Click a button below — the prompt will be copied to your clipboard and the AI tool will open in a new tab.
          Paste the prompt, get the structured output, then come back here.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {AI_TOOLS.map(tool => (
          <button
            key={tool.name}
            onClick={() => handleLaunch(tool)}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all cursor-pointer ${
              launched === tool.name ? tool.activeColor : `border-gray-200 bg-white ${tool.color}`
            }`}
          >
            <span className="text-4xl">{tool.logo}</span>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{tool.name}</p>
              <p className="text-xs text-gray-500">{tool.desc}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <ExternalLink size={12} /> Opens in new tab
            </div>
          </button>
        ))}
      </div>

      {launched && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 size={16} />
            Prompt copied! {launched} opened in a new tab. Paste the prompt, copy the structured output, then click below.
          </div>
          <Button size="sm" onClick={onNext}>
            I have the output →
          </Button>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/steps/Step3Launch.jsx
git commit -m "feat: add step 3 - AI launcher with clipboard copy and new tab"
```

---

## Task 11: Step 4 — Paste Output

**Files:**
- Create: `src/components/steps/Step4Paste.jsx`

**Step 1: Create `src/components/steps/Step4Paste.jsx`**

```jsx
import { useState } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { parseAIOutput } from '@/lib/outputParser'

export function Step4Paste({ update, onNext }) {
  const [raw, setRaw] = useState('')

  const handleParse = () => {
    const parsed = parseAIOutput(raw)
    update(parsed)
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Paste AI Output</h2>
        <p className="text-sm text-gray-500 mt-1">
          Copy the structured bug output from your AI tool and paste it below.
          We'll automatically parse it into form fields for you to review.
        </p>
      </div>

      <Textarea
        label="Structured Bug Output"
        placeholder={`Paste the AI output here. It should look like:\n\nBUG TITLE: ...\nMODULE: ...\nSTEPS TO REPRODUCE:\n1. ...\nEXPECTED RESULT: ...\nACTUAL RESULT: ...\nPRIORITY: ...\nSEVERITY: ...`}
        rows={12}
        value={raw}
        onChange={e => setRaw(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Leave empty to use mock data for demo purposes.
        </p>
        <Button onClick={handleParse}>
          Parse & Continue →
        </Button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/steps/Step4Paste.jsx
git commit -m "feat: add step 4 - paste AI output with auto-parse"
```

---

## Task 12: Step 5 — Review & Edit

**Files:**
- Create: `src/components/steps/Step5Review.jsx`

**Step 1: Create `src/components/steps/Step5Review.jsx`**

```jsx
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { PRIORITIES, SEVERITIES, MODULES, ENVIRONMENTS } from '@/lib/mockData'

export function Step5Review({ data, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Review & Edit</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fields have been pre-filled from the AI output. Edit anything that looks off before submitting.
        </p>
      </div>

      <Input
        label="Bug Title"
        value={data.title}
        onChange={e => update({ title: e.target.value })}
        placeholder="Enter bug title..."
      />

      <Textarea
        label="Steps to Reproduce"
        rows={5}
        value={data.steps}
        onChange={e => update({ steps: e.target.value })}
        placeholder="1. Step one&#10;2. Step two"
      />

      <div className="grid grid-cols-2 gap-4">
        <Textarea
          label="Expected Result"
          rows={3}
          value={data.expectedResult}
          onChange={e => update({ expectedResult: e.target.value })}
          placeholder="What should happen..."
        />
        <Textarea
          label="Actual Result"
          rows={3}
          value={data.actualResult}
          onChange={e => update({ actualResult: e.target.value })}
          placeholder="What actually happened..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" options={PRIORITIES} value={data.priority} onChange={e => update({ priority: e.target.value })} />
        <Select label="Severity" options={SEVERITIES} value={data.severity} onChange={e => update({ severity: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Module" options={MODULES} value={data.module} onChange={e => update({ module: e.target.value })} />
        <Select label="Environment" options={ENVIRONMENTS} value={data.environment} onChange={e => update({ environment: e.target.value })} />
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/steps/Step5Review.jsx
git commit -m "feat: add step 5 - review and edit parsed bug fields"
```

---

## Task 13: Step 6 — Attach Screenshots

**Files:**
- Create: `src/components/steps/Step6Attach.jsx`

**Step 1: Create `src/components/steps/Step6Attach.jsx`**

```jsx
import { useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Step6Attach({ data, update }) {
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const newAttachments = [...data.attachments]
    Array.from(files).slice(0, 5 - newAttachments.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        update({
          attachments: [...newAttachments, {
            id: crypto.randomUUID(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            url: e.target.result,
          }]
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const removeAttachment = (id) => {
    update({ attachments: data.attachments.filter(a => a.id !== id) })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Attach Screenshots</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload screenshots or screen recordings to help reproduce the bug. (Optional — max 5 files)
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-10 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Upload size={32} className="text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP up to 5 files</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails */}
      {data.attachments.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {data.attachments.map(file => (
            <div key={file.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="rounded-full bg-white p-1 text-gray-700 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="px-2 py-1 bg-white">
                <p className="text-xs text-gray-600 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.attachments.length === 0 && (
        <p className="text-center text-sm text-gray-400">No screenshots yet. You can skip this step.</p>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/steps/Step6Attach.jsx
git commit -m "feat: add step 6 - screenshot upload with drag and drop"
```

---

## Task 14: Step 7 — Submit Summary

**Files:**
- Create: `src/components/steps/Step7Submit.jsx`

**Step 1: Create `src/components/steps/Step7Submit.jsx`**

```jsx
import { ImageIcon } from 'lucide-react'

const Row = ({ label, value }) => value ? (
  <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className="col-span-2 text-sm text-gray-900 whitespace-pre-wrap">{value}</span>
  </div>
) : null

export function Step7Submit({ data }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
        <p className="text-sm text-gray-500 mt-1">
          This is a final summary of your bug report. Hit Submit below to create the work item in Azure DevOps.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bug Details</p>
        </div>
        <div className="px-4 py-2">
          <Row label="Title" value={data.title} />
          <Row label="Module" value={data.module} />
          <Row label="Environment" value={data.environment} />
          <Row label="Priority" value={data.priority} />
          <Row label="Severity" value={data.severity} />
          <Row label="Steps to Reproduce" value={data.steps} />
          <Row label="Expected Result" value={data.expectedResult} />
          <Row label="Actual Result" value={data.actualResult} />
        </div>
        {data.attachments.length > 0 && (
          <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon size={15} />
            {data.attachments.length} screenshot{data.attachments.length > 1 ? 's' : ''} attached
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/steps/Step7Submit.jsx
git commit -m "feat: add step 7 - submission summary view"
```

---

## Task 15: Result View

**Files:**
- Create: `src/components/Result.jsx`

**Step 1: Create `src/components/Result.jsx`**

```jsx
import { CheckCircle2, ExternalLink, Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export function Result({ bugId, title, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 space-y-8 text-center py-12">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bug Submitted Successfully!</h2>
        <p className="mt-2 text-gray-500">Your bug report has been created in Azure DevOps.</p>
      </div>

      {/* Mock work item card */}
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-md text-left overflow-hidden">
        <div className="bg-blue-600 px-4 py-3 flex items-center gap-2">
          <Bug size={16} className="text-white" />
          <span className="text-white text-sm font-semibold">Azure DevOps Work Item</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-blue-600">{bugId}</span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Active
            </span>
          </div>
          <p className="font-semibold text-gray-900 text-sm leading-snug">
            {title || 'Bug Report'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div><span className="font-medium">Type:</span> Bug</div>
            <div><span className="font-medium">Assigned To:</span> Unassigned</div>
            <div><span className="font-medium">Created:</span> {formatDate()}</div>
            <div><span className="font-medium">Priority:</span> High</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
          <ExternalLink size={15} /> View in Azure DevOps
        </Button>
        <Button onClick={onReset}>
          + Create Another Bug
        </Button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Result.jsx
git commit -m "feat: add result view with mock Azure DevOps work item card"
```

---

## Task 16: Wire Up + Final Polish

**Files:**
- Modify: `src/index.css`
- Verify: all imports resolve, dev server runs cleanly

**Step 1: Update `src/index.css` for base styles**

```css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

**Step 2: Run dev server and walk through the full flow manually**

```bash
npm run dev
```

Manual checklist:
- [ ] Dashboard loads with mock bugs and stats
- [ ] "New Bug" / "Create Draft" opens wizard
- [ ] Progress bar shows correct step highlights
- [ ] Step 1: type description, select module + env → Next
- [ ] Step 2: prompt renders with description, Copy Prompt works
- [ ] Step 3: all 3 AI buttons open real URLs in new tab, clipboard copy works, "I have the output" button appears
- [ ] Step 4: paste box works, Parse & Continue populates Step 5 fields
- [ ] Step 5: all fields editable inline
- [ ] Step 6: drag-and-drop and click-to-upload work, thumbnails show, × removes
- [ ] Step 7: summary shows all fields
- [ ] Submit: spinner shows for ~1.5s then Result view appears
- [ ] Result: mock bug ID and work item card shown, "Create Another Bug" resets flow

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete bug draft UI prototype - full 7-step wizard flow"
```

---

## Quick Reference: File Tree

```
azure-bug-creator/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── index.css
│   ├── main.jsx
│   ├── App.jsx
│   ├── hooks/
│   │   └── useWizard.js
│   ├── lib/
│   │   ├── utils.js
│   │   ├── mockData.js
│   │   ├── promptBuilder.js
│   │   └── outputParser.js
│   └── components/
│       ├── Navbar.jsx
│       ├── Dashboard.jsx
│       ├── Wizard.jsx
│       ├── ProgressBar.jsx
│       ├── Result.jsx
│       ├── ui/
│       │   ├── Button.jsx
│       │   ├── Badge.jsx
│       │   ├── Input.jsx
│       │   ├── Textarea.jsx
│       │   ├── Select.jsx
│       │   └── Card.jsx
│       └── steps/
│           ├── Step1Describe.jsx
│           ├── Step2Prompt.jsx
│           ├── Step3Launch.jsx
│           ├── Step4Paste.jsx
│           ├── Step5Review.jsx
│           ├── Step6Attach.jsx
│           └── Step7Submit.jsx
└── docs/
    └── plans/
        ├── 2026-03-30-bug-draft-ui-prototype-design.md
        └── 2026-03-30-bug-draft-ui-prototype.md
```
