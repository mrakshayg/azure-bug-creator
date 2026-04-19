import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { extractUserStory } from '@/lib/api'
import { appendUserStoryContext, buildPrompt } from '@/lib/promptBuilder'

export function Step2Prompt({ data, update, wizard }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [extractError, setExtractError] = useState('')
  const [extractState, setExtractState] = useState('idle')
  const [extractSuccess, setExtractSuccess] = useState('')
  const prompt = data.prompt || buildPrompt(data)

  const handleStoryIdChange = (value) => {
    update({ linkedUserStoryId: value })
    setExtractError('')
    setExtractSuccess('')
  }

  const handleExtractUserStory = async () => {
    const storyId = (data.linkedUserStoryId || '').trim()
    if (!storyId) {
      setExtractError('Enter a User Story ID before extracting.')
      return
    }
    if (!/^\d+$/.test(storyId)) {
      setExtractError('User Story ID must be numeric.')
      return
    }

    try {
      setExtractState('loading')
      setExtractError('')
      const story = await extractUserStory(storyId)
      const nextPrompt = appendUserStoryContext(prompt, story.contextBlock)
      update({ prompt: nextPrompt, linkedUserStoryId: storyId })
      setExtractSuccess(`User Story ${storyId} extracted${story.title ? `: ${story.title}` : ''}`)
    } catch (error) {
      setExtractError(error.message || 'Failed to extract User Story.')
    } finally {
      setExtractState('idle')
    }
  }

  const handleCopyAndContinue = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      update({ prompt })
      setCopied(true)
      setCopyError('')
      setExtractError('')
      setTimeout(() => setCopied(false), 2000)
      wizard.goTo(3)
    } catch {
      setCopyError('Clipboard access failed. Copy the prompt manually from the editor, then try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-950">Prompt draft</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Edit the instruction if needed, then use the single action below to copy it and continue.
        </p>
      </div>

      <Textarea
        label="AI Prompt"
        rows={16}
        value={prompt}
        onChange={e => update({ prompt: e.target.value })}
        className="rounded-2xl border-gray-200 bg-gray-950 px-4 py-4 font-mono text-xs leading-relaxed text-gray-100 placeholder:text-gray-500"
        error={copyError}
        hint={data.promptWasInvalidated ? 'Step 1 changed, so the previously edited prompt was cleared to avoid stale instructions.' : 'Edit the prompt if the AI needs stricter instructions.'}
      />

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Optional: Add User Story context to this prompt</p>
          <p className="mt-1 text-sm text-gray-500">
            Enter a User Story ID and extract it. The story context is appended to the prompt you copy.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="User Story ID"
            value={data.linkedUserStoryId || ''}
            onChange={(event) => handleStoryIdChange(event.target.value)}
            placeholder="e.g. 12345"
            className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3 sm:min-w-[240px]"
            hint="Optional. You can skip this and continue normal flow."
            error={extractError}
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={handleExtractUserStory}
            disabled={extractState === 'loading'}
          >
            {extractState === 'loading' ? 'Extracting...' : 'Extract User Story'}
          </Button>
        </div>
        {extractSuccess && (
          <p className="text-sm text-green-700">{extractSuccess}</p>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">Copy first, then move forward.</p>
          <p className="mt-1 text-sm text-gray-500">This keeps the launch step aligned with the exact prompt you reviewed.</p>
        </div>
        <Button onClick={handleCopyAndContinue} size="lg" className="shrink-0">
          {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Prompt & Continue</>}
        </Button>
      </div>
    </div>
  )
}
