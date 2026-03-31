import { useState } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { parseAIOutputDetails } from '@/lib/outputParser'

const PreviewRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3 py-2 text-sm">
    <span className="font-medium text-gray-500">{label}</span>
    <span className="col-span-2 whitespace-pre-wrap text-gray-900">{value || 'Not detected yet'}</span>
  </div>
)

export function Step4Paste({ update, wizard, errors }) {
  const [raw, setRaw] = useState('')
  const { result: preview, warnings, missingFields } = parseAIOutputDetails(raw)
  const canContinue = raw.trim().length > 0 && missingFields.length === 0

  const handleParse = () => {
    if (!canContinue) return
    update(preview)
    wizard.goTo(5)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-950">Paste AI output</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Paste the model response below. The parser will clean it up and prepare the editable bug fields for review.
        </p>
      </div>

      <Textarea
        label="Structured Bug Output"
        placeholder={`Paste the AI output here. It should look like:\n\nBUG TITLE: ...\nMODULE: ...\nSTEPS TO REPRODUCE:\n1. ...\nEXPECTED RESULT: ...\nACTUAL RESULT: ...\nPRIORITY: ...\nSEVERITY: ...`}
        rows={12}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3 leading-6"
        error={errors.rawOutput}
        hint="Gemini and Claude intros/outros are okay now. The parser will ignore extra framing where possible."
      />

      <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white shadow-none">
        <CardHeader className="border-gray-200 bg-gray-50/80">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Parsed Preview</h3>
            <p className="mt-1 text-xs text-gray-500">
              This is what will be carried into the editable review steps.
            </p>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <PreviewRow label="Title" value={preview.title} />
          <PreviewRow label="Module" value={preview.module} />
          <PreviewRow label="Environment" value={preview.environment} />
          <PreviewRow label="Steps" value={preview.steps} />
          <PreviewRow label="Expected" value={preview.expectedResult} />
          <PreviewRow label="Actual" value={preview.actualResult} />
          <PreviewRow label="Priority" value={preview.priority} />
          <PreviewRow label="Severity" value={preview.severity} />
        </CardContent>
      </Card>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <p className="font-medium">Parser notes</p>
          <ul className="mt-2 space-y-1">
            {warnings.map(warning => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Paste the full structured output before continuing.
        </p>
        <Button onClick={handleParse} disabled={!canContinue}>
          Parse & Continue →
        </Button>
      </div>
    </div>
  )
}
