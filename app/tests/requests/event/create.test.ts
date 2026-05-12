import { create } from "@/requests/event/create"
import { getMockedRequest, getMockedResponse, MockedJsonDocument, withToJSON } from "../../utils"
import mongoose from "mongoose"
import { NextFunction } from "express"
import { create as createEvent } from "@/services/eventService"
import { createFakeEvent, type FakeEvent } from "../../generators/event"
import { setSuccessResponse } from "@/helpers/requestHelper"
import { Category } from "@/models/category/Category"
import { EventType } from "@/models/EventType"
import { CreateEventSchema } from "@/schemas/http/Event";
import { CreateEventInput } from "@/types/services/eventService"
import { Event } from "@/models/event/Event";
jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")
jest.mock("@/schemas/http/Event");

let res = getMockedResponse();
type CreatedEvent = Awaited<ReturnType<typeof createEvent>>;
let mockEvent: MockedJsonDocument<CreatedEvent>;
let newEvent: FakeEvent;
const next = jest.fn() as NextFunction;
let categoriesIds: string[];
let eventTypeId: string;

beforeAll(async () => {
    const savedEvent = await createFakeEvent({}, true);
    const event = await Event.findById(savedEvent._id).orFail();
    mockEvent = withToJSON(event);
    const categories = await Category.find().limit(2);
    const eventType = await EventType.findOne();
    if (!categories || !eventType) {
        throw new Error("No categories or event type in MongoMemory server, check your seeders!");
    }
    categoriesIds = categories.map(i => i._id.toString());
    eventTypeId = eventType._id.toString();
    newEvent = await createFakeEvent({ type: eventTypeId, categories: categoriesIds });
})

beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(createEvent).mockResolvedValue(mockEvent);
    jest.mocked(CreateEventSchema.parse).mockReturnValue(newEvent as CreateEventInput);
    res = getMockedResponse();

})
describe("create() SUCCESS", () => {
    it("Should call createEvent function", async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest({ ...newEvent }, {}, { user: { id: userId } });
        await create(req, res, next)
        expect(createEvent).toHaveBeenCalledTimes(1)
        expect(createEvent).toHaveBeenCalledWith(newEvent, userId)
    })
    it("Should call setSuccessResponse function", async () => {
        const req = getMockedRequest({ ...newEvent }, {}, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await create(req, res, next)
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
        await create(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(validationError)

    })
    it("Should return 500 on default error", async () => {

        const error = new Error("Create event failed");
        (createEvent as jest.Mock).mockRejectedValue(error)
        const req = getMockedRequest({ ...newEvent }, {}, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await create(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(error)
    })
})
