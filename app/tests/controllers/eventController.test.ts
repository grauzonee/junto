import { Client, Entity, Schema, Repository } from "redis-om";
import { GenericContainer } from "testcontainers";
import { getRepository, geoSearch, textSearch } from "@/schemas/redis/Event";
import { closeConnections } from "@/config/redisConfig";

let repository: Repository;
beforeAll(async () => {
    const repository = await getRepository()
    const viennaPlaces = [
        {
            name: "Stephansdom",
            description: "Cathedral in Vienna",
            imageUrl: "url1",
            locationValue: "Stephansdom",
            location: { latitude: 48.20849, longitude: 16.37208 }
        },
        {
            name: "Schönbrunn Palace",
            description: "Famous palace",
            imageUrl: "url2",
            locationValue: "Schönbrunn Palace",
            location: { latitude: 48.18452, longitude: 16.31222 }
        },
        {
            name: "Belvedere Palace",
            description: "Art museum",
            imageUrl: "url3",
            locationValue: "Belvedere Palace",
            location: { latitude: 48.19145, longitude: 16.38095 }
        },
        {
            name: "Prater",
            description: "Amusement park",
            imageUrl: "url4",
            locationValue: "Prater",
            location: { latitude: 48.21649, longitude: 16.40087 }
        },
    ];

    for (const place of viennaPlaces) {
        await repository.save(place);
    }
}, 30000);

afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    await closeConnections()
});

describe("geoSearch integration tests", () => {
    it("returns locations within 3 km radius", async () => {
        const results = await geoSearch(48.20849, 16.37208, 2);
        expect(results).toEqual(
            expect.arrayContaining([
                expect.objectContaining(
                    {
                        name: "Stephansdom",
                        description: "Cathedral in Vienna",
                        imageUrl: "url1",
                        locationValue: "Stephansdom",
                        location: { latitude: 48.20849, longitude: 16.37208 }
                    }
                ),
            ])
        );

        expect(results).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining(
                    {
                        name: "Prater",
                        description: "Amusement park",
                        imageUrl: "url4",
                        locationValue: "Prater",
                        location: { latitude: 48.21649, longitude: 16.40087 }
                    }
                ),])
        );
    });

    it("returns empty array when no locations nearby", async () => {
        const results = await geoSearch(48.3000, 16.5000, 1);
        expect(results).toEqual([]);
    });
});

describe("textSearch integration tests", () => {
    it("returns result if there is a match", async () => {
        const results = await textSearch("cathedral");
        expect(results).toEqual(
            expect.arrayContaining([
                expect.objectContaining(
                    {
                        name: "Stephansdom",
                        description: "Cathedral in Vienna",
                        imageUrl: "url1",
                        locationValue: "Stephansdom",
                        location: { latitude: 48.20849, longitude: 16.37208 }
                    }
                ),
            ])
        );

        expect(results).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining(
                    {
                        name: "Prater",
                        description: "Amusement park",
                        imageUrl: "url4",
                        locationValue: "Prater",
                        location: { latitude: 48.21649, longitude: 16.40087 }
                    }
                ),])
        );
    });

    it("returns empty array when no locations nearby", async () => {
        const results = await textSearch("movie");
        expect(results).toEqual([]);
    });
});
