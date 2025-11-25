import * as z from "zod";
import { Types } from "mongoose"

export const CoordinatesSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    radius: z.number().min(1).max(15).default(3)
})

export type CoordinatesInput = z.infer<typeof CoordinatesSchema>

export const CreateEventSchema = z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string(),
    date: z.number().refine(
        (value) => value >= Math.ceil(Date.now() / 1000),
        { message: "Date cannot be in the past" }
    ),
    fullAddress: z.string(),
    location: z.object({
        type: z.string(),
        coordinates: z.array(z.float64())
    }),
    categories: z.array(z.string()).refine(
        items => new Set(items).size === items.length,
        {
            message: "Categories field must contain unique values"
        }
    ).refine(
        items => items.every(item => Types.ObjectId.isValid(item)),
        {
            message: "Categories field must contain valid ids"
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
