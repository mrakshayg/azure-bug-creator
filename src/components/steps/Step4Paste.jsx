import { useState } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { parseAIOutput } from '@/lib/outputParser'

export function Step4Paste({ update, onNext }) {
  const [raw, setRaw] = useState('')

  const handleParse = () => {
    const parsed = parseAIOutput(raw)
    update(parsed)
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Paste AI Output</h2>
        <p className="text-sm text-gray-500 mt-1">
          Copy the structured bug output from your AI tool and paste it below.
          We'll automatically parse it into form fields for you to review.
        </p>
      </div>

      <Textarea
        label="Structured Bug Output"
        placeholder={`Paste the AI output here. It should look like:\n\nBUG TITLE: ...\nMODULE: ...\nSTEPS TO REPRODUCE:\n1. ...\nEXPECTED RESULT: ...\nACTUAL RESULT: ...\nPRIORITY: ...\nSEVERITY: ...`}
        rows={12}
        value={raw}
        onChange={e => setRaw(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Leave empty to use mock data for demo purposes.
        </p>
        <Button onClick={handleParse}>
          Parse & Continue →
        </Button>
      </div>
    </div>
  )
}
