import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { ENVIRONMENTS } from '@/lib/mockData'

export function Step1Describe({ data, update, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-950">Describe the bug</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Write what happened in plain English. Focus on the failure, where it happened, and what you expected instead.
        </p>
      </div>

      <Textarea
        label="Bug Description"
        placeholder="e.g. When I click the Login button with an empty password field, the page goes blank and shows a JavaScript error in the console..."
        rows={7}
        value={data.description}
        onChange={e => update({ description: e.target.value })}
        className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-[15px] leading-6"
        error={errors.description}
        hint="Minimum 20 characters. Changing description, module, or environment resets the generated prompt."
      />
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Use enough detail for AI to reconstruct the issue accurately.</span>
        <span>{data.description.length} characters</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Module / Bug Location"
          placeholder='e.g. Lead Listing Page >> Rows per page'
          value={data.module}
          onChange={e => update({ module: e.target.value })}
          className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3"
          error={errors.module}
          hint='Enter the exact page, section, or flow where the bug lives. This will be reused in the bug title. Examples: Lead Listing Page >> Rows per page, CRM >> Lead >> Quick Filter, Edit Deal >> Probability.'
        />
        <Select
          label="Environment"
          options={ENVIRONMENTS}
          value={data.environment}
          onChange={e => update({ environment: e.target.value })}
          className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3"
          error={errors.environment}
        />
      </div>
    </div>
  )
}
