import * as z from "zod";

export const CoordinatesSchema: z.Schema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    radius: z.number().min(1).max(15).default(3)
})

export type CoordinatesInput = z.infer<typeof CoordinatesSchema>

export const CreateEventSchema: z.Schema = z.object({
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
    topics: z.array(z.string())
})


