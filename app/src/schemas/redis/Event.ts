import { Schema, Repository, RedisConnection } from "redis-om"
import { getClient } from "@/config/redisConfig";
import { logger } from "@/config/loggerConfig";
import { Circle } from "redis-om";

let repository: Repository | null = null;

const eventSchema = new Schema('events', {
    title: {
        type: 'string',
        indexed: true
    },
    description: {
        type: 'string',
        indexed: true
    },
    locationValue: {
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

export async function geoSearch(lat: number, lon: number, radius: number) {
    const repo = await getRepository()
    const result = await repo.search().where('location').inRadius((circle: Circle) =>
        circle.latitude(Number(lat)).longitude(Number(lon)).radius(radius).kilometers
    ).return.all()
    return result;
}

