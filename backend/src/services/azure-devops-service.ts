import crypto from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { env } from '../config/env.js'
import { resolveUploadPath } from '../lib/fs-store.js'
import { getAzureConnectionForUser, updateAttachmentRecord } from '../repositories/store.js'
import type { AttachmentRecord, DraftRecord } from '../types/domain.js'

function buildWorkItemUrl(id: string, organizationUrl?: string, projectName?: string) {
  if (organizationUrl && projectName) {
    return `${organizationUrl}/${projectName}/_workitems/edit/${id}`
  }

  return `https://dev.azure.com/tech4jc/00021-FYNXT Cloud/_workitems/edit/${id}`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildSystemInfoHtml(draft: DraftRecord, attachments: AttachmentRecord[]) {
  const imageMarkup = attachments
    .filter((attachment) => attachment.mimeType.startsWith('image/') && attachment.azureAttachmentUrl)
    .map((attachment) => (
      `<figure><img src="${escapeHtml(attachment.azureAttachmentUrl ?? '')}" alt="${escapeHtml(attachment.fileName)}" /><figcaption>${escapeHtml(attachment.fileName)}</figcaption></figure>`
    ))
    .join('')

  const linkedFiles = attachments
    .filter((attachment) => !attachment.mimeType.startsWith('image/') && attachment.azureAttachmentUrl)
    .map((attachment) => (
      `<li><a href="${escapeHtml(attachment.azureAttachmentUrl ?? '')}">${escapeHtml(attachment.fileName)}</a></li>`
    ))
    .join('')

  return [
    draft.description ? `<p><strong>Description:</strong><br/>${escapeHtml(draft.description).replace(/\n/g, '<br/>')}</p>` : '',
    `<p><strong>Environment:</strong> ${escapeHtml(draft.environment)}</p>`,
    `<p><strong>Module:</strong> ${escapeHtml(draft.module)}</p>`,
    imageMarkup ? `<hr/><p><strong>Attached Screenshots</strong></p>${imageMarkup}` : '',
    linkedFiles ? `<hr/><p><strong>Other Attachments</strong></p><ul>${linkedFiles}</ul>` : '',
  ].join('')
}

function buildHtmlBlock(value: string) {
  return `<p>${escapeHtml(value).replace(/\n/g, '<br/>')}</p>`
}

function buildRootCauseAnalysis(draft: DraftRecord) {
  return draft.actualResult.trim()
}

function mapPriority(priority: string) {
  const normalized = priority.trim().toLowerCase()
  if (normalized === 'critical' || normalized === 'highest') return 1
  if (normalized === 'high') return 2
  if (normalized === 'medium') return 3
  if (normalized === 'low') return 4
  return null
}

function mapSeverity(severity: string) {
  const normalized = severity.trim().toLowerCase()
  if (normalized.startsWith('1')) return '1 - Critical'
  if (normalized.startsWith('2')) return '2 - High'
  if (normalized.startsWith('3')) return '3 - Medium'
  if (normalized.startsWith('4')) return '4 - Low'
  return null
}

async function createBugRequest(url: string, patToken: string, body: Array<Record<string, unknown>>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`:${patToken}`).toString('base64')}`,
      'Content-Type': 'application/json-patch+json',
    },
    body: JSON.stringify(body),
  })

  const raw = await response.text()
  let payload: Record<string, unknown> | undefined

  try {
    payload = raw ? JSON.parse(raw) as Record<string, unknown> : undefined
  } catch {
    payload = undefined
  }

  return { response, raw, payload }
}

function buildAzureError(status: number, raw: string, fallback: string) {
  const error = new Error(fallback) as Error & { status?: number }
  error.status = status
  return error
}

type WorkItemPatchOperation = {
  op: 'add'
  path: string
  value: string | number
}

async function uploadAttachmentToAzure(organizationUrl: string, projectName: string, patToken: string, attachment: AttachmentRecord) {
  const fileBuffer = await readFile(resolveUploadPath(attachment.storageKey))
  const uploadUrl = `${organizationUrl}/${encodeURIComponent(projectName)}/_apis/wit/attachments?fileName=${encodeURIComponent(attachment.fileName)}&uploadType=Simple&api-version=7.2-preview.4`

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`:${patToken}`).toString('base64')}`,
      'Content-Type': 'application/octet-stream',
    },
    body: fileBuffer,
  })

  const raw = await response.text()
  let payload: { url?: string } | undefined

  try {
    payload = raw ? JSON.parse(raw) as { url?: string } : undefined
  } catch {
    payload = undefined
  }

  if (!response.ok || !payload?.url) {
    const detail = raw.trim() || `Azure DevOps attachment upload failed with ${response.status}.`
    throw buildAzureError(response.status, raw, detail)
  }

  return payload.url
}

async function ensureAzureAttachments(draft: DraftRecord, organizationUrl: string, projectName: string, patToken: string) {
  const nextAttachments: AttachmentRecord[] = []

  for (const attachment of draft.attachments) {
    if (attachment.azureAttachmentUrl) {
      nextAttachments.push(attachment)
      continue
    }

    const azureAttachmentUrl = await uploadAttachmentToAzure(organizationUrl, projectName, patToken, attachment)
    await updateAttachmentRecord(draft.id, attachment.id, {
      azureAttachmentUrl,
      status: 'linked',
    })

    nextAttachments.push({
      ...attachment,
      azureAttachmentUrl,
      status: 'linked',
    })
  }

  draft.attachments = nextAttachments
  return nextAttachments
}

export async function submitDraftToAzure(draft: DraftRecord) {
  if (!env.AZURE_DEVOPS_ORG_URL || !env.AZURE_DEVOPS_PROJECT) {
    const connection = await getAzureConnectionForUser(draft.userId)
    if (!connection?.organizationUrl || !connection?.projectName) {
      throw new Error('Azure DevOps live mode requires a saved organization URL and project name for this user.')
    }
  }

  const connection = await getAzureConnectionForUser(draft.userId)
  const organizationUrl = connection?.organizationUrl ?? env.AZURE_DEVOPS_ORG_URL
  const projectName = connection?.projectName ?? env.AZURE_DEVOPS_PROJECT
  if (!organizationUrl || !projectName) {
    throw new Error('Azure DevOps target project is not configured.')
  }

  const url = `${organizationUrl}/${projectName}/_apis/wit/workitems/$Bug?api-version=${env.AZURE_DEVOPS_API_VERSION}`
  const patToken = connection?.accessToken ?? process.env.AZURE_DEVOPS_PAT
  if (!patToken) {
    throw new Error('Live submission requires a validated Azure DevOps PAT.')
  }
  const azureAttachments = await ensureAzureAttachments(draft, organizationUrl, projectName, patToken)

  const minimalBody: WorkItemPatchOperation[] = [
    { op: 'add', path: '/fields/System.Title', value: draft.title },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.TCM.ReproSteps',
      value: buildHtmlBlock(draft.steps),
    },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.TCM.SystemInfo',
      value: buildSystemInfoHtml(draft, azureAttachments),
    },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.Common.AcceptanceCriteria',
      value: buildHtmlBlock(draft.expectedResult),
    },
    { op: 'add', path: '/fields/Microsoft.VSTS.Common.Priority', value: mapPriority(draft.priority) ?? 3 },
    { op: 'add', path: '/fields/Custom.RootCauseAnalysis', value: buildRootCauseAnalysis(draft) },
  ]

  const priorityValue = mapPriority(draft.priority)
  const severityValue = mapSeverity(draft.severity)
  const fullBody: WorkItemPatchOperation[] = [
    { op: 'add', path: '/fields/System.Title', value: draft.title },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.TCM.ReproSteps',
      value: buildHtmlBlock(draft.steps),
    },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.TCM.SystemInfo',
      value: buildSystemInfoHtml(draft, azureAttachments),
    },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.Common.AcceptanceCriteria',
      value: buildHtmlBlock(draft.expectedResult),
    },
  ]

  if (priorityValue !== null) {
    fullBody.push({ op: 'add', path: '/fields/Microsoft.VSTS.Common.Priority', value: priorityValue })
  }
  fullBody.push({ op: 'add', path: '/fields/Custom.RootCauseAnalysis', value: buildRootCauseAnalysis(draft) })
  if (severityValue) {
    fullBody.push({ op: 'add', path: '/fields/Microsoft.VSTS.Common.Severity', value: severityValue })
  }

  let result = await createBugRequest(url, patToken, fullBody)
  if (!result.response.ok && result.response.status === 400) {
    result = await createBugRequest(url, patToken, minimalBody)
  }

  if (!result.response.ok) {
    const detail = result.raw?.trim() || `Azure DevOps create bug failed with ${result.response.status}.`
    throw buildAzureError(result.response.status, result.raw, detail)
  }

  const payload = (result.payload ?? {}) as { id?: string; url?: string; _links?: { html?: { href?: string } } }
  const azureBugId = String(payload.id ?? crypto.randomInt(1000, 9999))
  return {
    azureBugId,
    azureBugUrl: payload._links?.html?.href ?? payload.url ?? buildWorkItemUrl(azureBugId, organizationUrl, projectName),
    responsePayload: payload as Record<string, unknown>,
  }
}
