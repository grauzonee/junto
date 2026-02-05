import { Types } from "mongoose"
import { createFakeRSVP } from "../../tests/generators/rsvp"
import { getOneUser } from "../../tests/getters"
import { getMockedRequest } from "../utils"
import { RSVP } from "@/models/rsvp/RSVP"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils"
import { create, getForEvent, update } from "@/services/RSVPService"

describe("create() method SUCCESS", () => {
    it("Should call RSVP.create method", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        const spy = jest.spyOn(RSVP, 'create').mockResolvedValue(mockRSVP as any);
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
        spy.mockRestore();
    })
})
describe("create() method FAIL", () => {
    it("Should rethrow error", async () => {
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
        spy.mockRestore();
    })
});

describe("update() method SUCCESS", () => {
    it("Should call RSVP.setStatus and save methods", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        if (!mockRSVP._id) {
            throw new Error("Mock RSVP must have an _id");
        }
        const setStatusSpy = jest.spyOn(mockRSVP, "setStatus");
        const saveSpy = jest.spyOn(mockRSVP, "save").mockResolvedValue(mockRSVP as any);

        const populateMock = jest.fn().mockReturnValue(mockRSVP);

        jest.spyOn(RSVP, "findOne").mockReturnValue({
            populate: populateMock,
        } as any);
        const body = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, { id: mockRSVP._id.toString() }, { user })

        await update(body, mockRSVP._id.toString(), user._id.toString())
        expect(RSVP.findOne).toHaveBeenCalledTimes(1);
        expect(setStatusSpy).toHaveBeenCalledTimes(1);
        expect(setStatusSpy).toHaveBeenCalledWith(body.status);
        expect(saveSpy).toHaveBeenCalledTimes(1);
    })
});

describe("getForEvent() method SUCCESS", () => {
    it("Should call RSVP.find with correct parameters", async () => {
        const eventId = new Types.ObjectId().toString();
        const status = STATUS_CONFIRMED;
        const populateMock = jest.fn().mockReturnValue([]);
        const findSpy = jest.spyOn(RSVP, "find").mockReturnValue({
            populate: populateMock,
        } as any);

        await getForEvent(eventId, status);
        expect(RSVP.find).toHaveBeenCalledTimes(1);
        expect(RSVP.find).toHaveBeenCalledWith({ event: eventId, status: status });
        expect(populateMock).toHaveBeenCalledWith('user');

        findSpy.mockRestore();
    });
    it("Should return array of RSVPs", async () => {
        const mockRSVPs = [await createFakeRSVP({}), await createFakeRSVP({})];
        const findSpy = jest.spyOn(RSVP, "find").mockReturnValue({
            populate: jest.fn().mockReturnValue(mockRSVPs),
        } as any);

        const result = await getForEvent(new Types.ObjectId().toString(), STATUS_CONFIRMED);
        expect(result).toBe(mockRSVPs);

        findSpy.mockRestore();
    });
});