import { Types } from "mongoose"
import { Request } from "express"
import { createFakeRSVP } from "../../tests/generators/rsvp"
import { getOneUser } from "../../tests/getters"
import { getMockedRequest } from "../utils"
import { RSVP, STATUS_CONFIRMED } from "@/models/RSVP"
import { insert } from "@/services/RSVPService"


describe("insert() method SUCCESS", () => {
    it("Should call RSVP.create method", async () => {
        const mockRSVP = createFakeRSVP();
        jest.spyOn(RSVP, 'create').mockResolvedValue(mockRSVP as any);
        const body = {
            eventId: new Types.ObjectId(),
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, {}, { user })
        await insert(req as Request)
        expect(RSVP.create).toHaveBeenCalledTimes(1);
        expect(RSVP.create).toHaveBeenCalledWith({ event: body.eventId, status: body.status, additionalGuests: body.additionalGuests, user: user._id });
    })
})
describe("insert() method FAIL", () => {
    it("Should rethrow error", async () => {
        const mockRSVP = createFakeRSVP();
        const spy = jest.spyOn(RSVP, "create").mockRejectedValue(new Error("Mock error"));
        const body = {
            eventId: new Types.ObjectId(),
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, {}, { user })
        try {
            await insert(req as Request)
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe("Mock error");
        }
    })
})