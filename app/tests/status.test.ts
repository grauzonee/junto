import request from "supertest"
import app from "@/app"
import { getClient, closeConnections } from "@/config/redisConfig";
import { eventQueue, worker } from "@/queues/createEventQueue"

describe("Status test", () => {
    afterAll(async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
        await worker.close()
        await eventQueue.close()
        await closeConnections()
    });

    it("GET /status", async () => {
        const res = await request(app).get('/status')
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Junto API is runnning!');
    })
})
