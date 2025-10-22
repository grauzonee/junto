import { HydratedDocument, QueryWithHelpers } from "mongoose";

export interface PaginateQueryHelpers<T> {
    paginate(offset?: number, limit?: number): QueryWithHelpers<HydratedDocument<T>[], HydratedDocument<T>, PaginateQueryHelpers<T>>;
}

export function paginate<T>(
    this: QueryWithHelpers<
        HydratedDocument<T>[],
        HydratedDocument<T>,
        PaginateQueryHelpers<T>
    >,
    offset = 0,
    limit = 10
) {
    return this.skip(offset).limit(limit);
}

