import { HydratedRSVP, RSVP } from "@/models/rsvp/RSVP";
import { RSVPStatus, STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { Types } from "mongoose";
import { getOneEvent } from "@tests/getters";
import { createUser } from "@tests/generators/user";

export interface FakeRSVPData {
    event: Types.ObjectId;
    user: Types.ObjectId;
    status: RSVPStatus;
    eventDate: Date;
    additionalGuests?: number;
}

export async function createFakeRSVP(overrides?: Partial<FakeRSVPData>, save?: false): Promise<FakeRSVPData>;
export async function createFakeRSVP(overrides: Partial<FakeRSVPData>, save: true): Promise<HydratedRSVP>;
export async function createFakeRSVP(overrides: Partial<FakeRSVPData> = {}, save = false) {
    let defaultEvent = null;
    let defaultUser = null;

    if (save && !overrides.event) {
        defaultEvent = await getOneEvent({ active: true });
    }

    if (save && !overrides.user) {
        defaultUser = await createUser({}, true);
    }

    const rsvpData: FakeRSVPData = {
        event: defaultEvent?._id ?? new Types.ObjectId(),
        user: defaultUser?._id ?? new Types.ObjectId(),
        status: STATUS_CONFIRMED,
        eventDate: defaultEvent?.date ?? new Date(),
        ...overrides
    };
    if (save) {
        const rsvp = await RSVP.create(rsvpData);
        return rsvp;
    } else {
        return rsvpData;
    }
}
