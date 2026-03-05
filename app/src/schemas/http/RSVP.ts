import * as z from 'zod';
import messages from "@/constants/errorMessages"
import { RSVP_STATUSES } from '@/models/rsvp/utils';
import { Types } from 'mongoose';

export const CreateRSVPSchema = z.object({
    eventId: z.string().refine(
        id => Types.ObjectId.isValid(id),
        {
            message: messages.http.INVALID_ID("Event ID")
        }
    ),
    status: z.string().refine((status) => {
        return (RSVP_STATUSES as readonly string[]).includes(status);
    }, {
        message: messages.validation.NOT_CORRECT("status")
    }),
    additionalGuests: z.number().min(0, { message: messages.http.MIN("Additional Guests", 0) }).optional()
});

export const UpdateRSVPSchema = z.object({
    status: z.string().refine((status) => {
        return (RSVP_STATUSES as readonly string[]).includes(status);
    }, {
        message: messages.validation.NOT_CORRECT("status")
    }),
    additionalGuests: z.number().min(0, { message: messages.http.MIN("Additional Guests", 0) }).optional()
});

export const FilterRSVPSchema = z.object({
    status: z.string().refine((status) => {
        return (RSVP_STATUSES as readonly string[]).includes(status);
    }, {
        message: messages.validation.NOT_CORRECT("status")
    }).optional(),
    active: z.boolean().optional(),
    before_date: z.int().optional(),
    after_date: z.int().optional(),
    date: z.int().optional(),
    is_organizer: z.boolean().optional()
})