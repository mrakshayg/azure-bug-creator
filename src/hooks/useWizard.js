import { useEffect, useMemo, useRef, useState } from 'react'
import { validateWizardStep } from '@/lib/wizardValidation'
import { createDraft, submitDraft as submitDraftRequest, updateDraft, uploadAttachment as uploadAttachmentRequest } from '@/lib/api'

const STORAGE_KEY = 'bugdraft-wizard-draft'

const INITIAL_STATE = {
  description: '',
  module: '',
  environment: 'UAT',
  prompt: '',
  title: '',
  steps: '',
  expectedResult: '',
  actualResult: '',
  priority: 'High',
  severity: '2 - Major',
  attachments: [],
  submittedBugId: null,
  submittedBugUrl: '',
  submittedAt: '',
  promptWasInvalidated: false,
  draftId: null,
}

function buildDraftPayload(data) {
  return {
    description: data.description,
    module: data.module,
    environment: data.environment,
    prompt: data.prompt,
    title: data.title,
    steps: data.steps,
    expectedResult: data.expectedResult,
    actualResult: data.actualResult,
    priority: data.priority,
    severity: data.severity,
    parserWarnings: data.parserWarnings ?? [],
  }
}

function sanitizeDraft(parsedDraft) {
  return {
    ...INITIAL_STATE,
    ...parsedDraft,
    attachments: Array.isArray(parsedDraft?.attachments) ? parsedDraft.attachments : [],
    draftId: parsedDraft?.draftId ?? null,
    submittedBugId: null,
    submittedBugUrl: '',
    submittedAt: '',
    promptWasInvalidated: Boolean(parsedDraft?.promptWasInvalidated),
  }
}

export function useWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_STATE

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) return INITIAL_STATE
      const parsed = JSON.parse(saved)
      return sanitizeDraft(parsed.data)
    } catch {
      return INITIAL_STATE
    }
  })
  const [draftRestored, setDraftRestored] = useState(() => {
    if (typeof window === 'undefined') return false

    try {
      return Boolean(window.localStorage.getItem(STORAGE_KEY))
    } catch {
      return false
    }
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [syncError, setSyncError] = useState('')
  const [syncState, setSyncState] = useState('idle')
  const updateTimeoutRef = useRef(null)
  const isCreatingDraftRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) return

      const parsed = JSON.parse(saved)
      if (typeof parsed.currentStep === 'number') {
        setCurrentStep(Math.min(Math.max(parsed.currentStep, 1), 7))
      }
      if (parsed.savedAt) {
        setLastSavedAt(parsed.savedAt)
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || submitted) return

    const payload = {
      currentStep,
      data,
      savedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setLastSavedAt(payload.savedAt)
  }, [currentStep, data, submitted])

  useEffect(() => {
    if (submitted) return
    if (isCreatingDraftRef.current) return

    if (!data.draftId) {
      isCreatingDraftRef.current = true
      setSyncState('syncing')
      createDraft(buildDraftPayload(data))
        .then((draft) => {
          setData(prev => ({ ...prev, draftId: draft.id }))
          setSyncState('saved')
          setSyncError('')
        })
        .catch((error) => {
          setSyncState('error')
          setSyncError(error.message || 'Failed to create backend draft.')
        })
        .finally(() => {
          isCreatingDraftRef.current = false
        })
    }
  }, [data, submitted])

  useEffect(() => {
    if (!data.draftId || submitted) return

    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = window.setTimeout(() => {
      setSyncState('syncing')
      updateDraft(data.draftId, buildDraftPayload(data))
        .then(() => {
          setSyncState('saved')
          setSyncError('')
        })
        .catch((error) => {
          setSyncState('error')
          setSyncError(error.message || 'Failed to sync draft.')
        })
    }, 400)

    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [data, submitted])

  const update = (fields) => {
    setData(prev => {
      const nextFields = typeof fields === 'function' ? fields(prev) : fields
      const nextData = { ...prev, ...nextFields }
      const promptSourceChanged = ['description', 'module', 'environment']
        .some(field => Object.hasOwn(nextFields, field) && nextFields[field] !== prev[field])

      if (promptSourceChanged && prev.prompt && !Object.hasOwn(nextFields, 'prompt')) {
        nextData.prompt = ''
        nextData.promptWasInvalidated = true
      }

      if (Object.hasOwn(nextFields, 'prompt')) {
        nextData.promptWasInvalidated = false
      }

      return nextData
    })

    setErrors(prevErrors => {
      const nextFields = typeof fields === 'function' ? null : fields
      if (!nextFields) return prevErrors

      const nextErrors = { ...prevErrors }
      Object.keys(nextFields).forEach(field => {
        delete nextErrors[field]
      })
      return nextErrors
    })
  }

  const validateCurrentStep = (step = currentStep) => {
    const result = validateWizardStep(step, data)
    setErrors(result.errors)
    return result
  }

  const next = () => {
    const validation = validateCurrentStep()
    if (!validation.isValid) return false

    setCurrentStep(s => Math.min(s + 1, 7))
    return true
  }

  const back = () => setCurrentStep(s => Math.max(s - 1, 1))
  const goTo = (step) => setCurrentStep(step)

  const submit = () => {
    const validation = validateCurrentStep(7)
    if (!validation.isValid) {
      setCurrentStep(7)
      return false
    }

    setSubmitting(true)
    const finalize = async () => {
      try {
        let draftId = data.draftId
        if (!draftId) {
          const created = await createDraft(buildDraftPayload(data))
          draftId = created.id
          setData(prev => ({ ...prev, draftId }))
        } else {
          await updateDraft(draftId, buildDraftPayload(data))
        }

        const submission = await submitDraftRequest(draftId)
        setData(prev => ({
          ...prev,
          draftId,
          submittedBugId: submission.azureBugId,
          submittedBugUrl: submission.azureBugUrl,
          submittedAt: submission.submittedAt,
        }))
        setSubmitted(true)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Submit failed.',
        }))
      } finally {
        setSubmitting(false)
      }
    }

    void finalize()

    return true
  }

  const uploadAttachment = async (file, preview) => {
    let draftId = data.draftId
    if (!draftId) {
      const created = await createDraft(buildDraftPayload(data))
      draftId = created.id
      setData(prev => ({ ...prev, draftId }))
    }

    const uploaded = await uploadAttachmentRequest(draftId, file)
    update((currentData) => ({
      attachments: [...currentData.attachments, {
        id: uploaded.id,
        name: uploaded.fileName,
        size: `${(uploaded.sizeBytes / 1024).toFixed(1)} KB`,
        bytes: uploaded.sizeBytes,
        type: uploaded.mimeType,
        url: preview,
      }],
    }))
    return uploaded
  }

  const reset = () => {
    setData(INITIAL_STATE)
    setCurrentStep(1)
    setSubmitted(false)
    setSubmitting(false)
    setErrors({})
    setDraftRestored(false)
    setLastSavedAt(null)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const saveLabel = useMemo(() => {
    if (syncState === 'syncing') return 'Syncing draft to backend...'
    if (syncState === 'error') return syncError || 'Draft sync failed.'
    if (!lastSavedAt) return 'Draft autosaves locally.'
    const savedAt = new Date(lastSavedAt)
    return `Draft autosaved at ${savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
  }, [lastSavedAt, syncError, syncState])

  return {
    currentStep,
    data,
    update,
    next,
    back,
    goTo,
    submit,
    submitting,
    submitted,
    reset,
    errors,
    validateCurrentStep,
    draftRestored,
    lastSavedAt,
    saveLabel,
    uploadAttachment,
    syncState,
    syncError,
  }
}
