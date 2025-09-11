import { type Location, LocationSchema } from "@/models/Location"
import mongoose, { Document, Schema } from "mongoose";

export interface IEvent {
    title: string;
    description: string;
    date: Date;
    location: Location;
    imageUrl: string;
}

export type EventDocument = IEvent & Document;

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
    }
}, { timestamps: true })

export const Event = mongoose.model("Event", EventSchema)



