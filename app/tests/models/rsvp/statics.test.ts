import { RSVP } from "@/models/rsvp/RSVP";
import { createFakeRSVP } from "../../generators/rsvp";
import { Types } from "mongoose";

describe("isUserAttendingEvent() static method", () => {
    it("Should return RSVP if user is attending the event", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        if (!mockRSVP._id) {
            throw new Error("Mock RSVP must have an _id");
        }
        const foundRSVP = await RSVP.isUserAttendingEvent(mockRSVP.user.toString(), mockRSVP.event.toString());
        expect(foundRSVP).not.toBeNull();
        expect(foundRSVP?._id.toString()).toBe(mockRSVP._id.toString());
    });

    it("Should return null if user is not attending the event", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        const anotherUserId = new Types.ObjectId().toString();
        const foundRSVP = await RSVP.isUserAttendingEvent(anotherUserId, mockRSVP.event.toString());
        expect(foundRSVP).toBeNull();
    });

    afterEach(async () => {
        await RSVP.deleteMany({});
    });
});