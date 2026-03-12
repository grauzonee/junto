import mongoose, { HydratedDocument, Schema, Types, SchemaTypes, Model } from "mongoose";
import messages from "@/constants/errorMessages"
import * as validators from "@/models/rsvp/validators";
import { RSVPMethods, setStatus, cancel, confirm, markAsMaybe } from "@/models/rsvp/methods";
import { RSVPStatus } from "@/models/rsvp/utils";
import { RSVPQueryHelpers } from "@/models/rsvp/queries";
import { isUserAttendingEvent, getFilterableFields, getSortableFields } from "@/models/rsvp/statics";
import { Filterable } from "@/types/Filter";
import { Sortable } from "@/types/Sort";
import { paginatePlugin } from "@/models/plugins/paginate";

export interface IRSVP {
    event: Types.ObjectId;
    user: Types.ObjectId;
    status: RSVPStatus;
    additionalGuests?: number;
    eventDate: Date;
}

export type HydratedRSVP = HydratedDocument<IRSVP> & RSVPMethods;

export interface RSVPModelType
    extends Model<IRSVP, RSVPQueryHelpers, RSVPMethods>, Filterable, Sortable {
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
            getFilterableFields,
            getSortableFields,
            isUserAttendingEvent
        },
        methods: {
            setStatus,
            cancel,
            confirm,
            markAsMaybe
        }
    }
)

RSVPSchema.plugin(paginatePlugin<IRSVP>);

RSVPSchema.path("status").validate({
    validator: validators.statusValidator,
    message: messages.validation.NOT_CORRECT("Rsvp status")
});
RSVPSchema.path("event").validate({
    validator: async function (value) {
        return await validators.eventValidator(value);
    },
    message: messages.validation.NOT_CORRECT("event")
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

export const RSVP = mongoose.model<IRSVP, RSVPModelType>("RSVP", RSVPSchema);