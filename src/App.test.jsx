import { act } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'

describe('App wizard flow', () => {
  let storedDraft = null

  beforeEach(() => {
    vi.useRealTimers()
    window.localStorage.clear()
    storedDraft = null
    global.fetch = vi.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

      if (url.includes('/api/v1/auth/session')) {
        return {
          ok: true,
          json: async () => ({
            authenticated: true,
            user: {
              id: 'test-user',
              email: 'qa@example.com',
              displayName: 'QA User',
            },
          }),
        }
      }

      if (url.includes('/api/v1/auth/logout')) {
        return {
          ok: true,
          status: 204,
          json: async () => ({}),
        }
      }

      if (url.endsWith('/api/v1/drafts') && (!init?.method || init.method === 'GET')) {
        return {
          ok: true,
          json: async () => ({
            items: storedDraft ? [storedDraft] : [],
          }),
        }
      }

      if (url.endsWith('/api/v1/drafts') && (!init?.method || init.method === 'POST')) {
        storedDraft = {
          id: 'draft-1',
          status: 'draft',
          createdAt: '2026-03-30T09:00:00.000Z',
          updatedAt: '2026-03-30T09:00:00.000Z',
          ...(init?.body ? JSON.parse(String(init.body)) : {}),
        }

        return {
          ok: true,
          status: 201,
          json: async () => storedDraft,
        }
      }

      if (url.includes('/api/v1/drafts/draft-1') && init?.method === 'PUT') {
        storedDraft = {
          ...storedDraft,
          updatedAt: '2026-03-30T09:05:00.000Z',
          ...(init?.body ? JSON.parse(String(init.body)) : {}),
        }

        return {
          ok: true,
          status: 200,
          json: async () => storedDraft,
        }
      }

      if (url.includes('/api/v1/drafts/draft-1/submit') && init?.method === 'POST') {
        storedDraft = {
          ...storedDraft,
          status: 'submitted',
          submittedBugId: '2451',
          submittedAt: '2026-03-30T09:00:00.000Z',
        }
        return {
          ok: true,
          status: 201,
          json: async () => ({
            azureBugId: '2451',
            azureBugUrl: 'https://dev.azure.com/example-org/example-project/_workitems/edit/2451',
            submittedAt: '2026-03-30T09:00:00.000Z',
          }),
        }
      }

      throw new Error(`Unhandled fetch in test: ${url} ${init?.method ?? 'GET'}`)
    })
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    })
    window.open = vi.fn(() => ({ closed: false }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('updates the dashboard after submitting a bug', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(await screen.findByText('Recent activity')).toBeInTheDocument()
    expect(screen.getByText('No drafts or submissions yet.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create Draft' }))
    await user.type(screen.getByLabelText('Bug Description'), 'Refreshing the lead details page causes a blank screen every time.')
    await user.type(screen.getByLabelText('Module / Bug Location'), 'CRM >> Lead Details')
    await user.click(screen.getByRole('button', { name: 'Next →' }))
    await user.click(screen.getByRole('button', { name: /Copy Prompt & Continue|Copied/ }))
    await user.click(screen.getByRole('button', { name: /ChatGPT/ }))
    await user.click(screen.getByRole('button', { name: 'I have the output →' }))
    await user.type(screen.getByLabelText('Structured Bug Output'), `BUG TITLE: CRM >> Lead Details >> Page goes blank on refresh
MODULE: CRM >> Lead Details
ENVIRONMENT: Int
STEPS TO REPRODUCE:
1. Open a lead details page
2. Refresh the browser
EXPECTED RESULT: The lead details page should reload correctly.
ACTUAL RESULT: The page becomes blank after refresh.
PRIORITY: High
SEVERITY: 2 - Major`)
    await user.click(screen.getByRole('button', { name: 'Parse & Continue →' }))
    await user.click(screen.getByRole('button', { name: 'Next →' }))
    await user.click(screen.getByRole('button', { name: 'Next →' }))
    await user.clear(screen.getByLabelText('Bug Title'))
    await user.type(screen.getByLabelText('Bug Title'), 'CRM >> Lead Details >> Page goes blank on refresh')
    await user.click(screen.getByRole('button', { name: 'Submit to Azure DevOps →' }))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1600))
    })

    expect(screen.getByText('Bug Submitted Successfully!')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Create Another Bug' }))

    expect(screen.getByText('CRM >> Lead Details >> Page goes blank on refresh')).toBeInTheDocument()
    expect(screen.getAllByText('Submitted to Azure').length).toBeGreaterThan(0)
  }, 10000)
})
