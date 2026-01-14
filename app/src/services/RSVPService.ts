import { Request } from "express";
import { RSVP, HydratedRSVP } from "@/models/RSVP";
import { logger } from "@/config/loggerConfig";
import { CreateRSVPInput } from "@/types/services/RSVPService";

export async function create(data: CreateRSVPInput, userId: string) {
    const { eventId, status, additionalGuests } = data;
    try {
        return await RSVP.create({ event: eventId, status, additionalGuests, user: userId });
    } catch (error) {
        logger.error("Error saving RSVP to MongoDB", error)
        throw error;
    }
}

export async function update(rsvp: HydratedRSVP, req: Request) {
    const { status, additionalGuests } = req.body;
    rsvp.status = status;
    rsvp.additionalGuests = additionalGuests;
    await rsvp.save();
    return rsvp;
}