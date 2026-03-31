import { CheckCircle2, ExternalLink, Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

const REQUIRED_AZURE_STEPS = [
  'Assign People',
  'Add Tags',
  'Set Area',
  'Set Iteration',
]

export function Result({ bugId, title, data, onReset }) {
  return (
    <div className="space-y-8 py-8" aria-live="polite">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100">
              <CheckCircle2 size={28} className="text-green-700" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-400">Submission complete</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Bug Submitted Successfully!</h2>
              <p className="mt-3 max-w-2xl text-sm text-gray-500">
                Your bug report is now in Azure DevOps. Open it now, review the mapped fields, add any missing required details, and save the work item there.
              </p>
            </div>
          </div>
          <Button onClick={onReset}>
            + Create Another Bug
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Bug size={16} className="text-gray-700" />
              <span className="text-sm font-semibold text-gray-900">Azure DevOps Work Item</span>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Active
            </span>
          </div>
          <div className="space-y-5 p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">{bugId}</p>
              <p className="mt-2 text-base font-semibold leading-snug text-gray-950">{title || 'Bug Report'}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-600">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Type</p>
                <p className="mt-1 text-gray-900">Bug</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Assigned To</p>
                <p className="mt-1 text-gray-900">Unassigned</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Created</p>
                <p className="mt-1 text-gray-900">{formatDate(data.submittedAt ? new Date(data.submittedAt) : new Date())}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Priority</p>
                <p className="mt-1 text-gray-900">{data.priority}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Severity</p>
                <p className="mt-1 text-gray-900">{data.severity}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Attachments</p>
                <p className="mt-1 text-gray-900">{data.attachments.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
            <p className="text-sm font-semibold text-blue-950">Next step in Azure DevOps</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-900/80">
              Open the created bug in Azure DevOps now. Review the mapped fields, then complete the required items below before you save the work item.
            </p>
            <div className="mt-5 rounded-2xl border border-blue-200 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">Required before save</p>
              <ol className="mt-3 space-y-2 text-sm text-blue-950">
                {REQUIRED_AZURE_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-5">
              <Button
                size="lg"
                onClick={() => data.submittedBugUrl && window.open(data.submittedBugUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink size={16} /> Open Bug In Azure DevOps
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">What was submitted</h3>
            </div>
            <div className="grid gap-4 p-5 text-sm text-gray-700 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Module</p>
                <p className="mt-1 text-gray-950">{data.module}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Environment</p>
                <p className="mt-1 text-gray-950">{data.environment}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Expected Result</p>
                <p className="mt-1 text-gray-950">{data.expectedResult}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Actual Result</p>
                <p className="mt-1 text-gray-950">{data.actualResult}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
