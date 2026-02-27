import { Router } from 'express';
import { router as mediaRouter } from '@/routes/media'
import { router as eventRouter } from '@/routes/event'
import { router as authRouter } from '@/routes/auth'
import { router as userRouter } from '@/routes/user'
import { router as interestRouter } from '@/routes/interest';
import { router as categoryRouter } from '@/routes/categories';
import { router as rsvpRouter } from '@/routes/rsvp';
import { router as eventtypesRouter } from '@/routes/eventtypes';

export const router = Router()

router.use('/media', mediaRouter)
router.use('/event', eventRouter)
router.use('/eventtypes', eventtypesRouter)
router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/interests', interestRouter)
router.use('/categories', categoryRouter)
router.use('/rsvp', rsvpRouter)