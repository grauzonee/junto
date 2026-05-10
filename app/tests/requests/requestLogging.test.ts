import request from "supertest";
import app from "@/app";
import { logger } from "@/config/loggerConfig";
import { REQUEST_ID_HEADER } from "@/middlewares/requestLogging";

jest.mock("@/config/loggerConfig", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn()
    }
}));

describe("request logging", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("logs one structured entry after a request finishes", async () => {
        const res = await request(app)
            .get("/status?token=secret")
            .set(REQUEST_ID_HEADER, "status-request-1");
        const requestLogCalls = jest.mocked(logger.info).mock.calls.filter(([message]) => (
            (message as unknown) === "request.completed"
        ));

        expect(res.statusCode).toBe(200);
        expect(res.headers[REQUEST_ID_HEADER]).toBe("status-request-1");
        expect(requestLogCalls).toHaveLength(1);
        expect(logger.info).toHaveBeenCalledWith("request.completed", {
            requestId: "status-request-1",
            method: "GET",
            path: "/status",
            status: 200,
            latency: expect.any(Number)
        });
    });
});
