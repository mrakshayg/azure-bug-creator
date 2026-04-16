import crypto from 'node:crypto'

import type { DraftRecord } from '../types/domain.js'
import { createDraftRecord, getDraftRecord, listDraftRecords, saveDraftRecord, updateDraftRecord } from '../repositories/store.js'
import { draftPayloadSchema } from './validation-service.js'

export async function listDrafts(userId: string) {
  return listDraftRecords(userId)
}

export async function getDraft(userId: string, draftId: string) {
  return getDraftRecord(userId, draftId)
}

export async function createDraft(userId: string, payload: unknown) {
  const parsed = draftPayloadSchema.partial().parse(payload)
  const now = new Date().toISOString()
  const draft: DraftRecord = {
    id: crypto.randomUUID(),
    userId,
    status: 'draft',
    description: parsed.description ?? '',
    module: parsed.module ?? '',
    environment: parsed.environment ?? 'UAT',
    prompt: parsed.prompt ?? '',
    title: parsed.title ?? '',
    steps: parsed.steps ?? '',
    expectedResult: parsed.expectedResult ?? '',
    actualResult: parsed.actualResult ?? '',
    priority: parsed.priority ?? 'High',
    severity: parsed.severity ?? '2 - Major',
    linkedUserStoryId: parsed.linkedUserStoryId ?? '',
    linkedUserStoryMode: parsed.linkedUserStoryMode ?? 'Child',
    parserWarnings: parsed.parserWarnings ?? [],
    attachments: [],
    createdAt: now,
    updatedAt: now,
  }

  return createDraftRecord(draft)
}

export async function updateDraft(userId: string, draftId: string, payload: unknown) {
  const parsed = draftPayloadSchema.partial().parse(payload)
  return updateDraftRecord(userId, draftId, {
    ...parsed,
    updatedAt: new Date().toISOString(),
  })
}

export async function persistDraft(draft: DraftRecord) {
  return saveDraftRecord(draft)
}
