import { useWizard } from '@/hooks/useWizard'
import { ProgressBar } from '@/components/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Result } from '@/components/Result'
import { Step1Describe } from '@/components/steps/Step1Describe'
import { Step2Prompt } from '@/components/steps/Step2Prompt'
import { Step3Launch } from '@/components/steps/Step3Launch'
import { Step4Paste } from '@/components/steps/Step4Paste'
import { Step5Review } from '@/components/steps/Step5Review'
import { Step6Attach } from '@/components/steps/Step6Attach'
import { Step7Submit } from '@/components/steps/Step7Submit'

const STEPS = [
  'Describe Bug', 'Build Prompt', 'Launch AI',
  'Paste Output', 'Review & Edit', 'Attach Screenshots', 'Submit'
]

const STEP_COMPONENTS = {
  1: Step1Describe,
  2: Step2Prompt,
  3: Step3Launch,
  4: Step4Paste,
  5: Step5Review,
  6: Step6Attach,
  7: Step7Submit,
}

export function Wizard({ onClose, onSubmitted }) {
  const wizard = useWizard()
  const { currentStep, data, update, next, back, submit, submitting, submitted, reset, errors, draftRestored, saveLabel } = wizard
  const hasFieldErrors = Object.keys(errors).some((key) => key !== 'submit')
  const submitError = errors.submit

  if (submitted) {
    return (
      <Result
        bugId={data.submittedBugId}
        title={data.title}
        data={data}
        onReset={() => {
          onSubmitted?.(data)
          reset()
          onClose()
        }}
      />
    )
  }

  const StepComponent = STEP_COMPONENTS[currentStep]
  const isLastStep = currentStep === 7
  const showPrimaryNavigation = currentStep !== 2 && currentStep !== 4

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">New draft</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Create bug report</h1>
          <p className="mt-2 text-sm text-gray-500">Step {currentStep} of 7 · {STEPS[currentStep - 1]}</p>
          <p className="mt-3 text-xs text-gray-400">{saveLabel}</p>
          {draftRestored && currentStep === 1 && (
            <p className="mt-1 text-xs font-medium text-blue-600">Previous local draft restored.</p>
          )}
        </div>
        <Button variant="ghost" onClick={onClose} className="self-start text-gray-500 hover:bg-gray-100 hover:text-gray-900">Cancel</Button>
      </div>

      <div role="list" aria-label="Wizard progress">
        <ProgressBar steps={STEPS} currentStep={currentStep} />
      </div>

      {hasFieldErrors && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Fix the highlighted fields before moving forward.
        </div>
      )}

      {submitError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {wizard.syncError && (
        <div role="alert" className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {wizard.syncError}
        </div>
      )}

      <div className="min-h-64 rounded-2xl border border-gray-200 bg-white p-6 shadow-none sm:p-8">
        <StepComponent data={data} update={update} onNext={next} wizard={wizard} errors={errors} />
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-2">
        <Button variant="outline" onClick={back} disabled={currentStep === 1}>← Back</Button>
        {showPrimaryNavigation && (
          isLastStep
            ? <Button onClick={submit} disabled={submitting} size="lg">
                {submitting ? 'Submitting...' : 'Submit to Azure DevOps →'}
              </Button>
            : <Button onClick={next}>Next →</Button>
        )}
      </div>
    </div>
  )
}
