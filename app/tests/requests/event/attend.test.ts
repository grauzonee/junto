import { getMockedRequest, getMockedResponse } from "../../utils"
import { Event } from "@/models/event/Event";
import { Response, Request, NextFunction } from "express";
import { create } from "@/services/RSVPService"
import { createFakeRSVP } from "../../generators/rsvp";
import { createUser } from "@tests/generators/user";
import { attend } from "@/requests/event/attend";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { Error } from "mongoose";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { CreateRSVPSchema } from "@/schemas/http/RSVP";
import { CreateRSVPInput } from "@/types/services/RSVPService";
jest.mock("@/services/RSVPService")
jest.mock("@/helpers/requestHelper")
jest.mock("@/schemas/http/RSVP");

let user: Awaited<ReturnType<typeof createUser>>;
let res: Partial<Response>;
const next = jest.fn() as NextFunction;
let rsvp: Awaited<ReturnType<typeof createFakeRSVP>>;
type MockRSVP = Awaited<ReturnType<typeof createFakeRSVP>> & { toJSON(): unknown };
let mockRSVP: MockRSVP;
let mockRSVPData: CreateRSVPInput;
beforeAll(async () => {
    user = await createUser({}, true);
    rsvp = await createFakeRSVP();
    mockRSVPData = {
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
        const req = await getRequest();
        await attend(req as Request, res as Response, next);
        expect(create).toHaveBeenCalledTimes(1)
        expect(create).toHaveBeenCalledWith(mockRSVPData, user._id.toString())
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
