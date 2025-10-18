import { buildMongoQuery } from "@/helpers/queryBuilder"
import type { Filter } from "@/types/Filter"

describe("buildMongoQuery tests SUCCESS", () => {
    it("Should return FilterQuery object", () => {
        const dbFilter: Filter[] = [{ field: "author", prefix: "eq", value: "123" }]
        const query = buildMongoQuery<Event>(dbFilter)
        expect(query).toEqual({
            author: { $eq: "123" }
        })
    })
})
