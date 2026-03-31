import { Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Navbar({ user, onLogout, loggingOut }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
            <Bug size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-gray-900">BugDraft</p>
            <p className="text-xs text-gray-500">Azure DevOps QA workflow</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-800">{user.displayName || user.email || 'Authenticated user'}</p>
                <p className="text-xs text-gray-500">Signed in with Azure DevOps token</p>
              </div>
              <Button variant="outline" onClick={onLogout} disabled={loggingOut}>
                {loggingOut ? 'Signing out...' : 'Logout'}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
