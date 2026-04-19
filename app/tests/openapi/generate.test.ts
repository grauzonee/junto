import { generateOpenApiSpec } from "@/openapi/generate";

function asRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error("Expected object");
    }
    return value as Record<string, unknown>;
}

describe("generateOpenApiSpec", () => {
    it("generates OpenAPI paths for the public API routes", () => {
        const spec = generateOpenApiSpec();

        expect(spec.openapi).toBe("3.1.0");
        expect(spec.paths).toHaveProperty("/status");
        expect(spec.paths).toHaveProperty("/api/auth/login");
        expect(spec.paths).toHaveProperty("/api/event/{eventId}");
        expect(spec.paths).toHaveProperty("/api/event/{eventId}/rsvps");
        expect(spec.paths).toHaveProperty("/api/user/password");
    });

    it("does not emit empty additionalProperties placeholders in response schemas", () => {
        const spec = generateOpenApiSpec();
        const loginPath = asRecord(spec.paths["/api/auth/login"]);
        const loginOperation = asRecord(loginPath.put);
        const responses = asRecord(loginOperation.responses);
        const okResponse = asRecord(responses["200"]);
        const content = asRecord(okResponse.content);
        const jsonContent = asRecord(content["application/json"]);
        const schema = asRecord(jsonContent.schema);
        const responseProperties = asRecord(schema.properties);
        const loginDataSchema = responseProperties.data;

        expect(loginDataSchema).toHaveProperty("properties.token");
        expect(loginDataSchema).not.toHaveProperty("additionalProperties");
    });

    it("documents model-owned filter query params", () => {
        const spec = generateOpenApiSpec();
        const eventListOperation = asRecord(asRecord(spec.paths["/api/event"]).get);
        const eventListParameters = eventListOperation.parameters as { name: string }[];
        const eventTypeOperation = asRecord(asRecord(spec.paths["/api/event/types"]).get);
        const eventTypeParameters = eventTypeOperation.parameters as { name: string }[];
        const interestsOperation = asRecord(asRecord(spec.paths["/api/interests"]).get);
        const interestsParameters = interestsOperation.parameters as { name: string }[];

        expect(eventListParameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "date_eq",
            "date_after",
            "categories_in",
            "type_eq",
            "sortByAsc",
            "sortByDesc",
            "search"
        ]));
        expect(eventTypeParameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "title_eq",
            "title_contains"
        ]));
        expect(interestsParameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "title_eq",
            "title_contains"
        ]));
    });
});
