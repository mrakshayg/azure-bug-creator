import { Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Navbar({ onNewBug }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Bug size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">BugDraft</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onNewBug}>+ New Bug</Button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
        </div>
      </div>
    </nav>
  )
}
