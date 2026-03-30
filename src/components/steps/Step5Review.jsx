import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { PRIORITIES, SEVERITIES, MODULES, ENVIRONMENTS } from '@/lib/mockData'

export function Step5Review({ data, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Review & Edit</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fields have been pre-filled from the AI output. Edit anything that looks off before submitting.
        </p>
      </div>

      <Input
        label="Bug Title"
        value={data.title}
        onChange={e => update({ title: e.target.value })}
        placeholder="Enter bug title..."
      />

      <Textarea
        label="Steps to Reproduce"
        rows={5}
        value={data.steps}
        onChange={e => update({ steps: e.target.value })}
        placeholder="1. Step one&#10;2. Step two"
      />

      <div className="grid grid-cols-2 gap-4">
        <Textarea
          label="Expected Result"
          rows={3}
          value={data.expectedResult}
          onChange={e => update({ expectedResult: e.target.value })}
          placeholder="What should happen..."
        />
        <Textarea
          label="Actual Result"
          rows={3}
          value={data.actualResult}
          onChange={e => update({ actualResult: e.target.value })}
          placeholder="What actually happened..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" options={PRIORITIES} value={data.priority} onChange={e => update({ priority: e.target.value })} />
        <Select label="Severity" options={SEVERITIES} value={data.severity} onChange={e => update({ severity: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Module" options={MODULES} value={data.module} onChange={e => update({ module: e.target.value })} />
        <Select label="Environment" options={ENVIRONMENTS} value={data.environment} onChange={e => update({ environment: e.target.value })} />
      </div>
    </div>
  )
}
