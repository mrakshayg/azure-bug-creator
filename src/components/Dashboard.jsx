import { ExternalLink, PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'

const STATUS_STYLES = {
  Draft: 'bg-gray-100 text-gray-700',
  'Submitted to Azure': 'bg-blue-100 text-blue-700',
}

export function Dashboard({ bugs, onCreateDraft }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Bug reports</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Recent drafts and submitted bugs from this tool session. This is local app history, not live Azure DevOps status.
          </p>
        </div>
        <Button onClick={onCreateDraft} size="lg" className="self-start">
          <PlusCircle size={18} />
          Create Draft
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-none">
        <CardHeader className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80">
          <div>
            <h2 className="font-semibold text-gray-900">Recent activity</h2>
            <p className="mt-1 text-sm text-gray-500">{bugs.length === 0 ? 'No activity yet' : `${bugs.length} item${bugs.length > 1 ? 's' : ''}`}</p>
          </div>
        </CardHeader>
        <div className="divide-y divide-gray-100">
          {bugs.length === 0 && (
            <div className="px-6 py-16 text-center sm:px-12">
              <p className="text-base font-medium text-gray-800">No drafts or submissions yet.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">Use Create Draft to start the next report.</p>
            </div>
          )}
          {bugs.map((bug) => (
            <div key={bug.id} className="flex flex-col gap-4 px-4 py-5 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">{bug.id}</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{bug.title}</p>
                <p className="mt-1 text-sm text-gray-500">{bug.module} · {bug.environment} · {bug.date}</p>
                <p className="mt-1 text-xs text-gray-400">{bug.source}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <Badge className={STATUS_STYLES[bug.status] ?? STATUS_STYLES.Draft}>{bug.status}</Badge>
                {bug.azureBugUrl ? (
                  <button
                    type="button"
                    onClick={() => window.open(bug.azureBugUrl, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Open in Azure
                    <ExternalLink size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
