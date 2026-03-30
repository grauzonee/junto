import { Types } from "mongoose"
import { createFakeRSVP } from "../../tests/generators/rsvp"
import { getOneUser } from "../../tests/getters"
import { RSVP } from "@/models/rsvp/RSVP"
import { Event } from "@/models/event/Event"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils"
import { create, getForEvent, update } from "@/services/RSVPService"

describe("create() method SUCCESS", () => {
    it("Should call RSVP.create method", async () => {
        const mockRSVP = await createFakeRSVP({});
        const eventDate = new Date();
        const spyFind = jest.spyOn(Event, "findOne").mockResolvedValue({ date: eventDate })
        const spyCreate = jest.spyOn(RSVP, 'create').mockResolvedValue(mockRSVP as never);
        const body = {
            eventId: new Types.ObjectId().toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }
        const user = await getOneUser();
        await create(body, user._id.toString())
        expect(spyFind).toHaveBeenCalledTimes(1);
        expect(spyFind).toHaveBeenCalledWith({ _id: body.eventId, active: true });
        expect(spyCreate).toHaveBeenCalledTimes(1);
        expect(spyCreate).toHaveBeenCalledWith({ event: body.eventId, status: body.status, additionalGuests: body.additionalGuests, user: user._id.toString(), eventDate });
        spyCreate.mockRestore();
        spyFind.mockRestore();
    })
})
describe("create() method FAIL", () => {
    it("Should rethrow error", async () => {
        const eventDate = new Date();
        const spyFind = jest.spyOn(Event, "findOne").mockResolvedValue({ date: eventDate })
        const spyCreate = jest.spyOn(RSVP, "create").mockRejectedValue(new Error("Mock error"));
        const body = {
            eventId: new Types.ObjectId().toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }
        const user = await getOneUser();
        try {
            await create(body, user._id.toString())
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe("Mock error");
        }
        spyCreate.mockRestore();
        spyFind.mockRestore();
    })
});

describe("update() method SUCCESS", () => {
    it("Should call RSVP.setStatus and save methods", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        if (!mockRSVP._id) {
            throw new Error("Mock RSVP must have an _id");
        }
        const setStatusSpy = jest.spyOn(mockRSVP, "setStatus");
        const saveSpy = jest.spyOn(mockRSVP, "save").mockResolvedValue(mockRSVP as never);

        const populateMock = jest.fn().mockReturnValue(mockRSVP);

        jest.spyOn(RSVP, "findOne").mockReturnValue({
            populate: populateMock,
        } as never);
        const body = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        }
        const user = await getOneUser();

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
        const eventFindSpy = jest.spyOn(Event, "findOne").mockResolvedValue({ _id: eventId } as never);
        const populateMock = jest.fn().mockReturnValue([]);
        const findSpy = jest.spyOn(RSVP, "find").mockReturnValue({
            populate: populateMock,
        } as never);

        await getForEvent(eventId, status);
        expect(Event.findOne).toHaveBeenCalledWith({ _id: eventId, active: true });
        expect(RSVP.find).toHaveBeenCalledTimes(1);
        expect(RSVP.find).toHaveBeenCalledWith({ event: eventId, status: status });
        expect(populateMock).toHaveBeenCalledWith('user');

        findSpy.mockRestore();
        eventFindSpy.mockRestore();
    });
    it("Should return array of RSVPs", async () => {
        const mockRSVPs = [await createFakeRSVP({}), await createFakeRSVP({})];
        const eventFindSpy = jest.spyOn(Event, "findOne").mockResolvedValue({ _id: new Types.ObjectId() } as never);
        const findSpy = jest.spyOn(RSVP, "find").mockReturnValue({
            populate: jest.fn().mockReturnValue(mockRSVPs),
        } as never);

        const result = await getForEvent(new Types.ObjectId().toString(), STATUS_CONFIRMED);
        expect(result).toBe(mockRSVPs);

        findSpy.mockRestore();
        eventFindSpy.mockRestore();
    });
});
