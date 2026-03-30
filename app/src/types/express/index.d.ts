import { type Filter } from "@/types/Filter"
import { type SortInput } from "@/types/Sort";
import { type HydratedUserDoc } from "@/models/user/User";

declare global {
    namespace Express {
        export interface Request {
            user?: HydratedUserDoc,
            offset?: number;
            limit?: number;
            dbFilter?: Filter[];
            sort?: SortInput;
            search?: string;
        }
    }
}
