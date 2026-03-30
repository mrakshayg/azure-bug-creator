import { useWizard } from '@/hooks/useWizard'
import { ProgressBar } from '@/components/ProgressBar'
import { Button } from '@/components/ui/Button'

const STEPS = [
  'Describe Bug', 'Build Prompt', 'Launch AI',
  'Paste Output', 'Review & Edit', 'Attach Screenshots', 'Submit'
]

export function Wizard({ onClose }) {
  const { currentStep, data, update, next, back, submit, submitting, submitted, reset } = useWizard()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Bug Report</h1>
          <p className="text-sm text-gray-500 mt-1">Step {currentStep} of 7 — {STEPS[currentStep - 1]}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>✕ Cancel</Button>
      </div>

      {/* Progress bar */}
      <ProgressBar steps={STEPS} currentStep={currentStep} />

      {/* Step content placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-64">
        <p className="text-gray-400 text-sm">Step {currentStep}: {STEPS[currentStep - 1]} — content coming soon</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={back} disabled={currentStep === 1}>← Back</Button>
        {currentStep === 7
          ? <Button onClick={submit} disabled={submitting} size="lg">
              {submitting ? 'Submitting...' : 'Submit to Azure DevOps →'}
            </Button>
          : <Button onClick={next}>Next →</Button>
        }
      </div>
    </div>
  )
}
