import { GenericContainer } from "testcontainers";

export default async function globalSetup() {
    const password = "junto"
    const redisContainer = await new GenericContainer("redis/redis-stack:latest")
        .withExposedPorts(6379)
        .withHostname('redis')
        .withEnvironment({ "REDIS_ARGS": `--requirepass ${password}` })
        .start();

    const host = redisContainer.getHost();
    const port = redisContainer.getMappedPort(6379);
    process.env.REDIS_PORT = port.toString();
    console.log(host, port)
    const uri = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;
    console.log("Redis Stack running at:", uri);
}
