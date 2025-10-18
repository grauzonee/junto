import { type Location, LocationSchema } from "@/models/Location"
import mongoose, { Document, Schema, Types, SchemaTypes, Model } from "mongoose";
import { type Filterable } from "@/types/Filter";

export interface IEvent {
    title: string;
    description: string;
    date: Date;
    location: Location;
    imageUrl: string;
    author: Types.ObjectId,
    attendees: [Types.ObjectId],
    topics: string[]
}

export type EventDocument = IEvent & Document;

interface EventModel extends Model<EventDocument>, Filterable { }

export const EventSchema = new Schema({
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
    location: {
        type: LocationSchema,
        required: true
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

EventSchema.statics.getFilterableFields = function(): string[] {
    return ['author']
}
export const Event = mongoose.model<EventDocument, EventModel>("Event", EventSchema)



