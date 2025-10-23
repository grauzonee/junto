import { type Filter } from "@/types/Filter"
import { type SortInput } from "@/types/Sort";

declare global {
    namespace Express {
        export interface Request {
            user?: IUser,
            offset?: number;
            limit?: number;
            dbFilter?: Filter[];
            sort: SortInput
        }
    }
}

