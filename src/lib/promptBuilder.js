export function buildPrompt({ description, module, environment }) {
  return `You are a QA engineer generating an Azure DevOps bug draft.
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

Rules:
- Return ONLY the bug report.
- Do NOT add commentary, explanations, introductions, conclusions, or follow-up questions.
- Do NOT use markdown, bold text, bullet formatting outside the numbered reproduction steps, or code fences.
- Keep MODULE exactly as "${module}".
- Keep ENVIRONMENT exactly as "${environment}".
- Treat MODULE as the exact bug location or product path where the issue occurs.
- Use MODULE to make the bug title immediately scannable.
- Prefer a title pattern like: "${module} >> <clear bug summary>".
- Make the title specific and location-first, similar to:
  - "Lead Listing Page >> Rows per page value changes to 10 after sorting"
  - "CRM >> Lead >> Quick Filter >> Maximum 6 rows display in popup"
- Include the module/location and environment naturally in the generated bug content so the Azure fields stay consistent.
- Start the response with "BUG TITLE:" and end the response with the SEVERITY line.

Bug Description:
${description}`
}

const STORY_CONTEXT_START = 'USER_STORY_CONTEXT_START'
const STORY_CONTEXT_END = 'USER_STORY_CONTEXT_END'

export function removeUserStoryContext(prompt) {
  if (!prompt) return ''
  const startIndex = prompt.indexOf(STORY_CONTEXT_START)
  if (startIndex === -1) return prompt

  const endIndex = prompt.indexOf(STORY_CONTEXT_END, startIndex)
  if (endIndex === -1) {
    return prompt.slice(0, startIndex).trimEnd()
  }

  const before = prompt.slice(0, startIndex).trimEnd()
  const after = prompt.slice(endIndex + STORY_CONTEXT_END.length).trimStart()
  return [before, after].filter(Boolean).join('\n\n')
}

export function appendUserStoryContext(prompt, contextBlock) {
  const base = removeUserStoryContext((prompt || '').trim())
  const context = (contextBlock || '').trim()
  if (!context) return base
  return base ? `${base}\n\n${context}` : context
}
