import { ShieldCheck, KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AuthScreen({ form, onChange, onLogin, loading, error, fieldErrors = {} }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-none sm:p-12">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-400">Token access</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Connect Azure DevOps</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  Sign in with your own Azure DevOps Personal Access Token. The backend validates it, stores it server-side for your session, and uses it for bug creation.
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-y border-gray-200 py-6 text-sm text-gray-600 sm:grid-cols-3 sm:gap-6">
              <div>
                <p className="font-medium text-gray-900">Your own PAT</p>
                <p className="mt-1">Each user can connect their own organization and project with their own token.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Validated immediately</p>
                <p className="mt-1">The backend checks the token against Azure DevOps before granting access.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Server-side session</p>
                <p className="mt-1">The browser gets a session cookie, while Azure credentials stay on the backend.</p>
              </div>
            </div>

            <div className="grid gap-4">
              <Input
                label="Organization URL"
                value={form.organizationUrl}
                onChange={(event) => onChange('organizationUrl', event.target.value)}
                placeholder="https://dev.azure.com/your-org"
                error={fieldErrors.organizationUrl}
              />
              <Input
                label="Project Name"
                value={form.projectName}
                onChange={(event) => onChange('projectName', event.target.value)}
                placeholder="Your Azure DevOps project"
                error={fieldErrors.projectName}
              />
              <Input
                label="Personal Access Token"
                type="password"
                value={form.pat}
                onChange={(event) => onChange('pat', event.target.value)}
                placeholder="Paste your PAT"
                hint="Use a PAT that can read projects and create work items in the target project."
                error={fieldErrors.pat}
              />
            </div>

            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">The app will verify access before opening the bug workflow.</p>
              <Button onClick={onLogin} disabled={loading} size="lg" className="w-full justify-center sm:w-auto sm:min-w-64">
                <KeyRound size={18} />
                {loading ? 'Validating Token...' : 'Validate Token & Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
