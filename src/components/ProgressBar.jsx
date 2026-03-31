import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProgressBar({ steps, currentStep }) {
  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <div className="flex min-w-max items-start">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = idx === steps.length - 1

        return (
          <div
            key={label}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            className={cn('flex items-start', !isLast && 'flex-1')}
          >
            <div className="flex min-w-24 flex-col items-center gap-2 sm:min-w-28">
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                isCompleted && 'border-gray-900 bg-gray-900 text-white',
                isActive && 'border-gray-900 bg-white text-gray-900',
                !isCompleted && !isActive && 'border-gray-300 bg-white text-gray-400'
              )}>
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>
              <span className={cn(
                'text-center text-xs whitespace-nowrap',
                isActive ? 'font-medium text-gray-900' : isCompleted ? 'text-gray-600' : 'text-gray-400'
              )}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={cn(
                'mx-2 mt-4 h-px w-8 transition-colors sm:w-12',
                isCompleted ? 'bg-gray-900' : 'bg-gray-200'
              )} />
            )}
          </div>
        )
      })}
      </div>
    </div>
  )
}
