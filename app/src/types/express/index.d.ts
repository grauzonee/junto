declare namespace Express {
    export interface Request {
        user?: IUser,
        offset?: number;
        limit?: number;
    }
}

