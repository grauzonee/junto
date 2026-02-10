import { getMockedRequest, getMockedResponse } from "../../utils"
import { Event } from "@/models/event/Event";
import { Response, Request, NextFunction } from "express";
import { create } from "@/services/RSVPService"
import { createFakeRSVP } from "../../generators/rsvp";
import { attend } from "@/requests/event/attend";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { Types, Error } from "mongoose";
import { setSuccessResponse } from "@/helpers/requestHelper";
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
let rsvp: Awaited<ReturnType<typeof createFakeRSVP>>;
let mockRSVP: Awaited<ReturnType<typeof createFakeRSVP>> & { toJSON(): any };
let mockRSVPData = {};
beforeAll(async () => {
    rsvp = await createFakeRSVP();
    mockRSVPData = {
        user: rsvp.user.toString(),
        eventId: rsvp.event.toString(),
        status: rsvp.status,
        additionalGuests: rsvp.additionalGuests
    };
    mockRSVP = {
        ...rsvp, toJSON: jest.fn().mockReturnThis()
    };
    (create as jest.Mock).mockResolvedValue(mockRSVP);
})

beforeEach(() => {
    jest.clearAllMocks();
    res = getMockedResponse();
})
describe("attend() SUCCESS", () => {
    beforeEach(() => {
        (CreateRSVPSchema.parse as jest.Mock).mockReturnValue(mockRSVPData as CreateRSVPInput);
    });
    it("Should call, create(), setSuccessResponse() method on correct input data", async () => {
        const event = await Event.findOne({ active: true });
        const req = await getRequest();
        await attend(req as Request, res as Response, next);
        expect(create).toHaveBeenCalledTimes(1)
        expect(create).toHaveBeenCalledWith(mockRSVPData, user._id)
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, mockRSVP.toJSON(), 201);
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