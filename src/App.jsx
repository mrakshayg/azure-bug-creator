import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { AuthScreen } from '@/components/AuthScreen'
import { Dashboard } from '@/components/Dashboard'
import { Wizard } from '@/components/Wizard'
import { beginLogin, fetchDrafts, fetchSession, logout } from '@/lib/api'
import { formatDate } from '@/lib/utils'

function mapDraftsToDashboardItems(items) {
  return items.map((draft) => ({
    id: draft.submittedBugId || draft.id,
    title: draft.title || 'Untitled bug report',
    status: draft.status === 'submitted' ? 'Submitted to Azure' : 'Draft',
    module: draft.module || 'Not specified',
    environment: draft.environment || 'Unknown',
    date: formatDate(new Date(draft.updatedAt || draft.createdAt || Date.now())),
    azureBugUrl: draft.submittedBugUrl || '',
    source: draft.status === 'submitted' ? 'Azure submission created' : 'Local draft',
  }))
}

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [bugs, setBugs] = useState([])
  const [authLoading, setAuthLoading] = useState(true)
  const [authStarting, setAuthStarting] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [loginErrors, setLoginErrors] = useState({})
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({
    organizationUrl: 'https://dev.azure.com/tech4jc',
    projectName: '00021-FYNXT Cloud',
    pat: '',
  })

  const loadDrafts = async () => {
    const payload = await fetchDrafts()
    setBugs(mapDraftsToDashboardItems(payload.items || []))
  }

  useEffect(() => {
    const controller = new AbortController()

    const loadSession = async () => {
      try {
        const payload = await fetchSession()
        setUser(payload.authenticated ? payload.user : null)
        if (payload.authenticated) {
          await loadDrafts()
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAuthError('Backend session check failed. Start the API server and try again.')
        }
      } finally {
        setAuthLoading(false)
      }
    }

    loadSession()
    return () => controller.abort()
  }, [])

  const handleSubmitted = async () => {
    await loadDrafts()
  }

  const handleLogin = async () => {
    const nextErrors = {}
    if (!loginForm.organizationUrl.trim()) nextErrors.organizationUrl = 'Organization URL is required.'
    if (!loginForm.projectName.trim()) nextErrors.projectName = 'Project name is required.'
    if (!loginForm.pat.trim()) nextErrors.pat = 'Personal Access Token is required.'

    if (Object.keys(nextErrors).length > 0) {
      setLoginErrors(nextErrors)
      setAuthError('')
      return
    }

    setAuthStarting(true)
    setAuthError('')
    setLoginErrors({})

    try {
      const payload = await beginLogin(loginForm)
      setUser(payload.user)
      await loadDrafts()
    } catch (error) {
      setAuthError(error.message || 'Unable to validate Azure DevOps token.')
    } finally {
      setAuthStarting(false)
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    setAuthError('')

    try {
      await logout()
      setUser(null)
      setWizardOpen(false)
      setBugs([])
    } catch {
      setAuthError('Logout failed. Please try again.')
    } finally {
      setLogoutLoading(false)
    }
  }

  const handleLoginFormChange = (field, value) => {
    setLoginForm((current) => ({
      ...current,
      [field]: value,
    }))
    setLoginErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        onLogout={handleLogout}
        loggingOut={logoutLoading}
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {authLoading && <div className="py-16 text-center text-sm text-gray-500">Checking session...</div>}
        {!authLoading && !user && (
          <AuthScreen
            form={loginForm}
            onChange={handleLoginFormChange}
            onLogin={handleLogin}
            loading={authStarting}
            error={authError}
            fieldErrors={loginErrors}
          />
        )}
        {user && (wizardOpen
          ? user && <Wizard onClose={() => setWizardOpen(false)} onSubmitted={handleSubmitted} />
          : user && <Dashboard bugs={bugs} onCreateDraft={() => setWizardOpen(true)} />)
        }
      </main>
    </div>
  )
}
