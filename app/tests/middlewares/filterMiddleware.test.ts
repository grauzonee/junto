import { Event } from "@/models/Event"
import { Request, Response, NextFunction } from "express"
import { filterMiddleware } from "@/middlewares/filterMiddleware"
import { type FilterValue } from "@/types/Filter"

let req: Partial<Request> = {
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
    it("should populate STRING request.dbFilter parameter with EQ operator", () => {
        req.query = { 'author_eq': "123" }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{ prefix: 'eq', value: '123', field: 'author' }])
    })
    it("should populate STRING request.dbFilter parameter with MAX operator", () => {
        req.query = { 'author_max': "123" }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{ prefix: 'max', value: '123', field: 'author' }])
    })
    it("should populate ARRAY request.dbFilter parameter", () => {
        req.query = { 'author_in': "[34,123]" }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{ prefix: 'in', value: ['34', '123'], field: 'author' }])
    })
    it("should populate DATE request.dbFilter parameter", () => {
        const inputDate = "2026-09-21";
        jest.spyOn(Event, "getFilterableFields").mockReturnValue([{ field: 'date', preprocess: (value: FilterValue) => new Date(value as string) }])
        req.query = { 'date_before': inputDate }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{ prefix: 'before', value: new Date(inputDate), field: 'date' }])
    })
    it("should populate OPTIONS request.dbFilter parameter", () => {
        const inputTopic = "meet";
        jest.spyOn(Event, "getFilterableFields").mockReturnValue([{ field: 'topics', options: 'i' }])
        req.query = { 'topics_contains': inputTopic }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.dbFilter).toEqual([{ prefix: 'contains', value: inputTopic, field: 'topics', options: 'i' }])
    })
})

describe("FilterMiddleware tests FAIL", () => {
    it("should NOT populate request.dbFilter parameter with invalid operator", () => {
        req.query = { 'author_eqv': "123" }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        console.log(req.dbFilter)
        expect(next).toHaveBeenCalledTimes(0)
        expect(req.dbFilter).toBe(undefined)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid filter name author_eqv, no such operator" })
    })
    it("should NOT populate request.dbFilter parameter with invalid field", () => {
        req.query = { 'authord_eq': "123" }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(0)
        expect(req.dbFilter).toBe(undefined)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid filter name authord_eq, this field is not filterable" })
    })
    it("should NOT populate request.dbFilter parameter if filterValue is array for a not array prefix", () => {
        req.query = { 'author_eq': "[123, 45]" }
        const middleware = filterMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(0)
        expect(req.dbFilter).toBe(undefined)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid filter value [123, 45]" })
    })
})
