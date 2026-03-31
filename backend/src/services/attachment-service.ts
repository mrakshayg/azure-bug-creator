import crypto from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { AttachmentRecord, DraftRecord } from '../types/domain.js'
import { env } from '../config/env.js'
import { ensureUploadDirectory, resolveUploadPath } from '../lib/fs-store.js'
import { addAttachmentRecord, saveDraftRecord } from '../repositories/store.js'

export async function saveAttachment(draft: DraftRecord, file: Express.Multer.File) {
  await ensureUploadDirectory()

  const extension = path.extname(file.originalname)
  const storageKey = `${draft.id}/${crypto.randomUUID()}${extension}`
  const fullPath = resolveUploadPath(storageKey)
  await mkdir(path.dirname(fullPath), { recursive: true })
  await writeFile(fullPath, file.buffer)

  const attachment: AttachmentRecord = {
    id: crypto.randomUUID(),
    draftId: draft.id,
    storageKey,
    fileName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
  }

  await addAttachmentRecord(draft.id, attachment)
  draft.attachments.push(attachment)
  draft.updatedAt = new Date().toISOString()
  await saveDraftRecord(draft)

  return attachment
}
