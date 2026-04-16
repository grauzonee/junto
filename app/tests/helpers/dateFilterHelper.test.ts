import { getRelativeDateRange, resolveEventDateFilterValue } from "@/helpers/dateFilterHelper";

describe("getRelativeDateRange()", () => {
    const referenceDate = new Date(2026, 2, 25, 12, 30, 0, 0); // Wednesday, March 25, 2026

    it.each([
        ["today", new Date(2026, 2, 25, 0, 0, 0, 0), new Date(2026, 2, 25, 23, 59, 59, 999)],
        ["this week", new Date(2026, 2, 23, 0, 0, 0, 0), new Date(2026, 2, 29, 23, 59, 59, 999)],
        ["this month", new Date(2026, 2, 1, 0, 0, 0, 0), new Date(2026, 2, 31, 23, 59, 59, 999)],
        ["this weekend", new Date(2026, 2, 28, 0, 0, 0, 0), new Date(2026, 2, 29, 23, 59, 59, 999)],
    ])("should resolve %s", (value, start, end) => {
        const result = getRelativeDateRange(value, referenceDate);
        expect(result).toEqual({ start, end });
    })

    it("should support underscored and hyphenated aliases", () => {
        const underscored = getRelativeDateRange("this_week", referenceDate);
        const hyphenated = getRelativeDateRange("this-weekend", referenceDate);
        expect(underscored).toEqual({
            start: new Date(2026, 2, 23, 0, 0, 0, 0),
            end: new Date(2026, 2, 29, 23, 59, 59, 999)
        });
        expect(hyphenated).toEqual({
            start: new Date(2026, 2, 28, 0, 0, 0, 0),
            end: new Date(2026, 2, 29, 23, 59, 59, 999)
        });
    })

    it("should support discover preset aliases", () => {
        const aliases = [
            ["week", new Date(2026, 2, 23, 0, 0, 0, 0), new Date(2026, 2, 29, 23, 59, 59, 999)],
            ["weekend", new Date(2026, 2, 28, 0, 0, 0, 0), new Date(2026, 2, 29, 23, 59, 59, 999)],
            ["month", new Date(2026, 2, 1, 0, 0, 0, 0), new Date(2026, 2, 31, 23, 59, 59, 999)],
        ] as const;
        aliases.forEach(([value, start, end]) => {
            expect(getRelativeDateRange(value, referenceDate)).toEqual({ start, end });
        });
    })
})

describe("resolveEventDateFilterValue()", () => {
    const referenceDate = new Date(2026, 2, 25, 12, 30, 0, 0);

    it("should return a range for relative values", () => {
        expect(resolveEventDateFilterValue("today", "eq", referenceDate)).toEqual({
            start: new Date(2026, 2, 25, 0, 0, 0, 0),
            end: new Date(2026, 2, 25, 23, 59, 59, 999)
        });
    })

    it("should return a Date for explicit date strings", () => {
        expect(resolveEventDateFilterValue("2026-03-25T08:15:00.000Z", "eq", referenceDate)).toEqual(new Date("2026-03-25T08:15:00.000Z"));
    })

    it("should throw on invalid date values", () => {
        expect(() => resolveEventDateFilterValue("definitely-not-a-date", "eq", referenceDate)).toThrow("Invalid filter value definitely-not-a-date");
    })
})
