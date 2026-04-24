import mongoose, { HydratedDocument, Schema, Types, SchemaTypes, Model } from "mongoose";
import { type Filterable } from "@/types/Filter";
import { type CurrencyCode } from "currency-codes-ts/dist/types";
import { getConfigValue } from "@/helpers/configHelper";
import { toUnixSeconds } from "@/helpers/dateHelper";
import { type Sortable } from "@/types/Sort";
import { paginatePlugin, type PaginateQueryHelper } from "@/models/plugins/paginate";
import messages from "@/constants/errorMessages";
import { getFilterableFields, getSortableFields, softDeleteByAuthor } from "@/models/event/statics";
import { categoriesValidator, typeValidator } from "@/models/event/validators";
import { registerSaveHooks } from "@/models/event/hooks";
import { normalizeEventDate } from "@/models/event/utils";
import { activeUserValidator } from "@/models/user/validators";

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

export interface EventModelType extends Model<IEvent, PaginateQueryHelper<IEvent>, object>, Filterable, Sortable {
    softDeleteByAuthor(authorId: Types.ObjectId | string): Promise<void>;
}

export const EventSchema = new Schema<IEvent, EventModelType, object, PaginateQueryHelper<IEvent>>(
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
            getSortableFields,
            softDeleteByAuthor
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

        if (transformedRet.date instanceof Date) {
            transformedRet.date = toUnixSeconds(transformedRet.date);
        }
        transformedRet.imageUrl = getConfigValue('HOST') + '/' + transformedRet.imageUrl

        return transformedRet;
    }
})

EventSchema.path("categories").validate({
    validator: categoriesValidator,
    message: messages.validation.NOT_EXISTS_MUL("categories")
});

EventSchema.path("type").validate({
    validator: typeValidator,
    message: messages.validation.NOT_EXISTS("event type")
});

EventSchema.path("author").validate({
    validator: activeUserValidator,
    message: messages.validation.NOT_EXISTS("user")
});

registerSaveHooks(EventSchema);

EventSchema.plugin(paginatePlugin<IEvent>);

export const Event = mongoose.model<IEvent, EventModelType>("Event", EventSchema)
