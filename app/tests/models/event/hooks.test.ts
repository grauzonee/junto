import * as rsvpMethods from "@/services/RSVPService";
import { Types } from "mongoose";
import { preSaveHook, postSaveHook } from "@/models/event/hooks";

describe("preSaveHook", () => {
    it("should set wasNew to true if the document is new", () => {
        const doc: any = {
            isNew: true,
            $locals: {}
        };
        preSaveHook.call(doc, () => { });
        expect(doc.$locals.wasNew).toBe(true);
    });

    it("should set wasNew to false if the document is not new", () => {
        const doc: any = {
            isNew: false,
            $locals: {}
        };
        preSaveHook.call(doc, () => { });
        expect(doc.$locals.wasNew).toBe(false);
    });
});

describe("postSaveHook", () => {
    it("should call create with correct parameters if the document was new", async () => {
        const spy = jest.spyOn(rsvpMethods, "create").mockResolvedValue({} as any);
        const eventId = new Types.ObjectId();
        const authorId = new Types.ObjectId();
        const doc: any = {
            _id: eventId,
            author: authorId,
            $locals: {
                wasNew: true
            }
        };
        await postSaveHook.call(doc, doc);
        expect(spy).toHaveBeenCalledWith({ eventId: eventId.toString(), status: "confirmed" }, authorId.toString());
        spy.mockRestore();
    });

    it("should not call create if the document was not new", async () => {
        const spy = jest.spyOn(rsvpMethods, "create").mockResolvedValue({} as any);
        const doc: any = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            $locals: {
                wasNew: false
            }
        };
        await postSaveHook.call(doc, doc);
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });
});