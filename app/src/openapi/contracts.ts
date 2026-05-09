import * as z from "zod";
import { RegisterSchema, LoginSchema } from "../schemas/http/Auth";
import { CoordinatesSchema, CreateEventSchema, EditEventSchema } from "../schemas/http/Event";
import { UpdateProfileSchema, UpdatePasswordSchema } from "../schemas/http/Profile";
import { CreateRSVPSchema, UpdateRSVPSchema } from "../schemas/http/RSVP";
import { SearchQuerySchema } from "../schemas/http/Search";
import { FILTER_PREFIXES } from "../types/Filter";
import type { OpenApiRouteContract } from "./types";
import {
    CategoriesResponseSchema,
    CreatedEventResponseSchema,
    DeleteEventResponseSchema,
    ErrorResponseSchema,
    EventDetailResponseSchema,
    EventListItemResponseSchema,
    EventResponseSchema,
    EventTypesResponseSchema,
    InterestsResponseSchema,
    LoginAuthResponseSchema,
    MediaUploadResponseSchema,
    ObjectIdParamSchema,
    PaginationQuerySchema,
    PasswordUpdatedResponseSchema,
    ProfileDeletedResponseSchema,
    ProfileResponseSchema,
    RegisterAuthResponseSchema,
    RSVPListResponseSchema,
    RSVPResponseSchema,
    SortQuerySchema,
    StatusResponseSchema,
    successResponse,
} from "./schemas";

const ValidationErrorResponse = {
    description: "Validation failure",
    schema: ErrorResponseSchema
};

const ServerErrorResponse = {
    description: "Server error",
    schema: ErrorResponseSchema
};

const EventIdParamsSchema = z.object({
    eventId: ObjectIdParamSchema
});

const RSVPIdParamsSchema = z.object({
    rsvpId: ObjectIdParamSchema
});

const CollectionQuerySchema = PaginationQuerySchema.merge(SortQuerySchema);

function filterQueryParams(fields: string[]) {
    return Object.fromEntries(
        fields.flatMap(field =>
            FILTER_PREFIXES.map(operator => [
                `${field}_${operator}`,
                z.string().optional()
            ])
        )
    ) as Record<string, z.ZodOptional<z.ZodString>>;
}

const EventCollectionQuerySchema = SearchQuerySchema
    .merge(CollectionQuerySchema)
    .extend(filterQueryParams(["date", "categories", "type"]));

const EventTypeCollectionQuerySchema = CollectionQuerySchema
    .extend(filterQueryParams(["title"]));

const InterestCollectionQuerySchema = CollectionQuerySchema
    .extend(filterQueryParams(["title"]));

const MediaUploadBodySchema = {
    type: "object",
    properties: {
        media: {
            type: "string",
            format: "binary"
        }
    },
    required: ["media"],
    additionalProperties: false
};

export const statusContract: OpenApiRouteContract = {
    method: "get",
    path: "/status",
    operationId: "getStatus",
    summary: "Check API health",
    tags: ["Status"],
    responses: {
        "200": {
            description: "API status",
            schema: StatusResponseSchema
        }
    }
};

export const loginContract: OpenApiRouteContract = {
    method: "put",
    path: "/api/auth/login",
    operationId: "login",
    summary: "Log in a user",
    tags: ["Auth"],
    request: { body: LoginSchema },
    responses: {
        "200": {
            description: "Authenticated user",
            schema: successResponse(LoginAuthResponseSchema)
        },
        "400": ValidationErrorResponse,
        "500": ServerErrorResponse
    }
};

export const registerContract: OpenApiRouteContract = {
    method: "post",
    path: "/api/auth/register",
    operationId: "register",
    summary: "Register a user",
    tags: ["Auth"],
    request: { body: RegisterSchema },
    responses: {
        "201": {
            description: "Registered user",
            schema: successResponse(RegisterAuthResponseSchema)
        },
        "400": ValidationErrorResponse,
        "500": ServerErrorResponse
    }
};

export const uploadMediaContract: OpenApiRouteContract = {
    method: "put",
    path: "/api/media",
    operationId: "uploadMedia",
    summary: "Upload media",
    tags: ["Media"],
    authenticated: true,
    rawRequestBody: {
        contentType: "multipart/form-data",
        required: true,
        schema: MediaUploadBodySchema
    },
    responses: {
        "201": {
            description: "Uploaded file metadata",
            schema: successResponse(MediaUploadResponseSchema)
        }
    }
};

export const createEventContract: OpenApiRouteContract = {
    method: "post",
    path: "/api/event",
    operationId: "createEvent",
    summary: "Create an event",
    tags: ["Events"],
    authenticated: true,
    request: { body: CreateEventSchema },
    responses: {
        "201": {
            description: "Created event",
            schema: successResponse(CreatedEventResponseSchema)
        },
        "400": ValidationErrorResponse,
        "500": ServerErrorResponse
    }
};

export const listEventsContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/event",
    operationId: "listEvents",
    summary: "List events",
    tags: ["Events"],
    request: { query: EventCollectionQuerySchema },
    responses: {
        "200": {
            description: "Event list",
            schema: successResponse(z.array(EventListItemResponseSchema))
        },
        "400": ValidationErrorResponse
    }
};

export const listCurrentUserEventsContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/event/me",
    operationId: "listCurrentUserEvents",
    summary: "List events authored by the current user",
    tags: ["Events"],
    authenticated: true,
    request: { query: EventCollectionQuerySchema },
    responses: {
        "200": {
            description: "Current user event list",
            schema: successResponse(z.array(EventListItemResponseSchema))
        },
        "400": ValidationErrorResponse,
        "401": ValidationErrorResponse
    }
};

export const listEventTypesViaEventContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/event/types",
    operationId: "listEventTypesViaEvent",
    summary: "List event types",
    tags: ["Events"],
    request: { query: EventTypeCollectionQuerySchema },
    responses: {
        "200": {
            description: "Event type list",
            schema: successResponse(EventTypesResponseSchema)
        },
        "400": ValidationErrorResponse
    }
};

export const geoSearchEventsContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/event/geosearch",
    operationId: "geoSearchEvents",
    summary: "Find events near coordinates",
    tags: ["Events"],
    request: { query: CoordinatesSchema },
    responses: {
        "200": {
            description: "Nearby events",
            schema: successResponse(z.array(EventListItemResponseSchema))
        },
        "400": ValidationErrorResponse
    }
};

export const fetchEventContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/event/:eventId",
    operationId: "fetchEvent",
    summary: "Fetch one event",
    tags: ["Events"],
    request: { params: EventIdParamsSchema },
    responses: {
        "200": {
            description: "Event",
            schema: successResponse(EventDetailResponseSchema)
        },
        "400": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const replaceEventContract: OpenApiRouteContract = {
    method: "put",
    path: "/api/event/:eventId",
    operationId: "replaceEvent",
    summary: "Replace an event",
    tags: ["Events"],
    authenticated: true,
    request: {
        params: EventIdParamsSchema,
        body: CreateEventSchema
    },
    responses: {
        "200": {
            description: "Updated event",
            schema: successResponse(EventResponseSchema)
        },
        "400": ValidationErrorResponse,
        "403": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const updateEventContract: OpenApiRouteContract = {
    method: "patch",
    path: "/api/event/:eventId",
    operationId: "updateEvent",
    summary: "Update an event",
    tags: ["Events"],
    authenticated: true,
    request: {
        params: EventIdParamsSchema,
        body: EditEventSchema
    },
    responses: {
        "200": {
            description: "Updated event",
            schema: successResponse(EventResponseSchema)
        },
        "400": ValidationErrorResponse,
        "403": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const deleteEventContract: OpenApiRouteContract = {
    method: "delete",
    path: "/api/event/:eventId",
    operationId: "deleteEvent",
    summary: "Delete an event",
    tags: ["Events"],
    authenticated: true,
    request: { params: EventIdParamsSchema },
    responses: {
        "200": {
            description: "Delete confirmation",
            schema: successResponse(DeleteEventResponseSchema)
        },
        "400": ValidationErrorResponse,
        "403": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const attendEventContract: OpenApiRouteContract = {
    method: "post",
    path: "/api/event/attend",
    operationId: "attendEvent",
    summary: "RSVP to an event",
    tags: ["Events", "RSVP"],
    authenticated: true,
    request: { body: CreateRSVPSchema },
    responses: {
        "201": {
            description: "Created RSVP",
            schema: successResponse(RSVPResponseSchema)
        },
        "400": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const listEventRsvpsContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/event/:eventId/rsvps",
    operationId: "listEventRsvps",
    summary: "List RSVPs for an event",
    tags: ["Events", "RSVP"],
    request: { params: EventIdParamsSchema },
    responses: {
        "200": {
            description: "RSVP list",
            schema: successResponse(RSVPListResponseSchema)
        },
        "400": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const listInterestsContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/interests",
    operationId: "listInterests",
    summary: "List interests",
    tags: ["Interests"],
    request: { query: InterestCollectionQuerySchema },
    responses: {
        "200": {
            description: "Interest list",
            schema: successResponse(InterestsResponseSchema)
        },
        "400": ValidationErrorResponse
    }
};

export const listCategoriesContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/categories",
    operationId: "listCategories",
    summary: "List categories",
    tags: ["Categories"],
    request: { query: PaginationQuerySchema },
    responses: {
        "200": {
            description: "Category list",
            schema: successResponse(CategoriesResponseSchema)
        },
        "400": ValidationErrorResponse
    }
};

export const updateRsvpContract: OpenApiRouteContract = {
    method: "put",
    path: "/api/rsvp/:rsvpId",
    operationId: "updateRsvp",
    summary: "Update an RSVP",
    tags: ["RSVP"],
    authenticated: true,
    request: {
        params: RSVPIdParamsSchema,
        body: UpdateRSVPSchema
    },
    responses: {
        "200": {
            description: "Updated RSVP",
            schema: successResponse(RSVPResponseSchema)
        },
        "400": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const getProfileContract: OpenApiRouteContract = {
    method: "get",
    path: "/api/user",
    operationId: "getProfile",
    summary: "Get the current profile",
    tags: ["User"],
    authenticated: true,
    responses: {
        "200": {
            description: "User profile",
            schema: successResponse(ProfileResponseSchema)
        },
        "404": ValidationErrorResponse
    }
};

export const updateProfileContract: OpenApiRouteContract = {
    method: "put",
    path: "/api/user",
    operationId: "updateProfile",
    summary: "Update the current profile",
    tags: ["User"],
    authenticated: true,
    request: { body: UpdateProfileSchema },
    responses: {
        "200": {
            description: "Updated user profile",
            schema: successResponse(ProfileResponseSchema)
        },
        "400": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const updatePasswordContract: OpenApiRouteContract = {
    method: "put",
    path: "/api/user/password",
    operationId: "updatePassword",
    summary: "Update the current user's password",
    tags: ["User"],
    authenticated: true,
    request: { body: UpdatePasswordSchema },
    responses: {
        "200": {
            description: "Password update confirmation",
            schema: successResponse(PasswordUpdatedResponseSchema)
        },
        "400": ValidationErrorResponse,
        "404": ValidationErrorResponse
    }
};

export const deleteProfileContract: OpenApiRouteContract = {
    method: "delete",
    path: "/api/user",
    operationId: "deleteProfile",
    summary: "Delete the current profile",
    tags: ["User"],
    authenticated: true,
    responses: {
        "200": {
            description: "Profile deletion confirmation",
            schema: successResponse(ProfileDeletedResponseSchema)
        },
        "404": ValidationErrorResponse
    }
};

export const openApiContracts = [
    statusContract,
    loginContract,
    registerContract,
    uploadMediaContract,
    createEventContract,
    listEventsContract,
    listCurrentUserEventsContract,
    listEventTypesViaEventContract,
    geoSearchEventsContract,
    fetchEventContract,
    replaceEventContract,
    updateEventContract,
    deleteEventContract,
    attendEventContract,
    listEventRsvpsContract,
    listInterestsContract,
    listCategoriesContract,
    updateRsvpContract,
    getProfileContract,
    updateProfileContract,
    updatePasswordContract,
    deleteProfileContract
] satisfies OpenApiRouteContract[];
