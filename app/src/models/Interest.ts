import mongoose, { Schema, Model, HydratedDocument } from "mongoose";
import { type Filterable, type FilterableField } from "@/types/Filter";
import { PaginateQueryHelper, paginatePlugin } from "@/models/plugins/paginate";

export interface IInterest {
    title: string;
}

export type HydratedInterestDoc = HydratedDocument<IInterest>;
export interface InterestModelType extends Model<IInterest, PaginateQueryHelper<IInterest>>, Filterable { }

export const InterestSchema = new Schema<
    IInterest,
    InterestModelType,
    object,
    PaginateQueryHelper<IInterest>
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

InterestSchema.set("toJSON", {
    virtuals: false,
    getters: true,
    versionKey: false
});

InterestSchema.plugin(paginatePlugin<IInterest>);

export const Interest = mongoose.model<IInterest, InterestModelType>(
    "Interest",
    InterestSchema
);
