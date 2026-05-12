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
        expect(spec.paths).toHaveProperty("/api/comments");
        expect(spec.paths).toHaveProperty("/api/comments/{eventId}");
        expect(spec.paths).toHaveProperty("/api/event/me");
        expect(spec.paths).toHaveProperty("/api/event/{eventId}");
        expect(spec.paths).toHaveProperty("/api/event/{eventId}/rsvps");
        expect(spec.paths).toHaveProperty("/api/event/{eventId}/rsvps/me");
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
        const eventDetailOperation = asRecord(asRecord(spec.paths["/api/event/{eventId}"]).get);
        const eventCommentsOperation = asRecord(asRecord(spec.paths["/api/comments/{eventId}"]).get);
        const createEventCommentsOperation = asRecord(asRecord(spec.paths["/api/comments"]).post);
        const eventRsvpsOperation = asRecord(asRecord(spec.paths["/api/event/{eventId}/rsvps"]).get);
        const currentUserRsvpOperation = asRecord(asRecord(spec.paths["/api/event/{eventId}/rsvps/me"]).get);
        const eventListParameters = eventListOperation.parameters as { name: string }[];
        const eventCommentsParameters = eventCommentsOperation.parameters as { name: string }[];
        const eventTypeOperation = asRecord(asRecord(spec.paths["/api/event/types"]).get);
        const eventTypeParameters = eventTypeOperation.parameters as { name: string }[];
        const interestsOperation = asRecord(asRecord(spec.paths["/api/interests"]).get);
        const interestsParameters = interestsOperation.parameters as { name: string }[];
        const eventDetailResponses = asRecord(eventDetailOperation.responses);
        const eventDetailOkResponse = asRecord(eventDetailResponses["200"]);
        const eventDetailContent = asRecord(eventDetailOkResponse.content);
        const eventDetailJson = asRecord(eventDetailContent["application/json"]);
        const eventDetailSchema = asRecord(eventDetailJson.schema);
        const eventDetailData = asRecord(asRecord(eventDetailSchema.properties).data);
        const eventRsvpsResponses = asRecord(eventRsvpsOperation.responses);
        const eventRsvpsOkResponse = asRecord(eventRsvpsResponses["200"]);
        const eventRsvpsContent = asRecord(eventRsvpsOkResponse.content);
        const eventRsvpsJson = asRecord(eventRsvpsContent["application/json"]);
        const eventRsvpsSchema = asRecord(eventRsvpsJson.schema);
        const eventRsvpsData = asRecord(asRecord(eventRsvpsSchema.properties).data);
        const currentUserRsvpSecurity = currentUserRsvpOperation.security as { bearerAuth: [] }[];

        expect(eventListParameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "date_eq",
            "date_after",
            "categories_in",
            "type_eq",
            "sortByAsc",
            "sortByDesc",
            "search"
        ]));
        expect(eventCommentsParameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "eventId",
            "page",
            "limit"
        ]));
        expect(createEventCommentsOperation.responses).toHaveProperty("201");
        expect(eventTypeParameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "title_eq",
            "title_contains"
        ]));
        expect(interestsParameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "title_eq",
            "title_contains"
        ]));
        expect(eventDetailData.properties).not.toHaveProperty("maxAttendees");
        expect(eventDetailData.properties).toHaveProperty("capacity");
        expect(eventRsvpsData.properties).not.toHaveProperty("currentUserRsvp");
        expect(currentUserRsvpSecurity).toEqual([{ bearerAuth: [] }]);
    });

    it("documents current user events as an authenticated event list", () => {
        const spec = generateOpenApiSpec();
        const currentUserEventsOperation = asRecord(asRecord(spec.paths["/api/event/me"]).get);
        const parameters = currentUserEventsOperation.parameters as { name: string }[];

        expect(currentUserEventsOperation.security).toEqual([{ bearerAuth: [] }]);
        expect(parameters.map(parameter => parameter.name)).toEqual(expect.arrayContaining([
            "date_eq",
            "categories_in",
            "type_eq",
            "sortByAsc",
            "sortByDesc",
            "search"
        ]));
    });
});
