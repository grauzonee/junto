import { HydratedRSVP, RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { Types } from "mongoose";

export async function createFakeRSVP(overrides: Partial<HydratedRSVP> = {}, save = false) {
    const rsvpData = {
        event: new Types.ObjectId(),
        user: new Types.ObjectId(),
        status: STATUS_CONFIRMED,
        ...overrides
    }
    if (save) {
        const rsvp = await RSVP.create(rsvpData);
        return rsvp;
    } else {
        return rsvpData;
    }
}