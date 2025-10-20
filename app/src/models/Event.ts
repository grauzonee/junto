import mongoose, { Document, Schema, Types, SchemaTypes } from "mongoose";

export interface IEvent {
    title: string;
    description: string;
    date: Date;
    fullAddress: string;
    location: {
        type: "Point";
        coordinates: [number];
    }
    imageUrl: string;
    author: Types.ObjectId,
    attendees: [Types.ObjectId],
    topics: string[]
}

export type EventDocument = IEvent & Document;

export const EventSchema = new Schema<EventDocument>({
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
            required: true
        }
    ]
}, { timestamps: true })

EventSchema.index({ location: "2dsphere" })

EventSchema.set('toJSON', {
    transform: (doc, ret: Partial<EventDocument>) => {
        ret.id = ret._id;
        delete ret._id;

        return ret;
    }
})

export const Event = mongoose.model("Event", EventSchema)



