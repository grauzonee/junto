import { Types } from "mongoose";
import { registerSaveHooks } from "@/models/event/hooks";
import * as rsvpCascade from "@/models/rsvp/cascade";
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

    it("should set dateWasModified if the date was changed", () => {
        const { preSaveHook } = getRegisteredHooks();
        const doc: EventHookDoc = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            date: new Date(),
            isNew: false,
            isModified: (path: string) => path === "date",
            $locals: {}
        };

        preSaveHook.call(doc as HydratedEvent, jest.fn());

        expect(doc.$locals.dateWasModified).toBe(true);
    });
});

describe("postSaveHook", () => {
    it.each([
        {
            name: "should ensure the author RSVP if the document was new",
            wasNew: true,
            shouldCall: true
        },
        {
            name: "should not ensure the author RSVP if the document was not new",
            wasNew: false,
            shouldCall: false
        }
    ])("$name", async ({ wasNew, shouldCall }) => {
        const { postSaveHook } = getRegisteredHooks();
        const spy = jest.spyOn(rsvpCascade, "ensureAuthorRsvp").mockResolvedValue({} as never);
        const doc: EventHookDoc = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            date: new Date(),
            isNew: false,
            isModified: () => false,
            $locals: {
                wasNew
            }
        };

        await postSaveHook.call(doc as HydratedEvent, doc as HydratedEvent);

        if (shouldCall) {
            expect(spy).toHaveBeenCalledWith(doc);
        } else {
            expect(spy).not.toHaveBeenCalled();
        }

        spy.mockRestore();
    });

    it.each([
        {
            name: "should update RSVP's eventDate if event.date was updated",
            dateWasModified: true,
            shouldCall: true
        },
        {
            name: "should not update RSVP's eventDate if event.date was not updated",
            dateWasModified: false,
            shouldCall: false
        }
    ])("$name", async ({ dateWasModified, shouldCall }) => {
        const { postSaveHook } = getRegisteredHooks();
        const spy = jest.spyOn(rsvpCascade, "syncRsvpEventDates").mockResolvedValue({} as never);
        const doc: EventHookDoc = {
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(),
            date: new Date(),
            isNew: false,
            $locals: {
                wasNew: false,
                dateWasModified
            },
            isModified: () => dateWasModified
        };

        await postSaveHook.call(doc as HydratedEvent, doc as HydratedEvent);

        if (shouldCall) {
            expect(spy).toHaveBeenCalledWith(doc._id, doc.date);
        } else {
            expect(spy).not.toHaveBeenCalled();
        }

        spy.mockRestore();
    });
});
