import { ImageIcon } from 'lucide-react'

const Row = ({ label, value }) => value ? (
  <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className="col-span-2 text-sm text-gray-900 whitespace-pre-wrap">{value}</span>
  </div>
) : null

export function Step7Submit({ data }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
        <p className="text-sm text-gray-500 mt-1">
          This is a final summary of your bug report. Hit Submit below to create the work item in Azure DevOps.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bug Details</p>
        </div>
        <div className="px-4 py-2">
          <Row label="Title" value={data.title} />
          <Row label="Module" value={data.module} />
          <Row label="Environment" value={data.environment} />
          <Row label="Priority" value={data.priority} />
          <Row label="Severity" value={data.severity} />
          <Row label="Steps to Reproduce" value={data.steps} />
          <Row label="Expected Result" value={data.expectedResult} />
          <Row label="Actual Result" value={data.actualResult} />
        </div>
        {data.attachments.length > 0 && (
          <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon size={15} />
            {data.attachments.length} screenshot{data.attachments.length > 1 ? 's' : ''} attached
          </div>
        )}
      </div>
    </div>
  )
}
