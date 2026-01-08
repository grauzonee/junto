import { Request } from "express";
import { RSVP, HydratedRSVP } from "@/models/RSVP";
import { logger } from "@/config/loggerConfig";

export async function insert(req: Request) {
    const user = req.user._id;
    const { eventId, status, additionalGuests } = req.body;
    try {
        return await RSVP.create({ event: eventId, status, additionalGuests, user });
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