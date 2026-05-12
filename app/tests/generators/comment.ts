import { Comment, type HydratedComment, type IComment } from "@/models/comment/Comment";
import { Types } from "mongoose";
import { getOneEvent, getOneUser } from "@tests/getters";

type FakeComment = Omit<IComment, "_id" | "event" | "author"> & {
    event: string;
    author: string;
};

let commentSequence = 0;

export async function createFakeComment(overrides?: Partial<FakeComment>, save?: false): Promise<FakeComment>;
export async function createFakeComment(overrides: Partial<FakeComment>, save: true): Promise<HydratedComment>;
export async function createFakeComment(overrides: Partial<FakeComment> = {}, save = false): Promise<FakeComment | HydratedComment> {
    if (!overrides.event && save) {
        const event = await getOneEvent({ active: true });
        overrides.event = event._id.toString();
    }

    if (!overrides.author && save) {
        const author = await getOneUser({ active: true });
        overrides.author = author._id.toString();
    }

    const commentData = {
        event: overrides.event ?? new Types.ObjectId().toString(),
        author: overrides.author ?? new Types.ObjectId().toString(),
        content: `Sample comment ${commentSequence += 1}`,
        ...overrides
    };

    if (save) {
        return Comment.create(commentData);
    }

    return commentData as FakeComment;
}
