import { type Filter } from "@/types/Filter"
declare global {
    namespace Express {
        export interface Request {
            user?: IUser,
            offset?: number;
            limit?: number;
            dbFilter?: Filter[]
        }
    }
}

