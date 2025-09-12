import { Router } from 'express';
import { router as mediaRouter } from '@/routes/media'
import { router as eventRouter } from '@/routes/event'
import { router as authRouter } from '@/routes/auth'

export const router = Router()

router.use('/media', mediaRouter)
router.use('/event', eventRouter)
router.use('/auth', authRouter)

