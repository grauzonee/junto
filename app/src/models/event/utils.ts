export function normalizeEventDate(value: Date | number | string): Date {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "number") {
        const milliseconds = Math.abs(value) >= 1e12 ? value : value * 1000;
        return new Date(milliseconds);
    }

    if (typeof value === "string") {
        const trimmedValue = value.trim();

        if (/^-?\d+$/.test(trimmedValue)) {
            return normalizeEventDate(Number(trimmedValue));
        }

        return new Date(trimmedValue);
    }

    return value;
}
