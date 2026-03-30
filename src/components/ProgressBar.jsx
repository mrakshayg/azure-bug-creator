import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProgressBar({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = idx === steps.length - 1

        return (
          <div key={label} className={cn('flex items-center', !isLast && 'flex-1')}>
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                isCompleted && 'border-blue-600 bg-blue-600 text-white',
                isActive && 'border-blue-600 bg-white text-blue-600',
                !isCompleted && !isActive && 'border-gray-300 bg-white text-gray-400'
              )}>
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>
              <span className={cn(
                'text-xs whitespace-nowrap',
                isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
              )}>
                {label}
              </span>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                'h-0.5 flex-1 mx-1 mb-5 transition-colors',
                isCompleted ? 'bg-blue-600' : 'bg-gray-200'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
