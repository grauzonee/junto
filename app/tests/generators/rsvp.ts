import { HydratedRSVP, RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { Types } from "mongoose";
import { getOneEvent } from "@tests/getters";
import { createUser } from "@tests/generators/user";

export async function createFakeRSVP(overrides: Partial<HydratedRSVP> = {}, save = false) {
    let defaultEvent = null;
    let defaultUser = null;

    if (save && !overrides.event) {
        defaultEvent = await getOneEvent({ active: true });
    }

    if (save && !overrides.user) {
        defaultUser = await createUser({}, true);
    }

    const rsvpData = {
        event: defaultEvent?._id ?? new Types.ObjectId(),
        user: defaultUser?._id ?? new Types.ObjectId(),
        status: STATUS_CONFIRMED,
        eventDate: defaultEvent?.date ?? new Date(),
        ...overrides
    }
    if (save) {
        const rsvp = await RSVP.create(rsvpData);
        return rsvp;
    } else {
        return rsvpData;
    }
}
