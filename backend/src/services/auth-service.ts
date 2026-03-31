import crypto from 'node:crypto'

import { env } from '../config/env.js'
import { getAzureConnectionForUser, upsertAzureConnectionForUser, upsertStoredUser } from '../repositories/store.js'

function normalizeOrganizationUrl(organizationUrl: string) {
  return organizationUrl.trim().replace(/\/+$/, '')
}

function buildPatAuthorization(pat: string) {
  return `Basic ${Buffer.from(`:${pat}`).toString('base64')}`
}

async function fetchAzureJson<T>(url: string, pat: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: buildPatAuthorization(pat),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Azure DevOps request failed with ${response.status}: ${text}`)
  }

  return response.json() as Promise<T>
}

async function fetchConnectionData(organizationUrl: string, pat: string) {
  return fetchAzureJson<{
    authenticatedUser?: {
      id?: string
      customDisplayName?: string
      providerDisplayName?: string
      uniqueName?: string
      imageUrl?: string
    }
  }>(`${organizationUrl}/_apis/connectionData?connectOptions=1&lastChangeId=-1&lastChangeId64=-1`, pat)
}

async function fetchProjects(organizationUrl: string, pat: string) {
  return fetchAzureJson<{
    value?: Array<{
      id?: string
      name?: string
    }>
  }>(`${organizationUrl}/_apis/projects?api-version=${env.AZURE_DEVOPS_API_VERSION}`, pat)
}

export async function validatePersonalAccessToken(payload: {
  organizationUrl: string
  projectName: string
  pat: string
}) {
  const organizationUrl = normalizeOrganizationUrl(payload.organizationUrl)
  const pat = payload.pat.trim()
  const projectName = payload.projectName.trim()

  if (!organizationUrl || !pat || !projectName) {
    throw new Error('Organization URL, project name, and PAT are required.')
  }

  const [connectionData, projectsPayload] = await Promise.all([
    fetchConnectionData(organizationUrl, pat).catch(() => ({ authenticatedUser: undefined })),
    fetchProjects(organizationUrl, pat),
  ])

  const project = (projectsPayload.value ?? []).find((item) => item.name?.toLowerCase() === projectName.toLowerCase())
  if (!project?.name) {
    throw new Error('The Azure DevOps project was not found for this organization or the PAT does not have access.')
  }

  const identity = connectionData.authenticatedUser
  const displayName = identity?.customDisplayName || identity?.providerDisplayName || project.name
  const email = identity?.uniqueName || undefined
  const externalId = identity?.id || crypto.createHash('sha256').update(`${organizationUrl}:${project.name}`).digest('hex')

  return {
    organizationUrl,
    projectName: project.name,
    displayName,
    email,
    externalId,
  }
}

export async function loginWithPersonalAccessToken(payload: {
  organizationUrl: string
  projectName: string
  pat: string
}) {
  const validated = await validatePersonalAccessToken(payload)

  const user = await upsertStoredUser({
    email: validated.email,
    displayName: validated.displayName,
    authIdentityKey: `pat:${validated.externalId}`,
  })

  if (!user) {
    throw new Error('Failed to persist PAT-authenticated user.')
  }

  await upsertAzureConnectionForUser({
    userId: user.id,
    organizationUrl: validated.organizationUrl,
    projectName: validated.projectName,
    accessToken: payload.pat.trim(),
  })

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  }
}
