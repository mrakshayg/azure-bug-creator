import { useState } from 'react'
import { generateBugId } from '@/lib/utils'

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
