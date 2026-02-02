import { Types } from "mongoose";
import { HydratedRSVP } from "@/models/rsvp/RSVP";
import { BadInputError } from "@/types/errors/InputError";
import messages from "@/constants/errorMessages"
import { isRSVPStatus, STATUS_CONFIRMED, STATUS_CANCELED, STATUS_MAYBE } from "@/models/rsvp/utils";

export interface RSVPMethods {
    setStatus(status: string): void;
    cancel(): Promise<HydratedRSVP>;
    confirm(): Promise<HydratedRSVP>;
    markAsMaybe(): Promise<HydratedRSVP>;
}

export async function setStatus(this: HydratedRSVP, status: string) {
    if (!isRSVPStatus(status)) {
        throw new Error("Invalid RSVP status");
    }
    if (status !== STATUS_CONFIRMED) {
        await this.populate('event');
        const event = this.event as unknown as { author: Types.ObjectId };
        if (event.author.toString() === this.user.toString()) {
            throw new BadInputError("user", messages.validation.CANNOT_MODIFY("Event authors RSVP status"));
        }
    }
    this.status = status;
}

export function cancel(this: HydratedRSVP) {
    this.status = STATUS_CANCELED;
    return this.save();
}

export function confirm(this: HydratedRSVP) {
    this.status = STATUS_CONFIRMED;
    return this.save();
}

export function markAsMaybe(this: HydratedRSVP) {
    this.status = STATUS_MAYBE;
    return this.save();
}