import { Router } from 'express';
import { update } from '@/requests/rsvp/update';
import { authMiddleware } from '@/middlewares/authMiddleware';
import { requestSchemaValidate } from '@/middlewares/requestSchemaValidate';
import { UpdateRSVPSchema } from '@/schemas/http/RSVP';

export const router = Router()

router.put('/:rsvpId', [requestSchemaValidate(UpdateRSVPSchema), authMiddleware], update);
