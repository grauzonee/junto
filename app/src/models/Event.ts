import { BadInputError } from "@/types/errors/InputError";
import mongoose, { HydratedDocument, Schema, Types, SchemaTypes, Model } from "mongoose";
import { type Filterable, type FilterableField, FilterValue } from "@/types/Filter";
import { type CurrencyCode } from "currency-codes-ts/dist/types";
import { getConfigValue } from "@/helpers/configHelper";
import { type Sortable } from "@/types/Sort";
import { paginatePlugin, type PaginateQueryHelper } from "@/models/plugins/paginate";
import { Category } from "@/models/Category";
import { EventType } from "@/models/EventType";
import messages from "@/constants/errorMessages";

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
    attendees: Types.ObjectId[];
    maxAttendees: number;
    fee: {
        amount: number,
        currence: CurrencyCode
    };
    active: boolean;
    categories: Types.ObjectId[];
    type: Types.ObjectId;
    deletedAt?: Date;
}

export type HydratedEvent = HydratedDocument<IEvent>;

export interface EventMethods {
    attend(userId: Types.ObjectId): Promise<HydratedEvent>
}

interface EventModelType extends Model<IEvent, PaginateQueryHelper<IEvent>, EventMethods>, Filterable, Sortable { }

export const EventSchema = new Schema<IEvent, Model<IEvent>, EventMethods, PaginateQueryHelper<IEvent>>(
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
        categories: [
            {
                type: SchemaTypes.ObjectId,
                required: false,
                ref: 'Category'
            }
        ],
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
            getFilterableFields(): FilterableField[] {
                return [
                    {
                        field: 'date',
                        preprocess: (value: FilterValue) => new Date(value as string)
                    },
                    {
                        field: 'categories'
                    },
                    {
                        field: 'type'
                    }
                ]
            },
            getSortableFields(): string[] {
                return ['date'];
            }
        },
        methods: {
            async attend(this: HydratedDocument<IEvent>, userId: Types.ObjectId) {
                if (this.attendees.some(id => id.equals(userId))) {
                    throw new BadInputError("User already attending this event");
                }

                this.attendees.push(userId);
                await this.save();
                return this;
            }
        }
    }
);

EventSchema.index({ location: "2dsphere" })

EventSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    versionKey: false,
    transform: (_, ret) => {
        if ('updatedAt' in ret) {
            delete ret.updatedAt;
        }
        ret.imageUrl = getConfigValue('HOST') + '/' + ret.imageUrl

        return ret;
    }
})

EventSchema.path("categories").validate({
    validator: async function(value: Types.ObjectId[]) {
        if (!value || value.length === 0) return true;
        const count = await Category.countDocuments({ _id: { $in: value } });
        return count === value.length;
    },
    message: messages.validation.NOT_EXISTS_MUL("categories")
});

EventSchema.path("type").validate({
    validator: async function(value: Types.ObjectId) {
        const typeExists = await EventType.exists({ _id: value });
        return typeExists;
    },
    message: messages.validation.NOT_EXISTS("event type")
});

//Author is always attending the event
EventSchema.pre("save", function(next) {
    if (this.attendees.length === 0) {
        this.attendees = [this.author]
    }
    next();
})

EventSchema.plugin(paginatePlugin<IEvent>);

export const Event = mongoose.model<IEvent, EventModelType>("Event", EventSchema)


