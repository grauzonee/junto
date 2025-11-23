import mongoose, { Schema, Model, Document, Types, SchemaTypes } from "mongoose";
import { type PaginateQueryHelpers, paginate } from "@/helpers/queryHelper";
import { type Filterable, type FilterableField } from "@/types/Filter";

export interface ICategory {
  title: string;
  parent?: Types.ObjectId
}

export type CategoryDocument = ICategory & Document;

interface CategoryModel
  extends Model<CategoryDocument, PaginateQueryHelpers<CategoryDocument>>,
  Filterable { }

export const CategorySchema = new Schema<
  CategoryDocument,
  CategoryModel,
  object,
  PaginateQueryHelpers<CategoryDocument>
>({
  title: String,
  parent: {
    type: SchemaTypes.ObjectId,
    required: false,
    ref: 'Category'

  }
},
  {
    collation: { locale: 'en', strength: 2 }
  },
);

CategorySchema.set("toJSON", {
  transform: (_doc, ret: Partial<CategoryDocument>) => {
    ret.id = ret._id;
    delete ret._id;
    if ("__v" in ret) {
      delete ret.__v;
    }
  },
});

CategorySchema.statics.getFilterableFields = function(): FilterableField[] {
  return [{ field: "title", options: "i" }, { field: "parent" }];
};

CategorySchema.query.paginate = paginate;

export const Category = mongoose.model<CategoryDocument, CategoryModel>(
  "Category",
  CategorySchema
);
