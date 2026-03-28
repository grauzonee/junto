import mongoose, { HydratedDocument, Schema, Types, SchemaTypes, Model } from "mongoose";
import { type Filterable } from "@/types/Filter";
import { type CurrencyCode } from "currency-codes-ts/dist/types";
import { getConfigValue } from "@/helpers/configHelper";
import { type Sortable } from "@/types/Sort";
import { paginatePlugin, type PaginateQueryHelper } from "@/models/plugins/paginate";
import messages from "@/constants/errorMessages";
import { getFilterableFields, getSortableFields } from "@/models/event/statics";
import { categoriesValidator, typeValidator } from "@/models/event/validators";
import { postSaveHook, preSaveHook } from "@/models/event/hooks";

export interface IEvent {
    _id: Types.ObjectId;
    title: string;
    description: string;
    date: Date;
    fullAddress: string;
    location: {
        type: "Point";
        coordinates: number[];
    }
    imageUrl: string;
    author: Types.ObjectId;
    maxAttendees: number;
    fee: {
        amount: number,
        currency: CurrencyCode
    };
    active: boolean;
    categories: Types.ObjectId[];
    type: Types.ObjectId;
    deletedAt?: Date;
}

export type HydratedEvent = HydratedDocument<IEvent>;

interface EventModelType extends Model<IEvent, PaginateQueryHelper<IEvent>, object>, Filterable, Sortable { }

function normalizeEventDate(value: Date | number | string): Date {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "number") {
        const milliseconds = Math.abs(value) >= 1e12 ? value : value * 1000;
        return new Date(milliseconds);
    }

    if (typeof value === "string") {
        const trimmedValue = value.trim();

        if (/^-?\d+$/.test(trimmedValue)) {
            return normalizeEventDate(Number(trimmedValue));
        }

        return new Date(trimmedValue);
    }

    return value;
}

function toUnixSeconds(value: unknown): number | unknown {
    if (!(value instanceof Date)) {
        return value;
    }

    return Math.floor(value.getTime() / 1000);
}

export const EventSchema = new Schema<IEvent, Model<IEvent>, object, PaginateQueryHelper<IEvent>>(
    {
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
            set: normalizeEventDate,
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
        categories: [
            {
                type: SchemaTypes.ObjectId,
                required: true,
                ref: 'Category'
            }
        ],
        author: {
            type: SchemaTypes.ObjectId,
            required: true,
            ref: 'User'
        },
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
        type: {
            type: Schema.ObjectId,
            required: true,
            ref: 'EventType'
        },
        deletedAt: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true,
        statics: {
            getFilterableFields,
            getSortableFields
        },
    }
);

EventSchema.index({ location: "2dsphere" })

EventSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    versionKey: false,
    transform: (_, ret) => {
        const transformedRet = ret as unknown as Record<string, unknown> & {
            date: unknown;
            imageUrl: string;
        };

        if ('updatedAt' in transformedRet) {
            delete transformedRet.updatedAt;
        }

        transformedRet.date = toUnixSeconds(transformedRet.date);
        transformedRet.imageUrl = getConfigValue('HOST') + '/' + transformedRet.imageUrl

        return transformedRet;
    }
})

EventSchema.path("categories").validate({
    validator: async function (value) {
        return await categoriesValidator(value);
    },
    message: messages.validation.NOT_EXISTS_MUL("categories")
});

EventSchema.path("type").validate({
    validator: async function (value) {
        return await typeValidator(value);
    },
    message: messages.validation.NOT_EXISTS("event type")
});

EventSchema.pre("save", preSaveHook);
//Author is always attending the event
EventSchema.post("save", postSaveHook)

EventSchema.plugin(paginatePlugin<IEvent>);

export const Event = mongoose.model<IEvent, EventModelType>("Event", EventSchema)
