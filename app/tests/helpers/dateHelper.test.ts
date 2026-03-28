import { toUnixSeconds } from "@/helpers/dateHelper";

describe("toUnixSeconds()", () => {
    it("should convert a Date into unix seconds", () => {
        expect(toUnixSeconds(new Date("2026-03-27T12:13:23.000Z"))).toBe(1774613603);
    });
});
