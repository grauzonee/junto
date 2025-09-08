import { Router } from 'express';
import { router as mediaRouter } from '@/routes/media'

export const router = Router()

router.use(mediaRouter)

