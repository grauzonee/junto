import mongoose, { HydratedDocument, Schema, Types, SchemaTypes, Model } from "mongoose";
import messages from "@/constants/errorMessages"
import * as validators from "@/models/rsvp/validators";
import { RSVPMethods, setStatus, cancel, confirm, markAsMaybe } from "@/models/rsvp/methods";
import { RSVPStatus } from "@/models/rsvp/utils";
import { RSVPQueryHelpers, confirmed, canceled, maybe } from "@/models/rsvp/queries";
import { isUserAttendingEvent } from "@/models/rsvp/statics";

export interface IRSVP {
    event: Types.ObjectId;
    user: Types.ObjectId;
    status: RSVPStatus;
    additionalGuests?: number;
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
    validator: validators.statusValidator,
    message: messages.validation.NOT_CORRECT("Rsvp status")
});
RSVPSchema.path("event").validate({
    validator: function (value) {
        return validators.eventValidator(value);
    },
    message: messages.validation.NOT_CORRECT("event")
});

export const RSVP = mongoose.model<IRSVP, RSVPModelType>("RSVP", RSVPSchema);