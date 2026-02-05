import z from "zod";
import { CreateRSVPSchema, UpdateRSVPSchema } from "@/schemas/http/RSVP";

export type CreateRSVPInput = z.infer<typeof CreateRSVPSchema>;
export type UpdateRSVPInput = z.infer<typeof UpdateRSVPSchema>;