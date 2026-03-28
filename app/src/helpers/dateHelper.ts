export function toUnixSeconds(value: Date): number {
    return Math.floor(value.getTime() / 1000);
}
