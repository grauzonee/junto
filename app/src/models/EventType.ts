import mongoose, { Schema, Model, HydratedDocument } from "mongoose";
import { type Filterable, type FilterableField } from "@/types/Filter";
import { PaginateQueryHelper, paginatePlugin } from "@/models/plugins/paginate";

export interface IEventType {
    title: string;
}

export type HydratedEventTypeDoc = HydratedDocument<IEventType>;
export interface EventTypeModelType extends Model<IEventType, PaginateQueryHelper<IEventType>>, Filterable { }

export const EventTypeSchema = new Schema<
    IEventType,
    EventTypeModelType,
    object,
    PaginateQueryHelper<IEventType>
>(
    {
        title: String,
    },
    {
        collation: { locale: 'en', strength: 2 },
        statics: {
            getFilterableFields(): FilterableField[] {
                return [{ field: "title", options: "i" }];
            }
        }
    }
);

EventTypeSchema.set("toJSON", {
    virtuals: false,
    getters: true,
    versionKey: false
});

EventTypeSchema.plugin(paginatePlugin<IEventType>);

export const EventType = mongoose.model<IEventType, EventTypeModelType>(
    "EventType",
    EventTypeSchema
);
