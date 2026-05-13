import mongoose, { HydratedDocument, Model, Schema, SchemaTypes, Types } from "mongoose";
import { paginatePlugin, type PaginateQueryHelper } from "@/models/plugins/paginate";
import { activeEventValidator, activeUserValidator } from "@/models/comment/validators";
import messages from "@/constants/errorMessages";
import { deleteForAuthor, deleteForEvent } from "@/models/comment/statics";

export interface IComment {
    _id: Types.ObjectId;
    event: Types.ObjectId;
    author: Types.ObjectId;
    content: string;
}

export type HydratedComment = HydratedDocument<IComment>;

export interface CommentModelType extends Model<IComment, PaginateQueryHelper<IComment>> {
    deleteForEvent(eventId: Types.ObjectId | string): Promise<unknown>;
    deleteForAuthor(authorId: Types.ObjectId | string): Promise<unknown>;
}

export const CommentSchema = new Schema<IComment, CommentModelType, object, PaginateQueryHelper<IComment>>(
    {
        event: {
            type: SchemaTypes.ObjectId,
            required: true,
            ref: "Event"
        },
        author: {
            type: SchemaTypes.ObjectId,
            required: true,
            ref: "User"
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, messages.http.MAX_LENGTH("Comment", 500)]
        }
    },
    {
        timestamps: true,
        statics: {
            deleteForEvent,
            deleteForAuthor
        }
    }
);

CommentSchema.path("event").validate({
    validator: activeEventValidator,
    message: messages.validation.NOT_EXISTS("event")
});

CommentSchema.path("author").validate({
    validator: activeUserValidator,
    message: messages.validation.NOT_EXISTS("user")
});

CommentSchema.set("toJSON", {
    getters: true,
    virtuals: false,
    versionKey: false,
    transform: (_, ret) => {
        if ("updatedAt" in ret) {
            delete ret.updatedAt;
        }

        return ret;
    }
});

CommentSchema.plugin(paginatePlugin<IComment>);

export const Comment = mongoose.model<IComment, CommentModelType>("Comment", CommentSchema);
