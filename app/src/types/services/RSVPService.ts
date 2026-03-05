import z from "zod";
import { CreateRSVPSchema, UpdateRSVPSchema, FilterRSVPSchema } from "@/schemas/http/RSVP";

export type CreateRSVPInput = z.infer<typeof CreateRSVPSchema>;
export type UpdateRSVPInput = z.infer<typeof UpdateRSVPSchema>;

export type RSVPFilters = z.infer<typeof FilterRSVPSchema>;