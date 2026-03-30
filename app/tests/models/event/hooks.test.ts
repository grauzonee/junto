import * as rsvpMethods from "@/services/RSVPService";
import { Types } from "mongoose";
import { registerSaveHooks } from "@/models/event/hooks";
import { RSVP } from "@/models/rsvp/RSVP";
import { createFakeRSVP } from "@tests/generators/rsvp";
import type { HydratedEvent } from "@/models/event/Event";

type EventHookDoc = Pick<HydratedEvent, "_id" | "author" | "date" | "isNew" | "isModified" | "$locals">;
type EventPreSaveHook = (this: HydratedEvent, next: jest.Mock) => void;
type EventPostSaveHook = (this: HydratedEvent, doc: HydratedEvent) => Promise<void>;

function getRegisteredHooks() {
    const schema = {
        pre: jest.fn(),
        post: jest.fn()
    };

    registerSaveHooks(schema as never);

    return {
        preSaveHook: schema.pre.mock.calls.find(([hook]) => hook === "save")?.[1] as EventPreSaveHook,
        postSaveHook: schema.post.mock.calls.find(([hook]) => hook === "save")?.[1] as EventPostSaveHook
    };
}

describe("preSaveHook", () => {
    it("should set wasNew to true if the document is new", () => {
        const { preSaveHook } = getRegisteredHooks();
        const doc: EventHookDoc = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            date: new Date(),
            isNew: true,
            isModified: () => false,
            $locals: {}
        };
        preSaveHook.call(doc as HydratedEvent, jest.fn());
        expect(doc.$locals.wasNew).toBe(true);
    });

    it("should set wasNew to false if the document is not new", () => {
        const { preSaveHook } = getRegisteredHooks();
        const doc: EventHookDoc = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            date: new Date(),
            isNew: false,
            isModified: () => false,
            $locals: {}
        };
        preSaveHook.call(doc as HydratedEvent, jest.fn());
        expect(doc.$locals.wasNew).toBe(false);
    });
});

describe("postSaveHook", () => {
    it("should call create with correct parameters if the document was new", async () => {
        const { postSaveHook } = getRegisteredHooks();
        const spy = jest.spyOn(rsvpMethods, "create").mockResolvedValue({} as never);
        const eventId = new Types.ObjectId();
        const authorId = new Types.ObjectId();
        const doc: EventHookDoc = {
            _id: eventId,
            author: authorId,
            date: new Date(),
            isNew: false,
            isModified: () => false,
            $locals: {
                wasNew: true
            }
        };
        await postSaveHook.call(doc as HydratedEvent, doc as HydratedEvent);
        expect(spy).toHaveBeenCalledWith({ eventId: eventId.toString(), status: "confirmed" }, authorId.toString());
        spy.mockRestore();
    });

    it("should not call create if the document was not new", async () => {
        const { postSaveHook } = getRegisteredHooks();
        const spy = jest.spyOn(rsvpMethods, "create").mockResolvedValue({} as never);
        const doc: EventHookDoc = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            date: new Date(),
            isNew: false,
            $locals: {
                wasNew: false
            },
            isModified: () => false
        };
        await postSaveHook.call(doc as HydratedEvent, doc as HydratedEvent);
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it("should update RSVP's eventDate if event.date was updated", async () => {
        const { postSaveHook } = getRegisteredHooks();
        const mockRSVP = await createFakeRSVP({});
        const spy = jest.spyOn(RSVP, "updateMany").mockResolvedValue(mockRSVP as never);
        const doc: EventHookDoc = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            date: new Date(),
            isNew: false,
            $locals: {
                wasNew: false
            },
            isModified: () => true
        };
        await postSaveHook.call(doc as HydratedEvent, doc as HydratedEvent);
        expect(spy).toHaveBeenCalledWith({ event: doc._id }, { eventDate: doc.date });
        spy.mockRestore();
    })
});
