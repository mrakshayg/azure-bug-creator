import { env } from '../config/env.js'
import { getAzureConnectionForUser } from '../repositories/store.js'

type AzureWorkItemResponse = {
  id?: number
  url?: string
  fields?: Record<string, unknown>
}

function stripHtmlToText(value: unknown) {
  const raw = typeof value === 'string' ? value : ''
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function pickFirstString(values: unknown[]) {
  for (const value of values) {
    const text = stripHtmlToText(value)
    if (text) return text
  }
  return ''
}

function summarizeStoryContext(payload: {
  id: string
  title: string
  workItemType: string
  state: string
  description: string
  acceptanceCriteria: string
  reproSteps: string
  url: string
}) {
  const lines = [
    'USER_STORY_CONTEXT_START',
    `USER STORY ID: ${payload.id}`,
    `WORK ITEM TYPE: ${payload.workItemType || 'Unknown'}`,
    `TITLE: ${payload.title || 'Untitled'}`,
    `STATE: ${payload.state || 'Unknown'}`,
    `URL: ${payload.url}`,
    '',
    'DESCRIPTION:',
    payload.description || 'Not provided.',
    '',
    'ACCEPTANCE CRITERIA:',
    payload.acceptanceCriteria || 'Not provided.',
    '',
    'REPRO STEPS:',
    payload.reproSteps || 'Not provided.',
    '',
    'Instructions:',
    '- Use this User Story as additional context while drafting the bug.',
    '- Do not copy this section verbatim into the final bug output.',
    '- Keep the bug report format unchanged.',
    'USER_STORY_CONTEXT_END',
  ]

  return lines.join('\n')
}

export async function extractUserStoryContext(userId: string, storyId: string) {
  const normalizedStoryId = storyId.trim()
  if (!/^\d+$/.test(normalizedStoryId)) {
    throw new Error('User Story ID must be numeric.')
  }

  const connection = await getAzureConnectionForUser(userId)
  const organizationUrl = connection?.organizationUrl?.replace(/\/+$/, '')
  const projectName = connection?.projectName?.trim()
  const token = connection?.accessToken?.trim()

  if (!organizationUrl || !projectName || !token) {
    throw new Error('Azure connection not found. Validate PAT first.')
  }

  const endpoint = `${organizationUrl}/${encodeURIComponent(projectName)}/_apis/wit/workitems/${normalizedStoryId}?api-version=${env.AZURE_DEVOPS_API_VERSION}`
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Basic ${Buffer.from(`:${token}`).toString('base64')}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User Story not found in this project.')
    }
    const text = await response.text()
    throw new Error(`Failed to extract User Story (${response.status}): ${text || 'unknown error'}`)
  }

  const workItem = await response.json() as AzureWorkItemResponse
  const fields = workItem.fields ?? {}

  const title = pickFirstString([fields['System.Title']])
  const workItemType = pickFirstString([fields['System.WorkItemType']])
  const state = pickFirstString([fields['System.State']])
  const description = pickFirstString([
    fields['System.Description'],
    fields['Microsoft.VSTS.TCM.SystemInfo'],
  ])
  const acceptanceCriteria = pickFirstString([fields['Microsoft.VSTS.Common.AcceptanceCriteria']])
  const reproSteps = pickFirstString([fields['Microsoft.VSTS.TCM.ReproSteps']])
  const url = typeof workItem.url === 'string' && workItem.url.trim() ? workItem.url : endpoint

  const contextBlock = summarizeStoryContext({
    id: normalizedStoryId,
    title,
    workItemType,
    state,
    description,
    acceptanceCriteria,
    reproSteps,
    url,
  })

  return {
    id: normalizedStoryId,
    title,
    workItemType,
    state,
    url,
    contextBlock,
  }
}
