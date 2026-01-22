import { getMockedRequest, getMockedResponse } from "../../utils"
import { Event } from "@/models/Event";
import { Response, Request, NextFunction } from "express";
import { create } from "@/services/RSVPService"
import { createFakeRSVP } from "../../generators/rsvp";
import { attend } from "@/requests/event/attend";
import { RSVP, STATUS_CONFIRMED } from "@/models/RSVP";
import { Types, Error } from "mongoose";
import { parseMongooseValidationError } from "@/helpers/requestHelper";
import messages from "@/constants/errorMessages"
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper";
import { CreateRSVPSchema } from "@/schemas/http/RSVP";
import { CreateRSVPInput } from "@/types/services/RSVPService";
jest.mock("@/services/RSVPService")
jest.mock("@/helpers/requestHelper")
jest.mock("@/schemas/http/RSVP");

const user = {
    _id: new Types.ObjectId()
}
let res: Partial<Response>;
const next = jest.fn() as NextFunction;
const mockRSVP = {
    ...createFakeRSVP(), toJSON: jest.fn().mockReturnThis()
};
const mockRSVPData = {
    user: mockRSVP.user.toString(),
    eventId: mockRSVP.event.toString(),
    status: mockRSVP.status,
    additionalGuests: mockRSVP.additionalGuests
};
beforeEach(() => {
    jest.resetAllMocks();
    (create as jest.Mock).mockResolvedValue(mockRSVP);
    (CreateRSVPSchema.parse as jest.Mock).mockReturnValue(mockRSVPData as CreateRSVPInput);
    res = getMockedResponse();
})
describe("attend() SUCCESS", () => {
    it("Should call isUserAttendingEvent(), create(), setSuccessResponse() method on correct input data", async () => {
        const spy = jest.spyOn(RSVP, "isUserAttendingEvent").mockResolvedValue(null);
        const event = await Event.findOne({ active: true });
        const req = await getRequest();
        await attend(req as Request, res as Response, next);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(user._id, req.body.eventId);
        expect(create).toHaveBeenCalledTimes(1)
        expect(create).toHaveBeenCalledWith(mockRSVPData, user._id)
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, mockRSVP.toJSON(), 201);
    })
})

describe("attend() FAIL", () => {
    it("Should call isUserAttendingEvent(), setErrorResponse() method on incorrect input data", async () => {
        const spy = jest.spyOn(RSVP, "isUserAttendingEvent").mockResolvedValue(new RSVP());
        const req = await getRequest();
        await attend(req as Request, res as Response, next);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(user._id, req.body.eventId);
        expect(create).toHaveBeenCalledTimes(0)
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 400, {}, [messages.response.DUPLICATE_ATTEND]);
    })

    it("Should return 400 on mongoose validation error", async () => {
        const validationError = new Error.ValidationError();

        validationError.addError(
            "status",
            new Error.ValidatorError({
                message: messages.validation.NOT_CORRECT("Rsvp status"),
                path: "status",
                value: "badStatus",
            })
        );
        const fieldErrors = parseMongooseValidationError(validationError);
        (create as jest.Mock).mockRejectedValue(validationError)
        const req = await getRequest();
        await attend(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(validationError)

    })
    it("Should return 500 on default error", async () => {
        (create as jest.Mock).mockRejectedValue(new Error("error"))
        const req = await getRequest();
        await attend(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new Error("error"))
    })
})

async function getRequest() {
    const event = await Event.findOne({ active: true });
    if (!event) {
        throw new Error("No event found, check your seeders");
    }
    const body = {
        eventId: event._id,
        status: STATUS_CONFIRMED
    }
    return getMockedRequest(body, {}, { user });
}