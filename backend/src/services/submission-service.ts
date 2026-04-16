import crypto from 'node:crypto'

import type { SubmissionRecord } from '../types/domain.js'
import { createSubmissionRecord } from '../repositories/store.js'
import { submitDraftToAzure } from './azure-devops-service.js'
import { persistDraft } from './draft-service.js'
import { validateSubmitPayload } from './validation-service.js'
import type { DraftRecord } from '../types/domain.js'

export async function submitDraft(draft: DraftRecord) {
  const validation = validateSubmitPayload(draft)
  if (!validation.ok) {
    throw new Error(`Draft is missing required fields: ${validation.missing.join(', ')}`)
  }

  draft.status = 'submitting'
  draft.updatedAt = new Date().toISOString()
  await persistDraft(draft)

  try {
    const azure = await submitDraftToAzure(draft)
    draft.status = 'submitted'
    draft.updatedAt = new Date().toISOString()
    await persistDraft(draft)

    const record: SubmissionRecord = {
      id: crypto.randomUUID(),
      draftId: draft.id,
      azureBugId: azure.azureBugId,
      azureBugUrl: azure.azureBugUrl,
      status: 'submitted',
      requestPayload: {
        title: draft.title,
        priority: draft.priority,
        severity: draft.severity,
        linkedUserStoryId: draft.linkedUserStoryId,
        linkedUserStoryMode: draft.linkedUserStoryMode,
      },
      responsePayload: azure.responsePayload,
      submittedAt: new Date().toISOString(),
    }

    return createSubmissionRecord(record)
  } catch (error) {
    draft.status = 'failed'
    draft.updatedAt = new Date().toISOString()
    await persistDraft(draft)
    throw error
  }
}
