import { Types } from "mongoose";
import type { RSVPModelType } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED, STATUS_CONFIRMED } from "@/models/rsvp/utils";

export async function isUserAttendingEvent(this: RSVPModelType, user: string, event: string) {
    return await this.findOne({ user, event });
}

export function cancelForEvent(this: RSVPModelType, eventId: Types.ObjectId | string) {
    return this.updateMany({ event: eventId }, { status: STATUS_CANCELED });
}

export function cancelForUser(this: RSVPModelType, userId: Types.ObjectId | string) {
    return this.updateMany({ user: userId }, { status: STATUS_CANCELED });
}

export async function getConfirmedAttendanceTotal(
    this: RSVPModelType,
    eventId: Types.ObjectId,
    authorId: Types.ObjectId,
    excludedRsvpId?: Types.ObjectId
) {
    const match: Record<string, unknown> = {
        event: eventId,
        status: STATUS_CONFIRMED,
        user: { $ne: authorId }
    };

    if (excludedRsvpId) {
        match._id = { $ne: excludedRsvpId };
    }

    const [result] = await this.aggregate<{ total: number }>([
        { $match: match },
        {
            $group: {
                _id: null,
                total: {
                    $sum: {
                        $add: [
                            1,
                            { $ifNull: ["$additionalGuests", 0] }
                        ]
                    }
                }
            }
        }
    ]);

    return result?.total ?? 0;
}
