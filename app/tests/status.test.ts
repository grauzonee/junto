import request from "supertest"
import app from "@/app"
import { REQUEST_ID_HEADER } from "@/middlewares/requestLogging";

describe("Status test", () => {

    it("GET /status", async () => {
        const res = await request(app).get('/status')
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Junto API is running!');
        expect(res.headers[REQUEST_ID_HEADER]).toEqual(expect.any(String));
    })

    it("GET /status propagates request id header", async () => {
        const requestId = "status-request-id";
        const res = await request(app).get("/status").set(REQUEST_ID_HEADER, requestId);

        expect(res.statusCode).toBe(200);
        expect(res.headers[REQUEST_ID_HEADER]).toBe(requestId);
    })
})
