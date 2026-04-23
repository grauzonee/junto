import { Event } from "@/models/event/Event"
import { NextFunction } from "express"
import { filterMiddleware } from "@/middlewares/filterMiddleware"
import { type FilterValue } from "@/types/Filter"
import { getMockedRequest, getMockedResponse } from "../utils"

const req = getMockedRequest({}, {}, {
    query: {} as Record<string, string | string[]>,
    dbFilter: undefined
})

type QueryParams = Record<string, string | string[]>
interface SuccessfulFilterCase {
    name: string
    query: QueryParams
    expectedFilter: unknown[]
}
interface FailedFilterCase {
    name: string
    query: QueryParams
    message: string
}

let res = getMockedResponse()
let next: NextFunction


beforeAll(() => {
    res = getMockedResponse()
    next = jest.fn()

})
beforeEach(() => {
    jest.spyOn(Event, "getFilterableFields").mockReturnValue([{ field: 'author' }])
    req.dbFilter = undefined
    jest.clearAllMocks();
})

describe("FilterMiddleware tests SUCCESS", () => {
    it.each<SuccessfulFilterCase>([
        {
            name: "STRING request.dbFilter parameter with EQ operator",
            query: { 'author_eq': "123" },
            expectedFilter: [{ prefix: 'eq', value: '123', field: 'author' }]
        },
        {
            name: "STRING request.dbFilter parameter with MAX operator",
            query: { 'author_max': "123" },
            expectedFilter: [{ prefix: 'max', value: '123', field: 'author' }]
        },
        {
            name: "ARRAY request.dbFilter parameter",
            query: { 'author_in': "[34,123]" },
            expectedFilter: [{ prefix: 'in', value: ['34', '123'], field: 'author' }]
        }
    ])("should populate $name", ({ query, expectedFilter }) => {
        req.query = query
        const middleware = filterMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual(expectedFilter)
    })
    it("should populate DATE request.dbFilter parameter", () => {
        const inputDate = "2026-09-21";
        jest.spyOn(Event, "getFilterableFields").mockReturnValue([{ field: 'date', preprocess: (value: FilterValue) => new Date(value as string) }])
        req.query = { 'date_before': inputDate }
        const middleware = filterMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{ prefix: 'before', value: new Date(inputDate), field: 'date' }])
    })
    it("should populate DATE RANGE request.dbFilter parameter", () => {
        jest.spyOn(Event, "getFilterableFields").mockReturnValue([{
            field: 'date',
            preprocess: (value: FilterValue) => value === "today"
                ? { start: new Date("2026-03-28T00:00:00.000Z"), end: new Date("2026-03-28T23:59:59.999Z") }
                : value
        }])
        req.query = { 'date_eq': "today" }
        const middleware = filterMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{
            prefix: 'eq',
            value: { start: new Date("2026-03-28T00:00:00.000Z"), end: new Date("2026-03-28T23:59:59.999Z") },
            field: 'date'
        }])
    })
    it("should populate OPTIONS request.dbFilter parameter", () => {
        const inputTopic = "meet";
        jest.spyOn(Event, "getFilterableFields").mockReturnValue([{ field: 'topics', options: 'i' }])
        req.query = { 'topics_contains': inputTopic }
        const middleware = filterMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{ prefix: 'contains', value: inputTopic, field: 'topics', options: 'i' }])
    })
    it("should ignore non-filter search query parameters", () => {
        req.query = { search: "community meetup" }
        const middleware = filterMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([])
    })
})

describe("FilterMiddleware tests FAIL", () => {
    it.each<FailedFilterCase>([
        {
            name: "invalid operator",
            query: { 'author_eqv': "123" },
            message: "Invalid filter name author_eqv, no such operator"
        },
        {
            name: "invalid field",
            query: { 'authord_eq': "123" },
            message: "Invalid filter name authord_eq, this field is not filterable"
        },
        {
            name: "array filterValue for a not array prefix",
            query: { 'author_eq': "[123, 45]" },
            message: "Invalid filter value [123, 45]"
        }
    ])("should NOT populate request.dbFilter parameter with $name", ({ query, message }) => {
        req.query = query
        const middleware = filterMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(0)
        expect(req.dbFilter).toBe(undefined)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ success: false, message })
    })
})
