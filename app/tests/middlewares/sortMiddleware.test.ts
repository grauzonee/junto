import { sortMiddleware } from "@/middlewares/sortMiddleware"
import { Event } from "@/models/event/Event"
import { getMockedRequest, getMockedResponse } from "../utils"

const req = getMockedRequest({}, {}, {
    query: {} as Record<string, string>,
    sort: {} as Record<string, string>
})
let res = getMockedResponse()
let next = jest.fn()

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Event, "getSortableFields").mockReturnValue(['date'])
    res = getMockedResponse()
    next = jest.fn()
})
describe("SortMiddleware test SUCCESS", () => {
    it("Should populate req object on valid ASC data", () => {
        req.query = {
            sortByAsc: 'date'
        }
        req.sort = {}

        const middleware = sortMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.sort).toEqual({
            sortByAsc: 'date'
        })
    })
    it("Should populate req object on valid DESC data", () => {
        req.query = {
            sortByDesc: 'date'
        }
        req.sort = {}

        const middleware = sortMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.sort).toEqual({
            sortByDesc: 'date'
        })
    })
})
describe("SortMiddleware test FAIL", () => {
    it("Should throw an exception if given field is invalid", () => {
        req.query = {
            sortByDesc: 'datea'
        }
        req.sort = {}

        const middleware = sortMiddleware(Event)
        middleware(req, res, next)
        expect(next).toHaveBeenCalledTimes(0)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ success: false, data: { message: "Field datea is not sortable" } })
        expect(req.sort).toEqual({})
    })
    it("Should throw an exception if both ASC and DESC are given", () => {
        req.query = {
            sortByDesc: 'date',
            sortByAsc: 'date'
        }
        req.sort = {}

        const middleware = sortMiddleware(Event)
        middleware(req, res, next)
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
