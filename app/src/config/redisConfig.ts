import { getConfigValue } from "@/helpers/configHelper"
import { logger } from "@/config/loggerConfig"
import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export async function getClient() {
    if (client != null) return client;
    client = createClient({
        url: `redis://${getConfigValue('REDIS_HOST')}:6379`,
        password: getConfigValue('REDIS_PASS')
    })
    client.on("error", (err) => logger.error("CLIENT Redis connection error", err));
    await client.connect();
    logger.debug("Connected to Redis");
    return client;
}

export async function closeConnections() {
    try {
        if (client) { await client.quit() }
    } catch (err) {
        logger.error('Error while disconnecting from Redis: ', err)
    }
}
