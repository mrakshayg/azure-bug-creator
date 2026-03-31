export type DraftStatus = 'draft' | 'ready_for_submit' | 'submitting' | 'submitted' | 'failed'

export type SessionUser = {
  id: string
  email?: string
  displayName?: string
}

export type StoredUser = SessionUser & {
  authIdentityKey?: string
  createdAt: string
  lastLoginAt: string
}

export type AzureConnectionRecord = {
  id: string
  userId: string
  organizationUrl?: string
  projectName?: string
  accessToken?: string
  createdAt: string
  updatedAt: string
}

export type DraftRecord = {
  id: string
  userId: string
  status: DraftStatus
  description: string
  module: string
  environment: string
  prompt: string
  title: string
  steps: string
  expectedResult: string
  actualResult: string
  priority: string
  severity: string
  parserWarnings: string[]
  attachments: AttachmentRecord[]
  createdAt: string
  updatedAt: string
}

export type AttachmentRecord = {
  id: string
  draftId: string
  storageKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
  status: 'uploaded' | 'linked'
  azureAttachmentUrl?: string
  createdAt: string
}

export type SubmissionRecord = {
  id: string
  draftId: string
  azureBugId: string
  azureBugUrl: string
  status: 'submitted' | 'failed'
  requestPayload: Record<string, unknown>
  responsePayload: Record<string, unknown>
  submittedAt: string
  errorMessage?: string
}
