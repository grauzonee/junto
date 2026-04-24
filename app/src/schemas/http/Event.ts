import * as z from "zod";
import { Types } from "mongoose"
import messages from "@/constants/errorMessages"

export const CoordinatesSchema = z.object({
    lat: z.coerce.number()
        .min(-90, { message: messages.http.MIN("Latitude", -90) })
        .max(90, { message: messages.http.MAX("Latitude", 90) }),
    lng: z.coerce.number()
        .min(-180, { message: messages.http.MIN("Longitude", -180) })
        .max(180, { message: messages.http.MAX("Longitude", 180) }),
    radius: z.number().min(1)
        .max(15, { message: messages.http.MAX("Radius", 15) })
        .default(3)
})

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
        type: z.string()
            .refine(value => value === "Point", { message: messages.validation.NOT_CORRECT("Location type") }),
        coordinates: z.array(z.float64()).length(2).refine(
            (coords) => {
                const [lng, lat] = coords;
                return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
            },
            { message: messages.validation.NOT_CORRECT("Coordinates") }
        )
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
    maxAttendees: z.number()
        .min(1, { message: messages.http.MIN("Max Attendees", 1) })
        .max(200, { message: messages.http.MAX("Max Attendees", 200) })
}).strict()

export const EditEventSchema = CreateEventSchema.partial().strict();
