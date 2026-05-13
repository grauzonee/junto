import { Comment, type HydratedComment } from "@/models/comment/Comment";
import { Event } from "@/models/event/Event";
import { logger } from "@/config/loggerConfig";
import { ForbiddenError, NotFoundError } from "@/types/errors/InputError";
import type { RequestData } from "@/types/common";
import type { CreateCommentInput } from "@/types/services/commentService";

export interface CommentListResult {
    total: number;
    entities: HydratedComment[];
}

async function assertActiveEvent(eventId: string) {
    const event = await Event.findOne({ _id: eventId, active: true });
    if (!event) {
        throw new NotFoundError("event");
    }

    return event;
}

export async function create(data: CreateCommentInput, userId: string) {
    const eventId = data.eventId;
    const event = await assertActiveEvent(eventId);

    try {
        const comment = await Comment.create({
            event: event._id,
            author: userId,
            content: data.content
        });
        await comment.populate("author", "_id username avatarUrl");
        return comment;
    } catch (error) {
        logger.error(`Error while creating comment for event ${eventId}:`, error);
        throw error;
    }
}

export async function listForEvent(eventId: string, data: RequestData): Promise<CommentListResult> {
    await assertActiveEvent(eventId);

    const query = Comment.find({ event: eventId })
        .populate("author", "_id username avatarUrl")
        .sort({ createdAt: -1 })
        .paginate(data.pagination.offset, data.pagination.limit);

    const [total, entities] = await Promise.all([
        Comment.countDocuments({ event: eventId }),
        query
    ]);

    return {
        total,
        entities
    };
}

export async function deleteComment(commentId: string, userId: string) {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new NotFoundError("comment");
        }
        if (comment.author.toString() !== userId) {
            throw new ForbiddenError("Only the comment author can delete this comment");
        }

        await comment.deleteOne();
        return comment;
    } catch (error) {
        logger.error(`Error while deleting comment ${commentId}:`, error);
        throw error;
    }
}
