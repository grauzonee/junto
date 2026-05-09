import * as z from "zod";
import type { OpenApiRequestLocation, OpenApiRouteContract } from "./types";
import { openApiContracts } from "./contracts";

type JsonObject = Record<string, unknown>;
type OpenApiParameterLocation = Exclude<OpenApiRequestLocation, "body">;

enum OpenApiParameterIn {
    Path = "path",
    Query = "query",
    Header = "header"
}

const requestLocationToParameterIn: Record<OpenApiParameterLocation, OpenApiParameterIn> = {
    params: OpenApiParameterIn.Path,
    query: OpenApiParameterIn.Query,
    headers: OpenApiParameterIn.Header
};

function isJsonObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pathToOpenApi(path: string) {
    return path.replace(/:([^/]+)/g, "{$1}");
}

function removeEmptyAdditionalProperties(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(removeEmptyAdditionalProperties);
    }

    if (!isJsonObject(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .filter(([key, nestedValue]) => !(key === "additionalProperties" && isJsonObject(nestedValue) && Object.keys(nestedValue).length === 0))
            .map(([key, nestedValue]) => [key, removeEmptyAdditionalProperties(nestedValue)])
    );
}

function zodToOpenApiSchema(schema: z.ZodType): JsonObject {
    const jsonSchema = z.toJSONSchema(schema) as JsonObject;
    delete jsonSchema.$schema;
    return removeEmptyAdditionalProperties(jsonSchema) as JsonObject;
}

function getObjectProperties(schema: z.ZodType) {
    const jsonSchema = zodToOpenApiSchema(schema);
    const properties = isJsonObject(jsonSchema.properties) ? jsonSchema.properties : {};
    const required = Array.isArray(jsonSchema.required)
        ? new Set(jsonSchema.required.filter((item): item is string => typeof item === "string"))
        : new Set<string>();

    return { properties, required };
}

function buildParameters(contract: OpenApiRouteContract) {
    const parameters: JsonObject[] = [];
    const request = contract.request ?? {};
    const locations: OpenApiParameterLocation[] = ["params", "query", "headers"];

    for (const location of locations) {
        const schema = request[location];
        if (!schema) {
            continue;
        }

        const { properties, required } = getObjectProperties(schema);
        for (const [name, propertySchema] of Object.entries(properties)) {
            parameters.push({
                name,
                in: requestLocationToParameterIn[location],
                required: location === "params" || required.has(name),
                schema: propertySchema
            });
        }
    }

    return parameters;
}

function buildRequestBody(contract: OpenApiRouteContract) {
    if (contract.request?.body) {
        return {
            required: true,
            content: {
                "application/json": {
                    schema: zodToOpenApiSchema(contract.request.body)
                }
            }
        };
    }

    if (contract.rawRequestBody) {
        return {
            required: contract.rawRequestBody.required ?? false,
            content: {
                [contract.rawRequestBody.contentType]: {
                    schema: contract.rawRequestBody.schema
                }
            }
        };
    }

    return undefined;
}

function buildResponses(contract: OpenApiRouteContract) {
    return Object.fromEntries(
        Object.entries(contract.responses).map(([statusCode, response]) => [
            statusCode,
            {
                description: response.description,
                ...(response.schema
                    ? {
                        content: {
                            "application/json": {
                                schema: zodToOpenApiSchema(response.schema)
                            }
                        }
                    }
                    : {})
            }
        ])
    );
}

function buildOperation(contract: OpenApiRouteContract) {
    const parameters = buildParameters(contract);
    const requestBody = buildRequestBody(contract);

    return {
        operationId: contract.operationId,
        summary: contract.summary,
        tags: contract.tags,
        ...(contract.authenticated ? { security: [{ bearerAuth: [] }] } : {}),
        ...(parameters.length > 0 ? { parameters } : {}),
        ...(requestBody ? { requestBody } : {}),
        responses: buildResponses(contract)
    };
}

export function generateOpenApiSpec(contracts: OpenApiRouteContract[] = openApiContracts) {
    const paths: Record<string, JsonObject> = {};

    for (const contract of contracts) {
        const path = pathToOpenApi(contract.path);
        const pathItem = paths[path] ?? {};
        pathItem[contract.method] = buildOperation(contract);
        paths[path] = pathItem;
    }

    return {
        openapi: "3.1.0",
        info: {
            title: "Junto API",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],
        paths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    };
}
