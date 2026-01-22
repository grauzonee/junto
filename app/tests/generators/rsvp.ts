import { HydratedRSVP, IRSVP, RSVP, STATUS_CONFIRMED } from "@/models/RSVP";
import { Types } from "mongoose";

export async function createFakeRSVP(overrides: Partial<HydratedRSVP> = {}, save = false) {
    const rsvpData = {
        event: new Types.ObjectId(),
        user: new Types.ObjectId(),
        status: STATUS_CONFIRMED,
        ...overrides
    }
    if (save) {
        const rsvp = RSVP.create(rsvpData);
        return rsvp;
    } else {
        return rsvpData;
    }
}