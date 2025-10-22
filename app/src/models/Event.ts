import { BadInputError } from "@/types/errors/InputError";
import mongoose, { Document, Schema, Types, SchemaTypes, Model } from "mongoose";
import { type PaginateQueryHelpers, paginate } from "@/helpers/queryHelper";

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
    topics: string[]
}

export type EventDocument = IEvent & Document & EventMethods;

type EventModelType = Model<EventDocument, PaginateQueryHelpers<EventDocument>>;

export const EventSchema = new Schema<
    EventDocument,
    EventModelType,
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
    ]
}, { timestamps: true })

EventSchema.statics.getFilterableFields = function(): string[] {
    return ['author']
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

export const Event = mongoose.model<EventDocument, EventModelType>("Event", EventSchema)


