import { Router } from "express";
import { createComment } from "@/requests/comment/createComment";
import { deleteComment } from "@/requests/comment/deleteComment";
import { listComments } from "@/requests/comment/listComments";
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { CreateEventCommentSchema } from "@/schemas/http/Comment";

export const router = Router();

router.get("/:eventId", paginateMiddleware, listComments);
router.post("/", [authMiddleware, requestSchemaValidate(CreateEventCommentSchema)], createComment);
router.delete("/:commentId", [authMiddleware], deleteComment);
