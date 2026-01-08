import { HydratedRSVP, IRSVP, STATUS_CONFIRMED } from "@/models/RSVP";
import { Types } from "mongoose";

export function createFakeRSVP(overrides: Partial<HydratedRSVP> = {}) {
    return {
        event: new Types.ObjectId(),
        user: new Types.ObjectId(),
        status: STATUS_CONFIRMED,
        ...overrides
    }
}