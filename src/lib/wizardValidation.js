const REQUIRED_REVIEW_FIELDS = [
  ['title', 'Bug title is required.'],
  ['steps', 'Steps to reproduce are required.'],
  ['expectedResult', 'Expected result is required.'],
  ['actualResult', 'Actual result is required.'],
  ['module', 'Module or bug location is required.'],
  ['environment', 'Environment is required.'],
  ['priority', 'Priority is required.'],
  ['severity', 'Severity is required.'],
]

function hasText(value, minimumLength = 1) {
  return typeof value === 'string' && value.trim().length >= minimumLength
}

export function validateWizardStep(step, data) {
  const errors = {}

  if (step === 1 && !hasText(data.description, 20)) {
    errors.description = 'Add at least 20 characters so the AI has enough context.'
  }

  if (step === 1 && !hasText(data.module, 3)) {
    errors.module = 'Add the page, module, or flow where the bug resides.'
  }

  if (step === 2 && !hasText(data.prompt, 20)) {
    const prompt = data.prompt || buildPrompt(data)
    if (!hasText(prompt, 20)) {
      errors.prompt = 'Prompt cannot be empty. Edit or regenerate it before continuing.'
    }
  }

  if (step === 4 && !hasText(data.title) && !hasText(data.steps)) {
    errors.rawOutput = 'Paste AI output or continue with the demo preview so review fields are populated.'
  }

  if (step === 5 || step === 7) {
    REQUIRED_REVIEW_FIELDS.forEach(([field, message]) => {
      if (!hasText(data[field])) {
        errors[field] = message
      }
    })
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
import { buildPrompt } from '@/lib/promptBuilder'
