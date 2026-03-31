import { Router } from 'express'
import multer from 'multer'

import { requireAuth } from '../middleware/require-auth.js'
import { getDraft } from '../services/draft-service.js'
import { saveAttachment } from '../services/attachment-service.js'

export const attachmentsRouter = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
})

attachmentsRouter.use(requireAuth)

attachmentsRouter.post('/drafts/:draftId/attachments', upload.single('file'), async (req, res) => {
  const draftId = String(req.params.draftId)
  const draft = await getDraft(req.session.user!.id, draftId)
  if (!draft) return res.status(404).json({ error: 'draft_not_found' })
  if (!req.file) return res.status(400).json({ error: 'file_required' })

  const attachment = await saveAttachment(draft, req.file)
  res.status(201).json(attachment)
})
