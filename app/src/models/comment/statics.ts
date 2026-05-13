import { Types } from "mongoose";
import type { CommentModelType } from "@/models/comment/Comment";

export async function deleteForEvent(this: CommentModelType, eventId: Types.ObjectId | string) {
    return this.deleteMany({ event: eventId });
}

export async function deleteForAuthor(this: CommentModelType, authorId: Types.ObjectId | string) {
    return this.deleteMany({ author: authorId });
}
