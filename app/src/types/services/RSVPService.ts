import z from "zod";
import { RSVPSchema } from "@/schemas/http/RSVP";

export type CreateRSVPInput = z.infer<typeof RSVPSchema>;