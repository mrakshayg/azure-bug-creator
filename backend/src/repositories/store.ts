import { getPrismaClient } from '../lib/prisma.js'
import type { AttachmentRecord, AzureConnectionRecord, DraftRecord, DraftStatus, StoredUser, SubmissionRecord } from '../types/domain.js'

function getParserWarnings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function mapAttachment(record: any): AttachmentRecord {
  return {
    id: record.id,
    draftId: record.draftId,
    storageKey: record.storageKey,
    fileName: record.fileName,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    status: record.status,
    azureAttachmentUrl: record.azureAttachmentUrl ?? undefined,
    createdAt: new Date(record.createdAt).toISOString(),
  }
}

function mapSubmission(record: any): SubmissionRecord {
  return {
    id: record.id,
    draftId: record.draftId,
    azureBugId: record.azureBugId ?? '',
    azureBugUrl: record.azureBugUrl ?? '',
    status: record.status,
    requestPayload: (record.requestPayloadJson ?? {}) as Record<string, unknown>,
    responsePayload: (record.responsePayloadJson ?? {}) as Record<string, unknown>,
    submittedAt: new Date(record.submittedAt ?? Date.now()).toISOString(),
    errorMessage: record.errorMessage ?? undefined,
  }
}

function mapDraft(record: any): DraftRecord {
  return {
    id: record.id,
    userId: record.userId,
    status: record.status as DraftStatus,
    description: record.description ?? '',
    module: record.module ?? '',
    environment: record.environment ?? '',
    prompt: record.prompt ?? '',
    title: record.title ?? '',
    steps: record.steps ?? '',
    expectedResult: record.expectedResult ?? '',
    actualResult: record.actualResult ?? '',
    priority: record.priority ?? '',
    severity: record.severity ?? '',
    parserWarnings: getParserWarnings(record.parserWarningsJson),
    attachments: Array.isArray(record.attachments) ? record.attachments.map(mapAttachment) : [],
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  }
}

function mapUser(record: any): StoredUser {
  return {
    id: record.id,
    email: record.email ?? undefined,
    displayName: record.displayName ?? undefined,
    authIdentityKey: record.authIdentityKey ?? undefined,
    createdAt: new Date(record.createdAt).toISOString(),
    lastLoginAt: new Date(record.lastLoginAt ?? record.createdAt).toISOString(),
  }
}

function mapAzureConnection(record: any): AzureConnectionRecord {
  return {
    id: record.id,
    userId: record.userId,
    organizationUrl: record.organizationUrl ?? undefined,
    projectName: record.projectName ?? undefined,
    accessToken: record.encryptedAccessToken ?? undefined,
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  }
}

async function prisma() {
  const client = await getPrismaClient()
  if (!client) {
    throw new Error('Prisma client unavailable.')
  }
  return client
}

async function findUserInPrisma(where: Record<string, unknown>) {
  return (await prisma()).user.findFirst({
    where,
    include: {
      connections: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  })
}

export async function getAzureConnectionForUser(userId: string) {
  const record = await (await prisma()).azureConnection.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })

  return record ? mapAzureConnection(record) : null
}

export async function upsertStoredUser(params: {
  email?: string
  displayName?: string
  authIdentityKey: string
}) {
  const existing = await findUserInPrisma({
    OR: [
      { authIdentityKey: params.authIdentityKey },
      params.email ? { email: params.email } : undefined,
    ].filter(Boolean),
  })

  const user = existing
    ? await (await prisma()).user.update({
        where: { id: existing.id },
        data: {
          email: params.email ?? existing.email,
          displayName: params.displayName ?? existing.displayName,
          authIdentityKey: params.authIdentityKey,
          lastLoginAt: new Date(),
        },
        include: { connections: true },
      })
    : await (await prisma()).user.create({
        data: {
          email: params.email,
          displayName: params.displayName,
          authIdentityKey: params.authIdentityKey,
          lastLoginAt: new Date(),
        },
        include: { connections: true },
      })

  return mapUser(user)
}

export async function upsertAzureConnectionForUser(params: {
  userId: string
  organizationUrl?: string
  projectName?: string
  accessToken?: string
}) {
  const existing = await (await prisma()).azureConnection.findFirst({
    where: { userId: params.userId },
    orderBy: { updatedAt: 'desc' },
  })

  const record = existing
    ? await (await prisma()).azureConnection.update({
        where: { id: existing.id },
        data: {
          organizationUrl: params.organizationUrl ?? existing.organizationUrl,
          projectName: params.projectName ?? existing.projectName,
          encryptedAccessToken: params.accessToken ?? existing.encryptedAccessToken,
        },
      })
    : await (await prisma()).azureConnection.create({
        data: {
          userId: params.userId,
          organizationUrl: params.organizationUrl,
          projectName: params.projectName,
          encryptedAccessToken: params.accessToken,
        },
      })

  return mapAzureConnection(record)
}

export async function listDraftRecords(userId: string) {
  const drafts = await (await prisma()).bugDraft.findMany({
    where: { userId },
    include: {
      attachments: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return drafts.map(mapDraft)
}

export async function getDraftRecord(userId: string, draftId: string) {
  const draft = await (await prisma()).bugDraft.findFirst({
    where: { id: draftId, userId },
    include: {
      attachments: { orderBy: { createdAt: 'asc' } },
    },
  })

  return draft ? mapDraft(draft) : null
}

export async function createDraftRecord(draft: DraftRecord) {
  const created = await (await prisma()).bugDraft.create({
    data: {
      id: draft.id,
      userId: draft.userId,
      status: draft.status,
      description: draft.description,
      module: draft.module,
      environment: draft.environment,
      prompt: draft.prompt,
      title: draft.title,
      steps: draft.steps,
      expectedResult: draft.expectedResult,
      actualResult: draft.actualResult,
      priority: draft.priority,
      severity: draft.severity,
      parserWarningsJson: draft.parserWarnings,
      createdAt: new Date(draft.createdAt),
      updatedAt: new Date(draft.updatedAt),
    },
    include: {
      attachments: { orderBy: { createdAt: 'asc' } },
    },
  })

  return mapDraft(created)
}

export async function updateDraftRecord(userId: string, draftId: string, updates: Partial<DraftRecord>) {
  const existing = await (await prisma()).bugDraft.findFirst({ where: { id: draftId, userId } })
  if (!existing) return null

  const updated = await (await prisma()).bugDraft.update({
    where: { id: draftId },
    data: {
      status: updates.status,
      description: updates.description,
      module: updates.module,
      environment: updates.environment,
      prompt: updates.prompt,
      title: updates.title,
      steps: updates.steps,
      expectedResult: updates.expectedResult,
      actualResult: updates.actualResult,
      priority: updates.priority,
      severity: updates.severity,
      parserWarningsJson: updates.parserWarnings,
      updatedAt: updates.updatedAt ? new Date(updates.updatedAt) : undefined,
    },
    include: {
      attachments: { orderBy: { createdAt: 'asc' } },
    },
  })

  return mapDraft(updated)
}

export async function saveDraftRecord(draft: DraftRecord) {
  const existing = await (await prisma()).bugDraft.findUnique({ where: { id: draft.id } })
  const persisted = existing
    ? await (await prisma()).bugDraft.update({
        where: { id: draft.id },
        data: {
          status: draft.status,
          description: draft.description,
          module: draft.module,
          environment: draft.environment,
          prompt: draft.prompt,
          title: draft.title,
          steps: draft.steps,
          expectedResult: draft.expectedResult,
          actualResult: draft.actualResult,
          priority: draft.priority,
          severity: draft.severity,
          parserWarningsJson: draft.parserWarnings,
          updatedAt: new Date(draft.updatedAt),
        },
        include: {
          attachments: { orderBy: { createdAt: 'asc' } },
        },
      })
    : await (await prisma()).bugDraft.create({
        data: {
          id: draft.id,
          userId: draft.userId,
          status: draft.status,
          description: draft.description,
          module: draft.module,
          environment: draft.environment,
          prompt: draft.prompt,
          title: draft.title,
          steps: draft.steps,
          expectedResult: draft.expectedResult,
          actualResult: draft.actualResult,
          priority: draft.priority,
          severity: draft.severity,
          parserWarningsJson: draft.parserWarnings,
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt),
        },
        include: {
          attachments: { orderBy: { createdAt: 'asc' } },
        },
      })

  return mapDraft(persisted)
}

export async function addAttachmentRecord(draftId: string, attachment: AttachmentRecord) {
  const created = await (await prisma()).bugAttachment.create({
    data: {
      id: attachment.id,
      draftId,
      storageKey: attachment.storageKey,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      status: attachment.status,
      azureAttachmentUrl: attachment.azureAttachmentUrl,
      createdAt: new Date(attachment.createdAt),
    },
  })

  return mapAttachment(created)
}

export async function updateAttachmentRecord(_draftId: string, attachmentId: string, updates: Partial<AttachmentRecord>) {
  const updated = await (await prisma()).bugAttachment.update({
    where: { id: attachmentId },
    data: {
      status: updates.status,
      azureAttachmentUrl: updates.azureAttachmentUrl,
    },
  })

  return mapAttachment(updated)
}

export async function createSubmissionRecord(record: SubmissionRecord) {
  const created = await (await prisma()).bugSubmission.create({
    data: {
      id: record.id,
      draftId: record.draftId,
      azureBugId: record.azureBugId,
      azureBugUrl: record.azureBugUrl,
      status: record.status,
      requestPayloadJson: record.requestPayload,
      responsePayloadJson: record.responsePayload,
      submittedAt: new Date(record.submittedAt),
      errorMessage: record.errorMessage,
    },
  })

  return mapSubmission(created)
}
