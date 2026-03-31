import { ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { PRIORITIES, SEVERITIES, ENVIRONMENTS } from '@/lib/mockData'

export function Step7Submit({ data, update, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-950">Final submission</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Make the last edits here, confirm the evidence, and then send the bug to Azure DevOps.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Submission summary</p>
        <p className="mt-2 text-sm text-gray-600">You can still edit every field before the work item is created.</p>
      </div>

      <Input
        label="Bug Title"
        value={data.title}
        onChange={e => update({ title: e.target.value })}
        placeholder="Enter bug title..."
        className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3"
        error={errors.title}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Module / Bug Location" value={data.module} onChange={e => update({ module: e.target.value })} placeholder="Lead Listing Page >> Rows per page" className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3" error={errors.module} hint="Example: Edit Deal >> Probability" />
        <Select label="Environment" options={ENVIRONMENTS} value={data.environment} onChange={e => update({ environment: e.target.value })} className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3" error={errors.environment} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select label="Priority" options={PRIORITIES} value={data.priority} onChange={e => update({ priority: e.target.value })} className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3" error={errors.priority} />
        <Select label="Severity" options={SEVERITIES} value={data.severity} onChange={e => update({ severity: e.target.value })} className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3" error={errors.severity} />
      </div>

      <Textarea
        label="Steps to Reproduce"
        rows={5}
        value={data.steps}
        onChange={e => update({ steps: e.target.value })}
        placeholder="1. Step one&#10;2. Step two"
        className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3"
        error={errors.steps}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Textarea
          label="Expected Result"
          rows={4}
          value={data.expectedResult}
          onChange={e => update({ expectedResult: e.target.value })}
          placeholder="What should happen..."
          className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3"
          error={errors.expectedResult}
        />
        <Textarea
          label="Actual Result"
          rows={4}
          value={data.actualResult}
          onChange={e => update({ actualResult: e.target.value })}
          placeholder="What actually happened..."
          className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3"
          error={errors.actualResult}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600">
        {data.attachments.length > 0 ? (
          <div className="flex items-center gap-2">
            <ImageIcon size={15} />
            {data.attachments.length} screenshot{data.attachments.length > 1 ? 's' : ''} attached
          </div>
        ) : (
          'No screenshots attached.'
        )}
      </div>
    </div>
  )
}
