import { describe, expect, it } from 'vitest'
import { parseAIOutputDetails } from '@/lib/outputParser'

describe('parseAIOutputDetails', () => {
  it('extracts structured fields from Gemini-style output with extra commentary', () => {
    const sample = `Since I’m wearing my QA hat today, let’s get this documented properly.

Here is your structured report:

**BUG TITLE:** Lead Details page displays a blank screen upon browser refresh
**MODULE:** Login
**ENVIRONMENT:** QA
**STEPS TO REPRODUCE:**
1. Log in to the application.
2. Navigate to the "Leads" section.
3. Click on a specific lead to open the Lead Details page.
4. Refresh the browser (F5 or browser refresh button).
**EXPECTED RESULT:** The Lead Details page should reload and display the specific lead's information correctly.
**ACTUAL RESULT:** The page goes entirely blank (White Screen of Death); data fails to persist or reload.
**PRIORITY:** High
**SEVERITY:** 2 - Major

---

Would you like me to draft a few **Test Cases** to verify the fix once the developers submit their code?`

    const parsed = parseAIOutputDetails(sample)

    expect(parsed.result.title).toBe('Lead Details page displays a blank screen upon browser refresh')
    expect(parsed.result.module).toBe('Login')
    expect(parsed.result.environment).toBe('QA')
    expect(parsed.result.priority).toBe('High')
    expect(parsed.result.severity).toBe('2 - Major')
    expect(parsed.result.steps).toContain('Navigate to the "Leads" section.')
    expect(parsed.warnings.length).toBeGreaterThan(0)
  })

  it('returns empty fields and warnings when no usable output is present', () => {
    const parsed = parseAIOutputDetails('')

    expect(parsed.usedMockData).toBe(false)
    expect(parsed.result.title).toBe('')
    expect(parsed.missingFields).toContain('title')
    expect(parsed.warnings[0]).toMatch(/No AI output detected/)
  })
})
