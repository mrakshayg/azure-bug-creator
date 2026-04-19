import { Router } from 'express'
import { z } from 'zod'

import { requireAuth } from '../middleware/require-auth.js'
import { createDraft, getDraft, listDrafts, updateDraft } from '../services/draft-service.js'
import { parseAiOutputDetails } from '../services/parser-service.js'
import { extractUserStoryContext } from '../services/user-story-service.js'

export const draftsRouter = Router()

draftsRouter.use(requireAuth)

draftsRouter.get('/drafts', async (req, res) => {
  const items = await listDrafts(req.session.user!.id)
  res.json({ items })
})

draftsRouter.post('/drafts', async (req, res) => {
  const draft = await createDraft(req.session.user!.id, req.body)
  res.status(201).json(draft)
})

draftsRouter.get('/drafts/:draftId', async (req, res) => {
  const draft = await getDraft(req.session.user!.id, req.params.draftId)
  if (!draft) return res.status(404).json({ error: 'draft_not_found' })
  res.json(draft)
})

draftsRouter.put('/drafts/:draftId', async (req, res) => {
  const draft = await updateDraft(req.session.user!.id, req.params.draftId, req.body)
  if (!draft) return res.status(404).json({ error: 'draft_not_found' })
  res.json(draft)
})

draftsRouter.post('/drafts/:draftId/parse', async (req, res) => {
  const bodySchema = z.object({
    rawOutput: z.string().default(''),
  })

  const { rawOutput } = bodySchema.parse(req.body)
  const draft = await getDraft(req.session.user!.id, req.params.draftId)
  if (!draft) return res.status(404).json({ error: 'draft_not_found' })

  const parsed = parseAiOutputDetails(rawOutput)
  const updated = await updateDraft(req.session.user!.id, req.params.draftId, {
    ...parsed.result,
    parserWarnings: parsed.warnings,
  })

  res.json({
    draft: updated,
    parser: parsed,
  })
})

draftsRouter.post('/user-stories/extract', async (req, res) => {
  const bodySchema = z.object({
    storyId: z.string().trim().min(1),
  })

  const { storyId } = bodySchema.parse(req.body)
  const context = await extractUserStoryContext(req.session.user!.id, storyId)
  res.json(context)
})
