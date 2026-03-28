import { type FilterPrefix, type FilterRangeValue, type FilterValue } from "@/types/Filter";

function buildRange(start: Date, endExclusive: Date): FilterRangeValue {
    return {
        start,
        end: new Date(endExclusive.getTime() - 1)
    };
}

function startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfWeek(value: Date): Date {
    const result = startOfDay(value);
    const distanceFromMonday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - distanceFromMonday);
    return result;
}

function startOfMonth(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), 1);
}

function normalizeRelativeDateValue(value: string): string {
    return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function getRelativeDateRange(value: string, referenceDate: Date = new Date()): FilterRangeValue | undefined {
    const normalizedValue = normalizeRelativeDateValue(value);

    if (normalizedValue === "today") {
        const start = startOfDay(referenceDate);
        const endExclusive = new Date(start);
        endExclusive.setDate(endExclusive.getDate() + 1);
        return buildRange(start, endExclusive);
    }

    if (normalizedValue === "this week") {
        const start = startOfWeek(referenceDate);
        const endExclusive = new Date(start);
        endExclusive.setDate(endExclusive.getDate() + 7);
        return buildRange(start, endExclusive);
    }

    if (normalizedValue === "this month") {
        const start = startOfMonth(referenceDate);
        const endExclusive = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        return buildRange(start, endExclusive);
    }

    if (normalizedValue === "this weekend") {
        const start = startOfWeek(referenceDate);
        start.setDate(start.getDate() + 5);
        const endExclusive = new Date(start);
        endExclusive.setDate(endExclusive.getDate() + 2);
        return buildRange(start, endExclusive);
    }

    return undefined;
}

export function resolveEventDateFilterValue(
    value: FilterValue,
    _prefix: FilterPrefix,
    referenceDate: Date = new Date()
): FilterValue {
    if (typeof value !== "string") {
        return value;
    }

    const relativeRange = getRelativeDateRange(value, referenceDate);
    if (relativeRange) {
        return relativeRange;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid filter value " + value);
    }

    return parsedDate;
}
