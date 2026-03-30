import { PlusCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { MOCK_BUGS, STATUS_COLORS } from '@/lib/mockData'

export function Dashboard({ onCreateDraft }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bug Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your Azure DevOps bug reports</p>
        </div>
        <Button onClick={onCreateDraft} size="lg">
          <PlusCircle size={18} />
          Create Draft
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Bugs', value: MOCK_BUGS.length, color: 'text-gray-900' },
          { label: 'Active', value: MOCK_BUGS.filter(b => b.status === 'Active').length, color: 'text-blue-600' },
          { label: 'Resolved', value: MOCK_BUGS.filter(b => b.status === 'Resolved').length, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bug table */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Recent Bug Reports</h2>
        </CardHeader>
        <div className="divide-y divide-gray-100">
          {MOCK_BUGS.map(bug => (
            <div key={bug.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-gray-400 w-20">{bug.id}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{bug.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{bug.module} · {bug.environment} · {bug.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={STATUS_COLORS[bug.status]}>{bug.status}</Badge>
                <Button variant="ghost" size="sm" onClick={onCreateDraft}>
                  <ExternalLink size={14} />
                  Draft
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
