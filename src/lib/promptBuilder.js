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
