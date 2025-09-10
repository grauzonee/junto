import { Queue, Worker, Job } from "bullmq"
import { connection } from "@/config/redisConfig"
import { type IEvent, Event } from "@/models/Event"
import { logger } from "@/config/loggerConfig"

const queueName = "createEvent"

const eventQueue = new Queue(queueName, { connection })
new Worker<Event>(queueName, async (job: Job) => {
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
