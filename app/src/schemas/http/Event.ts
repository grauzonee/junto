import * as z from "zod";
import { Types } from "mongoose"
import messages from "@/constants/errorMessages"

export const CoordinatesSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radius: z.number().min(1).max(15).default(3)
})

export type CoordinatesInput = z.infer<typeof CoordinatesSchema>

export const CreateEventSchema = z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string(),
    date: z.number().refine(
        (value) => value >= Math.ceil(Date.now() / 1000),
        { message: messages.http.DATE_IN_PAST }
    ),
    fullAddress: z.string(),
    location: z.object({
        type: z.string(),
        coordinates: z.array(z.float64())
    }),
    categories: z.array(z.string()).refine(
        items => new Set(items).size === items.length,
        {
            message: messages.http.UNIQUE_VALUES("Categories")
        }
    ).refine(
        items => items.every(item => Types.ObjectId.isValid(item)),
        {
            message: messages.http.INVALID_ID("Categories")
        }
    ),
    type: z.string().refine(
        type => Types.ObjectId.isValid(type),
        {
            message: messages.http.INVALID_ID("Type")
        }
    ),
    fee: z.object({
        amount: z.number(),
        currency: z.string()
    }).optional(),
    maxAttendees: z.number().optional()
}).strict()

//What about maxAttendies?
export const EditEventSchema = CreateEventSchema.partial().strict();
