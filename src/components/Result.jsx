import { CheckCircle2, ExternalLink, Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export function Result({ bugId, title, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 space-y-8 text-center py-12">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bug Submitted Successfully!</h2>
        <p className="mt-2 text-gray-500">Your bug report has been created in Azure DevOps.</p>
      </div>

      {/* Mock work item card */}
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-md text-left overflow-hidden">
        <div className="bg-blue-600 px-4 py-3 flex items-center gap-2">
          <Bug size={16} className="text-white" />
          <span className="text-white text-sm font-semibold">Azure DevOps Work Item</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-blue-600">{bugId}</span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Active
            </span>
          </div>
          <p className="font-semibold text-gray-900 text-sm leading-snug">
            {title || 'Bug Report'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div><span className="font-medium">Type:</span> Bug</div>
            <div><span className="font-medium">Assigned To:</span> Unassigned</div>
            <div><span className="font-medium">Created:</span> {formatDate()}</div>
            <div><span className="font-medium">Priority:</span> High</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
          <ExternalLink size={15} /> View in Azure DevOps
        </Button>
        <Button onClick={onReset}>
          + Create Another Bug
        </Button>
      </div>
    </div>
  )
}
