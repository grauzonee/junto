import { Queue, Worker, Job } from "bullmq"
import { type IEvent, Event } from "@/models/Event"
import { logger } from "@/config/loggerConfig"
import { getConfigValue } from "@/helpers/configHelper"

const queueName = "createEvent"

const host = getConfigValue('REDIS_HOST');
const password = getConfigValue("REDIS_PASS");
const port = Number(process.env.REDIS_PORT ?? 6379);

const connection = { host, password, port }

export const eventQueue = new Queue(queueName, { connection })
export const worker = new Worker<IEvent>(queueName, async (job: Job) => {
    const event = job.data;
    try {
        await Event.create(event)
        return { status: 'ok' }
    } catch (err) {
        logger.error("Error saving event to MongoDB", err)
    }
}, { connection })

export async function addEvent(event: IEvent) {
    await eventQueue.add('addEvent', event)
}
worker.on('error', (err) => {
    logger.error('Worker error:', err);
});
eventQueue.on('error', (err) => {
    logger.error('Queue error: ', err);
});
