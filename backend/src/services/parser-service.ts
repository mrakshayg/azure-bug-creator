const MOCK_PARSED_OUTPUT = {
  title: 'Login page crashes on submitting empty password field',
  steps: '1. Navigate to the login page\n2. Enter a valid username\n3. Leave the password field empty\n4. Click the "Login" button',
  expectedResult: 'An inline validation message should appear: "Password is required"',
  actualResult: 'The page crashes with a white screen and console error: TypeError: Cannot read property of undefined',
  priority: 'High',
  severity: '2 - Major',
}

const REQUIRED_FIELDS = ['title', 'steps', 'expectedResult', 'actualResult', 'priority', 'severity'] as const

type ParsedDraft = {
  title: string
  module: string
  environment: string
  steps: string
  expectedResult: string
  actualResult: string
  priority: string
  severity: string
}

function normalizeOutput(text: string) {
  return text.replace(/\r/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/^[-*_]{3,}\s*$/gm, '').trim()
}

export function parseAiOutputDetails(text: string) {
  if (!text || text.trim().length < 20) {
    return {
      result: { ...MOCK_PARSED_OUTPUT, module: '', environment: '' },
      warnings: ['No AI output detected. Demo content will be used until you paste a real response.'],
      usedMockData: true,
      missingFields: [] as string[],
    }
  }

  const normalizedText = normalizeOutput(text)

  const extractSingleLine = (label: string) => {
    const pattern = new RegExp(`(?:^|\\n)\\s*${label}\\s*:\\s*([^\\n]+)`, 'i')
    const match = normalizedText.match(pattern)
    return match ? match[1].trim() : ''
  }

  const extractMultiline = (label: string) => {
    const pattern = new RegExp(`(?:^|\\n)\\s*${label}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*[A-Z ]+\\s*:|$)`, 'i')
    const match = normalizedText.match(pattern)
    return match ? match[1].trim() : ''
  }

  const result: ParsedDraft = {
    title: extractSingleLine('BUG TITLE'),
    module: extractSingleLine('MODULE'),
    environment: extractSingleLine('ENVIRONMENT'),
    steps: extractMultiline('STEPS TO REPRODUCE'),
    expectedResult: extractSingleLine('EXPECTED RESULT'),
    actualResult: extractSingleLine('ACTUAL RESULT'),
    priority: extractSingleLine('PRIORITY'),
    severity: extractSingleLine('SEVERITY'),
  }

  const missingFields = REQUIRED_FIELDS.filter((field) => !result[field])
  const warnings: string[] = []

  if (normalizedText !== text.trim()) warnings.push('Markdown styling or separator text was ignored during parsing.')
  if (!normalizedText.startsWith('BUG TITLE:')) warnings.push('Extra commentary before the structured report was ignored.')
  if (missingFields.length > 0) warnings.push(`Some fields were not detected cleanly: ${missingFields.join(', ')}. Mock fallbacks filled the gaps.`)

  return {
    result: missingFields.length > 0
      ? { ...MOCK_PARSED_OUTPUT, ...result }
      : result,
    warnings,
    usedMockData: missingFields.length > 0,
    missingFields,
  }
}
