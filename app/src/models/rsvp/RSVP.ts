import mongoose, { HydratedDocument, Schema, Types, SchemaTypes, Model } from "mongoose";
import messages from "@/constants/errorMessages"
import { eventValidator, statusValidator } from "@/models/rsvp/validators";
import { RSVPMethods, setStatus, cancel, confirm, markAsMaybe } from "@/models/rsvp/methods";
import { RSVPStatus } from "@/models/rsvp/utils";
import { RSVPQueryHelpers, confirmed, canceled, maybe } from "@/models/rsvp/queries";
import { isUserAttendingEvent } from "@/models/rsvp/statics";
import { activeUserValidator } from "@/models/user/validators";

export interface IRSVP {
    event: Types.ObjectId;
    user: Types.ObjectId;
    status: RSVPStatus;
    additionalGuests?: number;
    eventDate: Date;
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
        },
        eventDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true,
        statics: {
            isUserAttendingEvent
        },
        query: {
            confirmed,
            canceled,
            maybe
        },
        methods: {
            setStatus,
            cancel,
            confirm,
            markAsMaybe
        }
    }
)

RSVPSchema.path("status").validate({
    validator: statusValidator,
    message: messages.validation.NOT_CORRECT("Rsvp status")
});
RSVPSchema.path("event").validate({
    validator: eventValidator,
    message: messages.validation.NOT_CORRECT("event")
});
RSVPSchema.path("user").validate({
    validator: activeUserValidator,
    message: messages.validation.NOT_EXISTS("user")
});
RSVPSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    versionKey: false,
    transform: (_, ret) => {
        if ('updatedAt' in ret) {
            delete ret.updatedAt;
        }

        return ret;
    }
});

RSVPSchema.index({ event: 1, user: 1 }, { unique: true });

export const RSVP = mongoose.model<IRSVP, RSVPModelType>("RSVP", RSVPSchema);
