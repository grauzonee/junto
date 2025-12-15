import { Response, Request } from "express"

export function getMockedResponse() {
    const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    return res;
}

export function getMockedRequest(body = {}, params = {}, extra = {}) {
    const req = { body, params, ...extra } as Partial<Request>;
    return req;
} 
