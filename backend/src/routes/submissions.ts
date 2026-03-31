import { Router } from 'express'

import { requireAuth } from '../middleware/require-auth.js'
import { getDraft } from '../services/draft-service.js'
import { submitDraft } from '../services/submission-service.js'

export const submissionsRouter = Router()

submissionsRouter.use(requireAuth)

submissionsRouter.post('/drafts/:draftId/submit', async (req, res, next) => {
  try {
    const draft = await getDraft(req.session.user!.id, req.params.draftId)
    if (!draft) return res.status(404).json({ error: 'draft_not_found' })

    const submission = await submitDraft(draft)
    res.status(201).json(submission)
  } catch (error) {
    next(error)
  }
})
