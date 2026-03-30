import { cn } from '@/lib/utils'

export function Textarea({ className, label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
          className
        )}
        {...props}
      />
    </div>
  )
}
