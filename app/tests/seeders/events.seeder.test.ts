import { buildSeedEventDates } from "@/seeders/events.seeder";

function startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function startOfWeek(value: Date): Date {
    const result = startOfDay(value);
    const distanceFromMonday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - distanceFromMonday);
    return result;
}

function endOfWeek(value: Date): Date {
    const result = startOfWeek(value);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
}

function isSameDay(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
}

function isSameMonth(value: Date, referenceDate: Date): boolean {
    return value.getFullYear() === referenceDate.getFullYear()
        && value.getMonth() === referenceDate.getMonth();
}

function toDateKey(value: Date): string {
    return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
}

describe("buildSeedEventDates()", () => {
    it("should seed one date today, one elsewhere this week, and the rest in the current month", () => {
        const referenceDate = new Date(2026, 2, 25, 10, 30, 0, 0);
        const dates = buildSeedEventDates(referenceDate, 10, () => 0.35);
        const [thisMonthDate, thisWeekDate, todayDate, ...randomMonthDates] = dates;
        const weekStart = startOfWeek(referenceDate);
        const weekEnd = endOfWeek(referenceDate);

        expect(dates).toHaveLength(10);
        expect(isSameDay(todayDate, referenceDate)).toBe(true);
        expect(thisWeekDate >= weekStart).toBe(true);
        expect(thisWeekDate <= weekEnd).toBe(true);
        expect(isSameDay(thisWeekDate, referenceDate)).toBe(false);
        expect(isSameMonth(thisMonthDate, referenceDate)).toBe(true);
        expect(thisMonthDate < weekStart || thisMonthDate > weekEnd).toBe(true);
        expect(randomMonthDates).toHaveLength(7);
        expect(randomMonthDates.every(date => isSameMonth(date, referenceDate))).toBe(true);
        expect(randomMonthDates.every(date => date < weekStart || date > weekEnd)).toBe(true);
        expect(new Set(dates.map(toDateKey)).size).toBe(dates.length);
    });

    it("should keep the current-week date valid when the week crosses a month boundary", () => {
        const referenceDate = new Date(2026, 2, 1, 10, 30, 0, 0);
        const [, thisWeekDate, todayDate, ...randomMonthDates] = buildSeedEventDates(referenceDate, 10, () => 0.5);
        const weekStart = startOfWeek(referenceDate);
        const weekEnd = endOfWeek(referenceDate);

        expect(isSameDay(todayDate, referenceDate)).toBe(true);
        expect(thisWeekDate >= weekStart).toBe(true);
        expect(thisWeekDate <= weekEnd).toBe(true);
        expect(isSameDay(thisWeekDate, referenceDate)).toBe(false);
        expect(randomMonthDates.every(date => isSameMonth(date, referenceDate))).toBe(true);
    });
});
