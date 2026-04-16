import { Event } from "@/models/event/Event"
import { Request, Response, NextFunction } from "express"
import { filterMiddleware } from "@/middlewares/filterMiddleware"
import { type FilterValue } from "@/types/Filter"

const req: Partial<Request> = {
    query: {
        "author_eq": "123"
    },
    dbFilter: undefined
}

let res: Partial<Response>
let next: NextFunction


beforeAll(() => {
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    next = jest.fn()

})
beforeEach(() => {
    jest.spyOn(Event, "getFilterableFields").mockReturnValue([{ field: 'author' }])
    req.dbFilter = undefined
    jest.clearAllMocks();
})

describe("FilterMiddleware tests SUCCESS", () => {
    it.each([
        {
            name: "STRING request.dbFilter parameter with EQ operator",
            filterableFields: [{ field: 'author' }],
            query: { 'author_eq': "123" },
            expected: [{ prefix: 'eq', value: '123', field: 'author' }]
        },
        {
            name: "STRING request.dbFilter parameter with MAX operator",
            filterableFields: [{ field: 'author' }],
            query: { 'author_max': "123" },
            expected: [{ prefix: 'max', value: '123', field: 'author' }]
        },
        {
            name: "ARRAY request.dbFilter parameter",
            filterableFields: [{ field: 'author' }],
            query: { 'author_in': "[34,123]" },
            expected: [{ prefix: 'in', value: ['34', '123'], field: 'author' }]
        },
        {
            name: "DATE request.dbFilter parameter",
            filterableFields: [{ field: 'date', preprocess: (value: FilterValue) => new Date(value as string) }],
            query: { 'date_before': "2026-09-21" },
            expected: [{ prefix: 'before', value: new Date("2026-09-21"), field: 'date' }]
        },
        {
            name: "DATE RANGE request.dbFilter parameter",
            filterableFields: [{
                field: 'date',
                preprocess: (value: FilterValue) => value === "today"
                    ? { start: new Date("2026-03-28T00:00:00.000Z"), end: new Date("2026-03-28T23:59:59.999Z") }
                    : value
            }],
            query: { 'date_eq': "today" },
            expected: [{
                prefix: 'eq',
                value: { start: new Date("2026-03-28T00:00:00.000Z"), end: new Date("2026-03-28T23:59:59.999Z") },
                field: 'date'
            }]
        },
        {
            name: "OPTIONS request.dbFilter parameter",
            filterableFields: [{ field: 'topics', options: 'i' }],
            query: { 'topics_contains': "meet" },
            expected: [{ prefix: 'contains', value: "meet", field: 'topics', options: 'i' }]
        },
    ])("should populate $name", ({ filterableFields, query, expected }) => {
        jest.spyOn(Event, "getFilterableFields").mockReturnValue(filterableFields)
        req.query = query
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual(expected)
    })
    it("should ignore non-filter search query parameters", () => {
        req.query = { search: "community meetup" }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([])
    })
})

describe("FilterMiddleware tests FAIL", () => {
    it.each([
        {
            name: "invalid operator",
            query: { 'author_eqv': "123" },
            expectedJson: { success: false, message: "Invalid filter name author_eqv, no such operator" }
        },
        {
            name: "invalid field",
            query: { 'authord_eq': "123" },
            expectedJson: { success: false, message: "Invalid filter name authord_eq, this field is not filterable" }
        },
        {
            name: "array value for a non-array prefix",
            query: { 'author_eq': "[123, 45]" },
            expectedJson: { success: false, message: "Invalid filter value [123, 45]" }
        },
    ])("should NOT populate request.dbFilter parameter with $name", ({ query, expectedJson }) => {
        req.query = query
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(0)
        expect(req.dbFilter).toBe(undefined)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(expectedJson)
    })
})
