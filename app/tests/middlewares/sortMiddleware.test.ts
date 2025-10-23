import { sortMiddleware } from "@/middlewares/sortMiddleware"
import { Event } from "@/models/Event"
import { Request, Response, NextFunction } from "express"

let req: Partial<Request>
let res: Partial<Response>
let next = jest.fn()

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Event, "getSortableFields").mockReturnValue(['date'])
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    next = jest.fn()
})
describe("SortMiddleware test SUCCESS", () => {
    it("Should populate req object on valid ASC data", () => {
        req = {
            query: {
                sortByAsc: 'date'
            },
            sort: {}
        }

        const middleware = sortMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.sort).toEqual({
            sortByAsc: 'date'
        })
    })
    it("Should populate req object on valid DESC data", () => {
        req = {
            query: {
                sortByDesc: 'date'
            },
            sort: {}
        }

        const middleware = sortMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.sort).toEqual({
            sortByDesc: 'date'
        })
    })
})
describe("SortMiddleware test FAIL", () => {
    it("Should throw an exception if given field is invalid", () => {
        req = {
            query: {
                sortByDesc: 'datea'
            },
            sort: {}
        }

        const middleware = sortMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(0)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ success: false, data: { message: "Field datea is not sortable" } })
        expect(req.sort).toEqual({})
    })
    it("Should throw an exception if both ASC and DESC are given", () => {
        req = {
            query: {
                sortByDesc: 'date',
                sortByAsc: 'date'
            },
            sort: {}
        }

        const middleware = sortMiddleware(Event)
        middleware(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(0)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            success: false, data: {
                fieldErrors: {},
                formErrors: [
                    "You can only specify either sortByAsc or sortByDesc, not both.",
                ],
            }
        })
        expect(req.sort).toEqual({})
    })
})
