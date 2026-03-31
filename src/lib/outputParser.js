const REQUIRED_FIELDS = ['title', 'steps', 'expectedResult', 'actualResult', 'priority', 'severity']

function normalizeOutput(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .trim()
}

export function parseAIOutputDetails(text) {
  if (!text || text.trim().length < 20) {
    return {
      result: {
        title: '',
        module: '',
        environment: '',
        steps: '',
        expectedResult: '',
        actualResult: '',
        priority: '',
        severity: '',
      },
      warnings: ['No AI output detected yet. Paste the structured model response to continue.'],
      usedMockData: false,
      missingFields: REQUIRED_FIELDS,
    }
  }

  const normalizedText = normalizeOutput(text)

  const extractSingleLine = (label) => {
    const pattern = new RegExp(`(?:^|\\n)\\s*${label}\\s*:\\s*([^\\n]+)`, 'i')
    const match = normalizedText.match(pattern)
    return match ? match[1].trim() : ''
  }

  const extractMultiline = (label) => {
    const pattern = new RegExp(`(?:^|\\n)\\s*${label}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*[A-Z ]+\\s*:|$)`, 'i')
    const match = normalizedText.match(pattern)
    return match ? match[1].trim() : ''
  }

  const result = {
    title: extractSingleLine('BUG TITLE'),
    module: extractSingleLine('MODULE'),
    environment: extractSingleLine('ENVIRONMENT'),
    steps: extractMultiline('STEPS TO REPRODUCE'),
    expectedResult: extractSingleLine('EXPECTED RESULT'),
    actualResult: extractSingleLine('ACTUAL RESULT'),
    priority: extractSingleLine('PRIORITY'),
    severity: extractSingleLine('SEVERITY'),
  }

  const missingFields = REQUIRED_FIELDS.filter(field => !result[field])
  const warnings = []

  if (normalizedText !== text.trim()) {
    warnings.push('Markdown styling or separator text was ignored during parsing.')
  }

  if (!normalizedText.startsWith('BUG TITLE:')) {
    warnings.push('Extra commentary before the structured report was ignored.')
  }

  if (missingFields.length > 0) {
    warnings.push(`Some fields were not detected cleanly: ${missingFields.join(', ')}.`)
  }

  return {
    result,
    warnings,
    usedMockData: false,
    missingFields,
  }
}

export function parseAIOutput(text) {
  return parseAIOutputDetails(text).result
}
