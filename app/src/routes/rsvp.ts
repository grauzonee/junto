import { Router } from 'express';
import { update } from '@/requests/rsvp/update';
import { list } from '@/requests/rsvp/list';
import { authMiddleware } from '@/middlewares/authMiddleware';
import { requestSchemaValidate } from '@/middlewares/requestSchemaValidate';
import { UpdateRSVPSchema } from '@/schemas/http/RSVP';
import { filterMiddleware } from '@/middlewares/filterMiddleware';
import { sortMiddleware } from '@/middlewares/sortMiddleware';
import { paginateMiddleware } from '@/middlewares/paginateMiddleware';
import { RSVP } from '@/models/rsvp/RSVP';

export const router = Router()

router.get('/', [authMiddleware, filterMiddleware(RSVP), paginateMiddleware, sortMiddleware(RSVP)], list);
router.put('/:rsvpId', [requestSchemaValidate(UpdateRSVPSchema), authMiddleware], update);
