import mongoose from "mongoose";
import { Comment } from "@/models/comment/Comment";
import { createUser } from "@tests/generators/user";
import { createFakeEvent } from "@tests/generators/event";
import { createFakeComment } from "@tests/generators/comment";
import { parseMongooseValidationError } from "@/helpers/requestHelper";
import messages from "@/constants/errorMessages";

describe("Comment model", () => {
    it("Should save a comment for an active event", async () => {
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: user._id.toString() }, true);
        const comment = await Comment.create({
            event: event._id,
            author: user._id,
            content: "Nice event"
        });

        expect(comment.content).toBe("Nice event");
        expect(comment.event.toString()).toBe(event._id.toString());
        expect(comment.author.toString()).toBe(user._id.toString());
    });

    it("Should reject comments for inactive events", async () => {
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: user._id.toString() }, true);
        event.active = false;
        await event.save();

        try {
            await Comment.create({
                event: event._id,
                author: user._id,
                content: "Will not save"
            });
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
            const parsedError = parseMongooseValidationError(error as mongoose.Error.ValidationError);
            expect(parsedError).toHaveProperty("event");
            expect(parsedError.event).toEqual([messages.validation.NOT_EXISTS("event")]);
        }
    });

    it("Should remove comments for an event through the static helper", async () => {
        const comment = await createFakeComment({}, true);
        const eventId = comment.event.toString();

        await Comment.deleteForEvent(eventId);

        const storedComments = await Comment.find({ event: eventId });
        expect(storedComments).toHaveLength(0);
    });
});
