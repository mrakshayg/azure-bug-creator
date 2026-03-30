import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buildPrompt } from '@/lib/promptBuilder'

export function Step2Prompt({ data }) {
  const [copied, setCopied] = useState(false)
  const prompt = buildPrompt(data)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Your AI Prompt is Ready</h2>
        <p className="text-sm text-gray-500 mt-1">
          Copy this prompt and paste it into your preferred AI tool in the next step.
        </p>
      </div>

      <div className="relative">
        <pre className="rounded-lg bg-gray-900 text-gray-100 text-xs p-4 overflow-auto max-h-72 whitespace-pre-wrap leading-relaxed font-mono">
          {prompt}
        </pre>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="absolute top-3 right-3 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
        </Button>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        Tip: In the next step, click your preferred AI tool button. It will copy the prompt and open the AI in a new tab.
      </div>
    </div>
  )
}
