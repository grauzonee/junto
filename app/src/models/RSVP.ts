import mongoose, { HydratedDocument, Schema, Types, SchemaTypes, Model } from "mongoose";
import messages from "@/constants/errorMessages"
import { Event } from "@/models/Event";

export const STATUS_CONFIRMED = 'confirmed' as const;
export const STATUS_CANCELED = 'canceled' as const;
export const STATUS_MAYBE = 'maybe' as const;

export const RSVP_STATUSES = [
    STATUS_CANCELED,
    STATUS_CONFIRMED,
    STATUS_MAYBE
] as const;

export type RSVPStatus = typeof RSVP_STATUSES[number];

export interface IRSVP {
    event: Types.ObjectId;
    user: Types.ObjectId;
    status: RSVPStatus;
    additionalGuests?: number;
}

function isRSVPStatus(status: string): status is RSVPStatus {
    return (RSVP_STATUSES as readonly string[]).includes(status);
}


export type HydratedRSVP = HydratedDocument<IRSVP>;
export interface RSVPModelType extends Model<IRSVP> {
    isUserAttendingEvent(user: Types.ObjectId, event: Types.ObjectId): Promise<HydratedRSVP | null>
}

const RSVPSchema = new Schema(
    {
        event: {
            type: SchemaTypes.ObjectId,
            required: true,
            ref: 'Event'
        },
        user: {
            type: SchemaTypes.ObjectId,
            required: true,
            ref: 'User'
        },
        status: {
            type: String,
            required: true
        },
        additionalGuests: {
            type: Number,
            required: false,
            default: 0
        }
    },
    {
        timestamps: true,
        statics: {
            async isUserAttendingEvent(user: Types.ObjectId, event: Types.ObjectId) {
                return await this.findOne({ user, event });
            }
        }
    }
)

RSVPSchema.path("status").validate({
    validator: async function (value: string) {
        return isRSVPStatus(value);
    },
    message: messages.validation.NOT_CORRECT("Rsvp status")
});
RSVPSchema.path("event").validate({
    validator: async function (value: Types.ObjectId) {
        const exists = Event.exists({ _id: value, active: true })
        return exists;
    },
    message: messages.validation.NOT_CORRECT("event")
});
export const RSVP = mongoose.model<IRSVP, RSVPModelType>("RSVP", RSVPSchema);