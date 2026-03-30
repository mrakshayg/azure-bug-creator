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

  const handleLaunch = async (tool) => {
    const prompt = buildPrompt(data)
    await navigator.clipboard.writeText(prompt)
    window.open(tool.url, '_blank')
    setLaunched(tool.name)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Launch Your AI Tool</h2>
        <p className="text-sm text-gray-500 mt-1">
          Click a button below — the prompt will be copied to your clipboard and the AI tool will open in a new tab.
          Paste the prompt, get the structured output, then come back here.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {AI_TOOLS.map(tool => (
          <button
            key={tool.name}
            onClick={() => handleLaunch(tool)}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all cursor-pointer ${
              launched === tool.name ? tool.activeColor : `border-gray-200 bg-white ${tool.color}`
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

      {launched && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-700">
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
