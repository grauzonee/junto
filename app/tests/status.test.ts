import request from "supertest"
import app from "@/app"
jest.mock("ioredis", () => require("ioredis-mock"));

describe("Status test", () => {
    it("GET /status", async () => {
        const res = await request(app).get('/status')
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Junto API is runnning!');
    })
})
