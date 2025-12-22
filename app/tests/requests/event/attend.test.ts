import { getMockedRequest, getMockedResponse } from "../../utils"
import { Event } from "@/models/Event";
import { Response, Request } from "express";
import { insert } from "@/services/RSVPService"
import { createFakeRSVP } from "../../generators/rsvp";
import { attend } from "@/requests/event/attend";
import { RSVP, STATUS_CONFIRMED } from "@/models/RSVP";
import { Types, Error } from "mongoose";
import { parseMongooseValidationError } from "@/helpers/requestHelper";
import messages from "@/constants/errorMessages"
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper";
jest.mock("@/services/RSVPService")
jest.mock("@/helpers/requestHelper")

const user = {
    _id: new Types.ObjectId()
}
let res: Partial<Response>;

const mockRSVP = {
    ...createFakeRSVP(), toJSON: jest.fn().mockReturnThis()
};
beforeEach(() => {
    jest.resetAllMocks();
    (insert as jest.Mock).mockResolvedValue(mockRSVP)
    res = getMockedResponse();
})
describe("attend() SUCCESS", () => {
    it("Should call isUserAttendingEvent(), insert(), setSuccessResponse() method on correct input data", async () => {
        const spy = jest.spyOn(RSVP, "isUserAttendingEvent").mockResolvedValue(null);
        const event = await Event.findOne({ active: true });
        const req = await getRequest();
        await attend(req as Request, res as Response);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(user._id, req.body.eventId);
        expect(insert).toHaveBeenCalledTimes(1)
        expect(insert).toHaveBeenCalledWith(req)
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, mockRSVP.toJSON(), 201);
    })
})

describe("attend() FAIL", () => {
    it("Should call isUserAttendingEvent(), setErrorResponse() method on incorrect input data", async () => {
        const spy = jest.spyOn(RSVP, "isUserAttendingEvent").mockResolvedValue(new RSVP());
        const req = await getRequest();
        await attend(req as Request, res as Response);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(user._id, req.body.eventId);
        expect(insert).toHaveBeenCalledTimes(0)
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 400, messages.response.DUPLICATE_ATTEND);
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
        (insert as jest.Mock).mockRejectedValue(validationError)
        const req = await getRequest();
        await attend(req as Request, res as Response)
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 400, fieldErrors)

    })
    it("Should return 500 on default error", async () => {
        (insert as jest.Mock).mockRejectedValue(new Error("error"))
        const req = await getRequest();
        await attend(req as Request, res as Response)
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 500, [],
            [messages.response.SERVER_ERROR("attending event")]
        )
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