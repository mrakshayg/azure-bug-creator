import { MOCK_PARSED_OUTPUT } from './mockData'

export function parseAIOutput(text) {
  if (!text || text.trim().length < 20) return MOCK_PARSED_OUTPUT

  const extract = (label) => {
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

  const hasContent = result.title && result.steps && result.expectedResult && result.actualResult
  return hasContent ? result : { ...MOCK_PARSED_OUTPUT, ...Object.fromEntries(Object.entries(result).filter(([, v]) => v)) }
}
