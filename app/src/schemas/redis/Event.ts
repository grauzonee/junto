import { Schema, Repository, RedisConnection } from "redis-om"
import { getClient } from "@/config/redisConfig";
import { logger } from "@/config/loggerConfig";
import { Circle } from "redis-om";

let repository: Repository | null = null;

const eventSchema = new Schema('events', {
    title: {
        type: 'text',
        indexed: true
    },
    description: {
        type: 'text',
        indexed: true
    },
    fullAddress: {
        type: 'string',
        indexed: true
    },
    location: {
        type: 'point',
        indexed: true
    },
    date: {
        type: 'number',
        indexed: true
    },
    imageUrl: {
        type: 'string',
        indexed: false
    },
    topics: {
        type: 'string[]',
        indexed: false
    }
}, { dataStructure: 'HASH' })

export async function getRepository(): Promise<Repository> {
    const client = await getClient()
    if (!repository) {
        repository = new Repository(eventSchema, client as unknown as RedisConnection)
    }
    try {
        await repository.createIndex()
        logger.debug("Event index created")
    } catch (error) {
        logger.error("Error creating index", error)
    }
    return repository;
}

export async function geoSearch(lat: number, lon: number, radius: number, offset = 0, limit = 20) {
    const repo = await getRepository()
    const result = await repo.search().where('location').inRadius((circle: Circle) =>
        circle.latitude(Number(lat)).longitude(Number(lon)).radius(radius).kilometers
    ).return.page(offset, limit)
    return result;
}

export async function textSearch(query: string, offset = 0, limit = 20) {
    const repo = await getRepository()
    const result = await repo.search()
        .where('title').matches(query)
        .or("description").matches(query)
        .return.page(offset, limit)
    return result;
}

