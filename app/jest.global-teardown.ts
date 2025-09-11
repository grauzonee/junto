export default async function globalTeardown() {
    const container = (global as any).__REDIS_CONTAINER__;
    if (container) {
        await container.stop();
    }
}
