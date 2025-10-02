import { Schema } from "mongoose";

export interface Location {
    value: string,
    coordinates: {
        lat: number;
        lng: number;
    }
}

export const LocationSchema = new Schema({
    value: {
        type: String,
        required: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    }
}, { _id: false })
