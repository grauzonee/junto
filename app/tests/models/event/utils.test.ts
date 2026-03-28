import { normalizeEventDate } from "@/models/event/utils";

describe("normalizeEventDate()", () => {
    it("should keep Date inputs unchanged", () => {
        const value = new Date("2026-03-27T12:13:23.000Z");

        expect(normalizeEventDate(value)).toBe(value);
    });

    it("should convert unix-second numbers to Date", () => {
        expect(normalizeEventDate(1774613603).toISOString()).toBe("2026-03-27T12:13:23.000Z");
    });

    it("should convert millisecond numbers to Date", () => {
        expect(normalizeEventDate(1774613603000).toISOString()).toBe("2026-03-27T12:13:23.000Z");
    });

    it("should convert numeric strings to Date", () => {
        expect(normalizeEventDate("1774613603").toISOString()).toBe("2026-03-27T12:13:23.000Z");
    });

    it("should convert ISO strings to Date", () => {
        expect(normalizeEventDate("2026-03-27T12:13:23.000Z").toISOString()).toBe("2026-03-27T12:13:23.000Z");
    });
});
