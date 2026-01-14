import { Types } from "mongoose"
import { Request } from "express"
import { createFakeRSVP } from "../../tests/generators/rsvp"
import { getOneUser } from "../../tests/getters"
import { getMockedRequest } from "../utils"
import { RSVP, STATUS_CONFIRMED } from "@/models/RSVP"
import { create } from "@/services/RSVPService"


describe("create() method SUCCESS", () => {
    it("Should call RSVP.create method", async () => {
        const mockRSVP = createFakeRSVP();
        jest.spyOn(RSVP, 'create').mockResolvedValue(mockRSVP as any);
        const body = {
            eventId: new Types.ObjectId().toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, {}, { user })
        await create(body, user._id.toString())
        expect(RSVP.create).toHaveBeenCalledTimes(1);
        expect(RSVP.create).toHaveBeenCalledWith({ event: body.eventId, status: body.status, additionalGuests: body.additionalGuests, user: user._id.toString() });
    })
})
describe("create() method FAIL", () => {
    it("Should rethrow error", async () => {
        const mockRSVP = createFakeRSVP();
        const spy = jest.spyOn(RSVP, "create").mockRejectedValue(new Error("Mock error"));
        const body = {
            eventId: new Types.ObjectId().toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, {}, { user })
        try {
            await create(body, user._id.toString())
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe("Mock error");
        }
    })
})