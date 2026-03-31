import { useState } from 'react'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buildPrompt } from '@/lib/promptBuilder'

const AI_TOOLS = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    color: 'hover:border-green-400 hover:bg-green-50',
    activeColor: 'border-green-400 bg-green-50',
    logo: '🤖',
    desc: 'OpenAI ChatGPT',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    color: 'hover:border-orange-400 hover:bg-orange-50',
    activeColor: 'border-orange-400 bg-orange-50',
    logo: '✦',
    desc: 'Anthropic Claude',
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: 'hover:border-blue-400 hover:bg-blue-50',
    activeColor: 'border-blue-400 bg-blue-50',
    logo: '✦',
    desc: 'Google Gemini',
  },
]

export function Step3Launch({ data, onNext }) {
  const [launched, setLaunched] = useState(null)
  const [launchError, setLaunchError] = useState('')
  const [popupBlocked, setPopupBlocked] = useState('')

  const handleLaunch = async (tool) => {
    const prompt = data.prompt || buildPrompt(data)

    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      setLaunchError('Clipboard access failed. Copy the prompt manually from Step 2 before launching the AI tool.')
      return
    }

    const popup = window.open(tool.url, '_blank', 'noopener,noreferrer')
    setLaunched(tool.name)
    setLaunchError('')
    setPopupBlocked(popup ? '' : tool.url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-950">Launch your AI tool</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Open one tool, paste the prompt, ask for the structured bug report, then return here with the result.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {AI_TOOLS.map(tool => (
          <button
            key={tool.name}
            onClick={() => handleLaunch(tool)}
            type="button"
            className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border p-6 text-left transition-all ${
              launched === tool.name ? tool.activeColor : `border-gray-200 bg-gray-50 ${tool.color}`
            }`}
          >
            <span className="text-4xl">{tool.logo}</span>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{tool.name}</p>
              <p className="text-xs text-gray-500">{tool.desc}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <ExternalLink size={12} /> Opens in new tab
            </div>
          </button>
        ))}
      </div>

      {launchError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {launchError}
        </div>
      )}

      {popupBlocked && (
        <div role="alert" className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Your browser blocked the new tab. Open <a className="font-medium underline" href={popupBlocked} target="_blank" rel="noreferrer">this AI tool link</a> manually.
        </div>
      )}

      {launched && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle2 size={16} />
            Prompt copied! {launched} opened in a new tab. Paste the prompt, copy the structured output, then click below.
          </div>
          <Button size="sm" onClick={onNext}>
            I have the output →
          </Button>
        </div>
      )}
    </div>
  )
}
