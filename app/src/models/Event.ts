import { BadInputError } from "@/types/errors/InputError";
import mongoose, { Document, Schema, Types, SchemaTypes, Model } from "mongoose";
import { type PaginateQueryHelpers, paginate } from "@/helpers/queryHelper";
import { type Filterable, type FilterableField, FilterValue } from "@/types/Filter";
import { type CurrencyCode } from "currency-codes-ts/dist/types";
import { getConfigValue } from "@/helpers/configHelper";

export interface EventMethods {
    attend(userId: Types.ObjectId): Promise<EventDocument>
}
export interface IEvent {
    title: string;
    description: string;
    date: Date;
    fullAddress: string;
    location: {
        type: "Point";
        coordinates: number[];
    }
    imageUrl: string;
    author: Types.ObjectId,
    attendees: Types.ObjectId[],
    topics: string[],
    maxAttendees: number,
    fee: {
        amount: number,
        currence: CurrencyCode
    },
    active: boolean,
    deletedAt?: Date
}

export type EventDocument = IEvent & Document & EventMethods;

interface EventModel extends Model<EventDocument, PaginateQueryHelpers<EventDocument>>, Filterable { }

export const EventSchema = new Schema<
    EventDocument,
    EventModel,
    object,
    PaginateQueryHelpers<EventDocument>
>({
    id: {
        type: String,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        set: (v: number) => new Date(v * 1000),
        required: true
    },
    fullAddress: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    imageUrl: {
        type: String,
        required: true
    },
    topics: {
        type: [String],
        required: false,
        default: []
    },
    author: {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: 'User'
    },
    attendees: [
        {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    maxAttendees: {
        type: Number,
        required: false,
        default: -1
    },
    fee: {
        amount: {
            type: Number,
            required: false,
            default: 0
        },
        currency: {
            type: String,
            required: false,
            default: 'EUR'
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        required: false
    }
}, { timestamps: true })

EventSchema.statics.getFilterableFields = function(): FilterableField[] {
    return [{ field: 'date', preprocess: (value: FilterValue) => new Date(value as string) }, { field: 'topics', options: 'i' }]
}

EventSchema.index({ location: "2dsphere" })

EventSchema.set('toJSON', {
    transform: (doc, ret: Partial<EventDocument>) => {
        ret.id = ret._id;
        delete ret._id;
        if ('__v' in ret) {
            delete ret.__v;
        }
        if ('updatedAt' in ret) {
            delete ret.updatedAt;
        }
        ret.imageUrl = getConfigValue('HOST') + '/' + ret.imageUrl
        //ret.date = ret.date?.toISOString()

        return ret;
    }
})

EventSchema.methods.attend = async function(this: EventDocument, userId: Types.ObjectId) {
    if (this.attendees.some(id => id.equals(userId))) {
        throw new BadInputError("User already attending this event");
    }

    this.attendees.push(userId);
    await this.save();
    return this;
}

//Author is always attending the event
EventSchema.pre("save", function(next) {
    if (this.attendees.length === 0) {
        this.attendees = [this.author]
    }
    next();
})

EventSchema.query.paginate = paginate

export const Event = mongoose.model<EventDocument, EventModel>("Event", EventSchema)


