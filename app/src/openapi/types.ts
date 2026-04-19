import type * as z from "zod";

export type OpenApiMethod = "get" | "post" | "put" | "patch" | "delete";
export type OpenApiRequestLocation = "body" | "query" | "params" | "headers";

export type OpenApiRequestSchemas = Partial<Record<OpenApiRequestLocation, z.ZodType>>;

export interface OpenApiRawRequestBody {
    contentType: string;
    schema: Record<string, unknown>;
    required?: boolean;
}

export interface OpenApiResponseContract {
    description: string;
    schema?: z.ZodType;
}

export interface OpenApiRouteContract {
    method: OpenApiMethod;
    path: string;
    operationId: string;
    summary: string;
    tags: string[];
    request?: OpenApiRequestSchemas;
    rawRequestBody?: OpenApiRawRequestBody;
    responses: Record<string, OpenApiResponseContract>;
    authenticated?: boolean;
}
