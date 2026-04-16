import { Response, Request } from "express"

export type MockedJsonDocument<T extends object> = T & {
    toJSON: jest.Mock<T, []>;
}

export function withToJSON<T extends object>(value: T): MockedJsonDocument<T> {
    return {
        ...value,
        toJSON: jest.fn(() => value)
    };
}

export function getMockedResponse(): Pick<Response, "json" | "status"> {
    const res: Pick<Response, "json" | "status"> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    return res;
}

export function getMockedRequest<
    TBody extends object = Record<string, never>,
    TParams extends object = Record<string, never>,
    TExtra extends object = Record<string, never>,
>(body = {} as TBody, params = {} as TParams, extra = {} as TExtra) {
    return { body, params, ...extra } as Partial<Request> & { body: TBody; params: TParams } & TExtra;
} 
