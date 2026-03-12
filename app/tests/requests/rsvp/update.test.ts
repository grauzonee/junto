import { createFakeRSVP } from "../../generators/rsvp";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { getOneUser } from "../../getters";
import { getMockedRequest } from "../../utils";
import { RSVP } from "@/models/rsvp/RSVP";
import { update } from "@/services/RSVPService";
import { Types } from "mongoose";

describe("update() success", () => {
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

        await update(body, mockRSVP._id.toString(), user._id.toString())

        expect(setStatusSpy).toHaveBeenCalledTimes(1);
        expect(setStatusSpy).toHaveBeenCalledWith(body.status);
        expect(saveSpy).toHaveBeenCalledTimes(1);

        setStatusSpy.mockRestore();
        saveSpy.mockRestore();
    });
    it("Should update additionalGuests if provided", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        if (!mockRSVP._id) {
            throw new Error("Mock RSVP must have an _id");
        }
        const saveSpy = jest.spyOn(mockRSVP, "save").mockResolvedValue(mockRSVP as any);

        const populateMock = jest.fn().mockReturnValue(mockRSVP);

        jest.spyOn(RSVP, "findOne").mockReturnValue({
            populate: populateMock,
        } as any);
        const body = {
            status: STATUS_CONFIRMED,
            additionalGuests: 3
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, { id: mockRSVP._id.toString() }, { user })

        await update(body, mockRSVP._id.toString(), user._id.toString())

        expect(mockRSVP.additionalGuests).toBe(body.additionalGuests);
        expect(saveSpy).toHaveBeenCalledTimes(1);

        saveSpy.mockRestore();
    });

    it("Should not update additionalGuests if not provided", async () => {
        const mockRSVP = await createFakeRSVP({ additionalGuests: 1 }, true);
        if (!mockRSVP._id) {
            throw new Error("Mock RSVP must have an _id");
        }
        const saveSpy = jest.spyOn(mockRSVP, "save").mockResolvedValue(mockRSVP as any);

        const populateMock = jest.fn().mockReturnValue(mockRSVP);

        jest.spyOn(RSVP, "findOne").mockReturnValue({
            populate: populateMock,
        } as any);
        const body = {
            status: STATUS_CONFIRMED,
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, { id: mockRSVP._id.toString() }, { user })

        await update(body, mockRSVP._id.toString(), user._id.toString())

        expect(mockRSVP.additionalGuests).toBe(1);
        expect(saveSpy).toHaveBeenCalledTimes(1);

        saveSpy.mockRestore();
    });

    it("Should throw NotFoundError if RSVP not found", async () => {
        const mockRSVPId = new Types.ObjectId().toString();
        jest.spyOn(RSVP, "findOne").mockReturnValue({
            populate: jest.fn(),
        } as any);

        const body = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        }
        const user = await getOneUser();
        const req = getMockedRequest(body, { id: mockRSVPId }, { user })

        let caughtError: any = null;
        try {
            await update(body, mockRSVPId, user._id.toString());
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).not.toBeNull();
        expect(caughtError.name).toBe("NotFoundError");
    });

    afterEach(async () => {
        await RSVP.deleteMany({});
    })
})