import { z } from "zod";
import { CreateEventSchema, EditEventSchema, CoordinatesSchema } from "@/schemas/http/Event";

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type CoordinatesInput = z.infer<typeof CoordinatesSchema>
export type EditEventInput = z.infer<typeof EditEventSchema>;