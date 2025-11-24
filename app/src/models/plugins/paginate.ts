import { Schema, QueryWithHelpers, HydratedDocument, Model } from "mongoose";

export interface PaginateQueryHelper<RawDocType> {
    paginate(this: QueryWithHelpers<HydratedDocument<RawDocType>[], RawDocType>,
        offset: number | undefined, limit: number | undefined): QueryWithHelpers<HydratedDocument<RawDocType>[], RawDocType>
}

export type SchemaWithPaginateQuery<RawDocType> = Schema<RawDocType, Model<RawDocType>, object, PaginateQueryHelper<RawDocType>>;

export function paginatePlugin<RawDocType>(schema: SchemaWithPaginateQuery<RawDocType>) {
    schema.query.paginate = function(this: QueryWithHelpers<HydratedDocument<RawDocType>[], RawDocType>, offset = 0, limit = 10): QueryWithHelpers<HydratedDocument<RawDocType>[], RawDocType> {
        return this.skip(offset).limit(limit)
    }
}

export const PaginateSchema = new Schema({},
    {
        query: {
            paginate(offset: number | undefined, limit: number | undefined) {
                return this.skip(offset ?? 0).limit(limit ?? 10)
            }
        }
    }
);
