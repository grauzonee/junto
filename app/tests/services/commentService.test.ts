import { createUser } from "@tests/generators/user";
import { createFakeEvent } from "@tests/generators/event";
import { createFakeComment } from "@tests/generators/comment";
import { create, deleteComment, listForEvent } from "@/services/commentService";
import { ForbiddenError, NotFoundError } from "@/types/errors/InputError";
import { Comment } from "@/models/comment/Comment";

describe("commentService.create()", () => {
    it("Should create a comment for an active event", async () => {
        const author = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString() }, true);
        const result = await create({ eventId: event._id.toString(), content: "Hello comments" }, author._id.toString());

        expect(result.event.toString()).toBe(event._id.toString());
        expect(result.author).toMatchObject({
            _id: author._id,
            username: author.username
        });
        expect(result.content).toBe("Hello comments");
    });

    it("Should reject comments for inactive events", async () => {
        const author = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString() }, true);
        event.active = false;
        await event.save();

        await expect(create({ eventId: event._id.toString(), content: "Hello comments" }, author._id.toString())).rejects.toBeInstanceOf(NotFoundError);
    });
});

describe("commentService.listForEvent()", () => {
    it("Should return paginated comments in newest-first order", async () => {
        const author = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString() }, true);
        const older = await createFakeComment({
            event: event._id.toString(),
            author: author._id.toString(),
            content: "Older comment"
        }, true);
        await new Promise(resolve => setTimeout(resolve, 10));
        const newer = await createFakeComment({
            event: event._id.toString(),
            author: author._id.toString(),
            content: "Newer comment"
        }, true);

        const result = await listForEvent(event._id.toString(), {
            pagination: { offset: 0, limit: 10 }
        });

        expect(result.total).toBeGreaterThanOrEqual(2);
        expect(result.entities.map(comment => comment._id.toString())).toEqual([
            newer._id.toString(),
            older._id.toString()
        ]);
    });

    it("Should reject comments listing for inactive events", async () => {
        const author = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString() }, true);
        event.active = false;
        await event.save();

        await expect(listForEvent(event._id.toString(), {
            pagination: { offset: 0, limit: 10 }
        })).rejects.toBeInstanceOf(NotFoundError);
    });
});

describe("commentService.deleteComment()", () => {
    it("Should delete a comment authored by the user", async () => {
        const author = await createUser({}, true);
        const comment = await createFakeComment({ author: author._id.toString() }, true);

        await deleteComment(comment._id.toString(), author._id.toString());

        await expect(Comment.findById(comment._id).orFail()).rejects.toBeTruthy();
    });

    it("Should reject deleting another user's comment", async () => {
        const owner = await createUser({}, true);
        const otherUser = await createUser({}, true);
        const comment = await createFakeComment({ author: owner._id.toString() }, true);

        await expect(deleteComment(comment._id.toString(), otherUser._id.toString())).rejects.toBeInstanceOf(ForbiddenError);
        await expect(Comment.findById(comment._id).orFail()).resolves.toBeTruthy();
    });

    it("Should reject deleting a missing comment", async () => {
        const author = await createUser({}, true);

        await expect(deleteComment(author._id.toString(), author._id.toString())).rejects.toBeInstanceOf(NotFoundError);
    });
});
