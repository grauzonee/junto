import * as z from "zod";
import messages from "@/constants/errorMessages";

export const SEARCH_QUERY_MAX_LENGTH = 100;

function normalizeSearchValue(value: unknown) {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== "string") {
        return value;
    }

    const normalized = value.trim().replace(/\s+/g, " ");
    return normalized === "" ? undefined : normalized;
}

export const SearchQuerySchema = z.looseObject({
    search: z.preprocess(
        normalizeSearchValue,
        z.string()
            .max(SEARCH_QUERY_MAX_LENGTH, { message: messages.http.MAX_LENGTH("Search", SEARCH_QUERY_MAX_LENGTH) })
            .optional()
    )
});
