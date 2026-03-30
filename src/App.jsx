import { useState } from 'react'
import { Navbar } from '@/components/Navbar'

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNewBug={() => setWizardOpen(true)} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {wizardOpen
          ? <div className="text-gray-500">Wizard coming soon...</div>
          : <div className="text-gray-500">Dashboard coming soon...</div>
        }
      </main>
    </div>
  )
}
