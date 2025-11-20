import { Router } from 'express';
import { router as mediaRouter } from '@/routes/media'
import { router as eventRouter } from '@/routes/event'
import { router as authRouter } from '@/routes/auth'
import { router as userRouter } from '@/routes/user'
import { router as interestRouter} from '@/routes/interest';

export const router = Router()

router.use('/media', mediaRouter)
router.use('/event', eventRouter)
router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/interests', interestRouter)

