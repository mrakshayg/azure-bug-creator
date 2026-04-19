const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed.'
    try {
      const payload = await response.json()
      message = payload.message || payload.error || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export function fetchSession() {
  return request('/api/v1/auth/session')
}

export function beginLogin(payload) {
  return request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return request('/api/v1/auth/logout', { method: 'POST' })
}

export function createDraft(payload) {
  return request('/api/v1/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateDraft(draftId, payload) {
  return request(`/api/v1/drafts/${draftId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function submitDraft(draftId) {
  return request(`/api/v1/drafts/${draftId}/submit`, {
    method: 'POST',
  })
}

export function fetchDrafts() {
  return request('/api/v1/drafts')
}

export function uploadAttachment(draftId, file) {
  const formData = new FormData()
  formData.append('file', file)

  return request(`/api/v1/drafts/${draftId}/attachments`, {
    method: 'POST',
    body: formData,
  })
}

export function extractUserStory(storyId) {
  return request('/api/v1/user-stories/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyId }),
  })
}
