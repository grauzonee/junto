import { buildFilterQuery, buildGeosearchQuery, buildSortQuery } from "@/helpers/queryBuilder"
import { CoordinatesInput } from "@/schemas/http/Event"
import type { Filter } from "@/types/Filter"
import { SortInput } from "@/types/Sort"

describe("buildFilterQuery() tests", () => {
    it("Should handle all the operators", () => {
        const filterDatas = [
            {field: 'author', prefix: 'eq', value: '123', expectedPrefix: "$eq"},
            {field: 'fee', prefix: 'min', value: 100, expectedPrefix: "$gte"},
            {field: 'date', prefix: 'before', value: Date.now() / 1000, expectedPrefix: "$lte"},
            {field: 'fee', prefix: 'max', value: 100, expectedPrefix: "$lte"},
            {field: 'date', prefix: 'after', value: Date.now() / 1000, expectedPrefix: "$gte"},
            {field: 'interests', prefix: 'in', value: ['drawing', 'walking'], expectedPrefix: "$in"},
            {field: 'interests', prefix: 'nin', value: ['drawing', 'walking'], expectedPrefix: "$nin"},
        ];  
        filterDatas.forEach(filterData => {
            const {field, prefix, value, expectedPrefix} = filterData;
            const query = buildFilterQuery<Event>([{field, prefix, value}])
            expect(query).toEqual({
                [field]: { [expectedPrefix]: value }
            })
        })
    })

    it("Should handle operators with options", () => {
        const dbFilter: Filter[] = [{ prefix: 'contains', value: "meet", field: 'topics', options: 'i' }]
        const query = buildFilterQuery<Event>(dbFilter)
        expect(query).toEqual({
            topics: { $regex: "meet", $options: 'i' }
        })
    })
})
describe("buildGeosearchQuery() tests", () => {
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
describe("buildSortQuery() tests", () => {
    it("Should return -1 if sortByAsc", () => {
        const field = "interests";
        const sortInput: SortInput = {
            sortByAsc: field
        }
        const result = buildSortQuery(sortInput);
        expect(result).toEqual({
            [field]: -1
        })
    })
    it("Should return 1 if sortByDesc", () => {
        const field = "interests";
        const sortInput: SortInput = {
            sortByDesc: field
        }
        const result = buildSortQuery(sortInput);
        expect(result).toEqual({
            [field]: 1
        })
    })
})
