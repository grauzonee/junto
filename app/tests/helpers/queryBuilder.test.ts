import { buildMongoQuery, buildGeosearchQuery } from "@/helpers/queryBuilder"
import { CoordinatesInput } from "@/schemas/http/Event"
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
describe("buildGeosearchQuery tests SUCCESS", () => {
    it("Should return FilterQuery object", () => {
        const value: CoordinatesInput = { lat: 61.5643, lng: 32.6543, radius: 1 }
        const query = buildGeosearchQuery(value)
        expect(query).toEqual({
            location:
            {
                $near:
                {
                    $geometry:
                        { type: "Point", coordinates: [value.lat, value.lng] },
                    $minDistance: 0,
                    $maxDistance: value.radius
                }
            }
        })
    })
})
