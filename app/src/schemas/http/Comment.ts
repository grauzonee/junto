import * as z from "zod";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages";

export const CreateEventCommentSchema = z.object({
    eventId: z.string().refine(
        id => Types.ObjectId.isValid(id),
        {
            message: messages.http.INVALID_ID("Event ID")
        }
    ),
    content: z.string()
        .trim()
        .min(1, { message: messages.http.MIN_LENGTH("Comment", 1) })
        .max(500, { message: messages.http.MAX_LENGTH("Comment", 500) })
}).strict();
