import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { MODULES, ENVIRONMENTS } from '@/lib/mockData'

export function Step1Describe({ data, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Describe the Bug</h2>
        <p className="text-sm text-gray-500 mt-1">
          Write a plain English description of what went wrong. Don't worry about formatting — the AI will structure it.
        </p>
      </div>

      <Textarea
        label="Bug Description"
        placeholder="e.g. When I click the Login button with an empty password field, the page goes blank and shows a JavaScript error in the console..."
        rows={7}
        value={data.description}
        onChange={e => update({ description: e.target.value })}
      />
      <div className="text-right text-xs text-gray-400">{data.description.length} characters</div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Module"
          options={MODULES}
          value={data.module}
          onChange={e => update({ module: e.target.value })}
        />
        <Select
          label="Environment"
          options={ENVIRONMENTS}
          value={data.environment}
          onChange={e => update({ environment: e.target.value })}
        />
      </div>
    </div>
  )
}
