import { z } from "zod";
import { CreateEventCommentSchema } from "@/schemas/http/Comment";

export type CreateCommentInput = z.infer<typeof CreateEventCommentSchema>;
