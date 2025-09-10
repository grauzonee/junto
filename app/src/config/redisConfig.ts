import IORedis from "ioredis"
import { getConfigValue } from "@/helpers/configHelper"
import { logger } from "@/config/loggerConfig"
import { createClient, RedisClientType } from 'redis';

export const connection = new IORedis({
    host: getConfigValue("REDIS_HOST"),
    password: getConfigValue("REDIS_PASS"),
    maxRetriesPerRequest: null
})
connection.on("connect", () => logger.debug("Connected to Redis"));
connection.on("error", (err) => logger.error("Redis error:", err));
connection.on("reconnecting", () => logger.debug("Reconnecting to Redis..."));

let client: RedisClientType | null = null;

export async function getClient() {
    if (client != null) return client;
    client = createClient({
        url: `redis://${getConfigValue('REDIS_HOST')}:6379`,
        password: getConfigValue('REDIS_PASS')
    })
    client.on("error", (err) => logger.error("Redis connection error", err));
    await client.connect();
    logger.debug("Connected to Redis");
    return client;
}
