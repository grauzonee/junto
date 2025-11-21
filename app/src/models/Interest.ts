import mongoose, { Schema, Model, Document } from "mongoose";
import { type PaginateQueryHelpers, paginate } from "@/helpers/queryHelper";
import { type Filterable, type FilterableField } from "@/types/Filter";

export interface IInterest {
    title: string;
}

export type InterestDocument = IInterest & Document;

interface InterestModel
    extends Model<InterestDocument, PaginateQueryHelpers<InterestDocument>>,
    Filterable { }

export const InterestSchema = new Schema<
    InterestDocument,
    InterestModel,
    object,
    PaginateQueryHelpers<InterestDocument>
>({
    title: String,
},
    {
        collation: { locale: 'en', strength: 2 }
    });

InterestSchema.set("toJSON", {
    transform: (_doc, ret: Partial<InterestDocument>) => {
        ret.id = ret._id;
        delete ret._id;
        if ("__v" in ret) {
            delete ret.__v;
        }
    },
});

InterestSchema.statics.getFilterableFields = function(): FilterableField[] {
    return [{ field: "title", options: "i" }];
};

InterestSchema.query.paginate = paginate;

export const Interest = mongoose.model<InterestDocument, InterestModel>(
    "Interest",
    InterestSchema
);
