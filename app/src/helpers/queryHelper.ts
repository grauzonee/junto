/**
 * Mongoose query helpers for pagination.
 * 
 * @packageDocumentation
 */

import { HydratedDocument, QueryWithHelpers } from "mongoose";

/**
 * Interface for pagination query helpers.
 */
export interface PaginateQueryHelpers<T> {
    paginate(offset?: number, limit?: number): QueryWithHelpers<HydratedDocument<T>[], HydratedDocument<T>, PaginateQueryHelpers<T>>;
}

/**
 * Paginates the query results.
 * @param {number} offset 
 * @param {number} limit 
 * @returns {QueryWithHelpers<HydratedDocument<T>[], HydratedDocument<T>, PaginateQueryHelpers<T>>}
 */
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

