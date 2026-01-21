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

interface RSVPQueryHelpers {
    confirmed(): mongoose.Query<HydratedRSVP[], HydratedRSVP>;
    canceled(): mongoose.Query<HydratedRSVP[], HydratedRSVP>;
    maybe(): mongoose.Query<HydratedRSVP[], HydratedRSVP>;
}
interface RSVPMethods {
    setStatus(status: string): void;
    cancel(): Promise<HydratedRSVP>;
    confirm(): Promise<HydratedRSVP>;
    markAsMaybe(): Promise<HydratedRSVP>;
}

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


export type HydratedRSVP = HydratedDocument<IRSVP> & RSVPMethods;
export interface RSVPModelType
    extends Model<IRSVP, RSVPQueryHelpers, RSVPMethods> {
    isUserAttendingEvent(
        user: string,
        event: string
    ): Promise<HydratedRSVP | null>;
}


const RSVPSchema = new Schema<IRSVP, RSVPModelType, RSVPMethods, RSVPQueryHelpers>(
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
            async isUserAttendingEvent(user: string, event: string) {
                return await this.findOne({ user, event });
            }
        },
        query: {
            confirmed(this: mongoose.Query<HydratedRSVP[], HydratedRSVP>) {
                return this.where({ status: STATUS_CONFIRMED });
            },
            canceled(this: mongoose.Query<HydratedRSVP[], HydratedRSVP>) {
                return this.where({ status: STATUS_CANCELED });
            },
            maybe(this: mongoose.Query<HydratedRSVP[], HydratedRSVP>) {
                return this.where({ status: STATUS_MAYBE });
            }
        },
        methods: {
            setStatus(this: HydratedRSVP, status: string) {
                if (!isRSVPStatus(status)) {
                    throw new Error("Invalid RSVP status");
                }
                this.status = status;
            },
            cancel(this: HydratedRSVP) {
                this.status = STATUS_CANCELED;
                return this.save();
            },
            confirm(this: HydratedRSVP) {
                this.status = STATUS_CONFIRMED;
                return this.save();
            },
            markAsMaybe(this: HydratedRSVP) {
                this.status = STATUS_MAYBE;
                return this.save();
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