import { create } from "@/requests/event/create"
import { getMockedRequest, getMockedResponse } from "../../utils"
import { parseMongooseValidationError } from "@/helpers/requestHelper"
import mongoose, { Types } from "mongoose"
import { NextFunction, Request, Response } from "express"
import { create as createEvent } from "@/services/eventService"
import { createFakeEvent } from "../../generators/event"
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper"
import { Category } from "@/models/Category"
import { EventType } from "@/models/EventType"
import { CreateEventSchema } from "@/schemas/http/Event";
import { CreateEventInput } from "@/types/services/eventService"
jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")
jest.mock("@/schemas/http/Event");

let res: Partial<Response>;
const mockEvent = { ...createFakeEvent(), toJSON: jest.fn().mockReturnThis() }
let newEvent: ReturnType<typeof createFakeEvent>;
const next = jest.fn() as NextFunction;
let categoriesIds: string[];
let eventTypeId: string;

beforeAll(async () => {
    const categories = await Category.find().limit(2);
    const eventType = await EventType.findOne();
    if (!categories || !eventType) {
        throw new Error("No categories or event type in MongoMemory server, check your seeders!");
    }
    categoriesIds = categories.map(i => i._id.toString());
    eventTypeId = eventType._id.toString();
    newEvent = createFakeEvent({ type: eventTypeId, categories: categoriesIds });
})

beforeEach(() => {
    jest.resetAllMocks();
    (createEvent as jest.Mock).mockResolvedValue(mockEvent);
    (CreateEventSchema.parse as jest.Mock).mockReturnValue(newEvent as CreateEventInput);
    res = getMockedResponse();

})
describe("create() SUCCESS", () => {
    it("Should call createEvent function", async () => {
        const req = getMockedRequest({ ...newEvent }, {}, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await create(req as Request, res as Response, next)
        expect(createEvent).toHaveBeenCalledTimes(1)
        expect(createEvent).toHaveBeenCalledWith(newEvent, req.user.id)
    })
    it("Should call setSuccessResponse function", async () => {
        const req = getMockedRequest({ ...newEvent }, {}, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await create(req as Request, res as Response, next)
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, mockEvent.toJSON(), 201)

    })
})
describe("create() FAIL", () => {

    it("Should return 400 on mongoose validation error", async () => {
        const validationError = new mongoose.Error.ValidationError();

        validationError.addError(
            "interests",
            new mongoose.Error.ValidatorError({
                message: "Interests field is not invalid",
                path: "interests",
                value: "badInterest",
            })
        );
        (createEvent as jest.Mock).mockRejectedValue(validationError)
        const req = getMockedRequest({ ...newEvent }, {}, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await create(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(validationError)

    })
    it("Should return 500 on default error", async () => {

        (createEvent as jest.Mock).mockRejectedValue(new Error())
        const req = getMockedRequest({ ...newEvent }, {}, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await create(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new Error())
    })
})
