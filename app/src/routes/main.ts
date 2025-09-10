import { Router } from 'express';
import { router as mediaRouter } from '@/routes/media'
import { router as eventRouter } from '@/routes/event'

export const router = Router()

router.use('/media', mediaRouter)
router.use('/event', eventRouter)

