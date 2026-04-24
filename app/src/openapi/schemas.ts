import * as z from "zod";

export const IdSchema = z.string();
export const ObjectIdParamSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const PaginationQuerySchema = z.looseObject({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional()
});

export const SortQuerySchema = z.looseObject({
    sortByAsc: z.string().optional(),
    sortByDesc: z.string().optional()
});

export const ErrorPayloadSchema = z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.string(), z.union([z.string(), z.array(z.string())]))
});

const StructuredErrorResponseSchema = z.object({
    success: z.literal(false),
    data: ErrorPayloadSchema
});

const DataMessageErrorResponseSchema = z.object({
    success: z.literal(false),
    data: z.object({
        message: z.string()
    }).passthrough()
});

const MessageErrorResponseSchema = z.object({
    success: z.literal(false),
    message: z.string()
});

export const ErrorResponseSchema = z.union([
    StructuredErrorResponseSchema,
    DataMessageErrorResponseSchema,
    MessageErrorResponseSchema
]);

export function successResponse<T extends z.ZodType>(data: T) {
    return z.object({
        success: z.literal(true),
        data
    });
}

export const MessageSchema = z.object({
    message: z.string()
});

export const DeleteEventResponseSchema = MessageSchema.meta({
    example: {
        message: "Event has been deleted"
    }
});

export const PasswordUpdatedResponseSchema = MessageSchema.meta({
    example: {
        message: "Password has been updated"
    }
});

export const ProfileDeletedResponseSchema = MessageSchema.meta({
    example: {
        message: "Profile has been deleted"
    }
});

export const StatusResponseSchema = z.object({
    message: z.string()
});

interface AuthResponseExample {
    token: string;
    _id: string;
    username: string;
    email: string;
    interests: string[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

const exampleAuthToken = "example-auth-token";

const loginAuthExample: AuthResponseExample = {
    token: exampleAuthToken,
    _id: "69e22b13ba1baa17b151ae43",
    username: "ArtSoul",
    email: "artsoul123@test.com",
    interests: [],
    active: true,
    createdAt: "2026-04-17T12:44:03.093Z",
    updatedAt: "2026-04-17T12:44:03.093Z"
};

const registerAuthExample: AuthResponseExample = {
    token: exampleAuthToken,
    _id: "69e231318a67eb4e7fc5dd4e",
    username: "ffffff",
    email: "admin123@gmail.com",
    interests: [],
    active: true,
    createdAt: "2026-04-17T13:10:09.194Z",
    updatedAt: "2026-04-17T13:10:09.194Z"
};

const userProfileExample = {
    _id: "69e22b13ba1baa17b151ae43",
    username: "ArtSoul",
    email: "artsoul123@test.com",
    interests: [],
    active: true,
    createdAt: "2026-04-17T12:44:03.093Z",
    updatedAt: "2026-04-17T12:44:03.093Z"
};

function userResponseSchema(example?: Omit<AuthResponseExample, "token">) {
    return z.looseObject({
        _id: example ? IdSchema.meta({ example: example._id }) : IdSchema,
        username: example ? z.string().meta({ example: example.username }) : z.string(),
        email: example ? z.string().meta({ example: example.email }) : z.string(),
        interests: example ? z.array(IdSchema).meta({ example: example.interests }) : z.array(IdSchema),
        active: example ? z.boolean().meta({ example: example.active }) : z.boolean(),
        createdAt: example ? z.string().meta({ example: example.createdAt }) : z.string(),
        updatedAt: example ? z.string().meta({ example: example.updatedAt }) : z.string()
    });
}

function authResponseSchema(example: AuthResponseExample) {
    return userResponseSchema(example).extend({
        token: z.string().meta({ example: example.token })
    });
}

export const UserResponseSchema = userResponseSchema();

export const ProfileResponseSchema = userResponseSchema(userProfileExample).meta({
    example: userProfileExample
});

export const LoginAuthResponseSchema = authResponseSchema(loginAuthExample);

export const RegisterAuthResponseSchema = authResponseSchema(registerAuthExample);

export const AuthResponseSchema = z.looseObject({
    _id: IdSchema,
    username: z.string(),
    email: z.string(),
    interests: z.array(IdSchema),
    active: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    token: z.string()
});

const eventTypesExample = [
    {
        _id: "69e22b13ba1baa17b151ae48",
        title: "Workshop"
    },
    {
        _id: "69e22b13ba1baa17b151ae4a",
        title: "Gathering"
    },
    {
        _id: "69e22b13ba1baa17b151ae4c",
        title: "Lecture"
    },
    {
        _id: "69e22b13ba1baa17b151ae4e",
        title: "Discussion"
    },
    {
        _id: "69e22b13ba1baa17b151ae50",
        title: "Club"
    },
    {
        _id: "69e22b13ba1baa17b151ae52",
        title: "Volunteering"
    },
    {
        _id: "69e22b13ba1baa17b151ae54",
        title: "Concert"
    },
    {
        _id: "69e22b13ba1baa17b151ae56",
        title: "Other"
    }
];

const interestsExample = [
    {
        _id: "69e22b12ba1baa17b151ae26",
        title: "Technology"
    },
    {
        _id: "69e22b12ba1baa17b151ae28",
        title: "Art"
    },
    {
        _id: "69e22b12ba1baa17b151ae2a",
        title: "Music"
    },
    {
        _id: "69e22b12ba1baa17b151ae2c",
        title: "Sports"
    },
    {
        _id: "69e22b12ba1baa17b151ae2e",
        title: "Travel"
    },
    {
        _id: "69e22b12ba1baa17b151ae30",
        title: "Food"
    },
    {
        _id: "69e22b12ba1baa17b151ae32",
        title: "Science"
    },
    {
        _id: "69e22b12ba1baa17b151ae34",
        title: "Literature"
    },
    {
        _id: "69e22b12ba1baa17b151ae36",
        title: "Gaming"
    },
    {
        _id: "69e22b12ba1baa17b151ae38",
        title: "Fitness"
    }
];

const categoriesExample = [
    {
        _id: "69e22b12ba1baa17b151ae05",
        title: "Social",
        parent: null,
        subcategories: [
            {
                _id: "69e22b12ba1baa17b151ae07",
                title: "New in town",
                parent: "69e22b12ba1baa17b151ae05"
            },
            {
                _id: "69e22b12ba1baa17b151ae0a",
                title: "Event attending",
                parent: "69e22b12ba1baa17b151ae05"
            }
        ]
    },
    {
        _id: "69e22b12ba1baa17b151ae0d",
        title: "Educating",
        parent: null,
        subcategories: [
            {
                _id: "69e22b12ba1baa17b151ae0f",
                title: "History",
                parent: "69e22b12ba1baa17b151ae0d"
            },
            {
                _id: "69e22b12ba1baa17b151ae12",
                title: "Economics",
                parent: "69e22b12ba1baa17b151ae0d"
            }
        ]
    }
];

const mediaUploadExample = {
    fieldname: "media",
    originalname: "7c94cec780e171cbcac050d10e8baf0b.jpg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    destination: "uploads/",
    filename: "1758714596270-7c94cec780e171cbcac050d10e8baf0b.jpg",
    path: "uploads/1758714596270-7c94cec780e171cbcac050d10e8baf0b.jpg",
    size: 86360
};

const CategorySummaryResponseSchema = z.looseObject({
    _id: IdSchema,
    title: z.string(),
    parent: z.union([IdSchema, z.null()]).optional()
});

export const CategoryResponseSchema = CategorySummaryResponseSchema.extend({
    subcategories: z.array(CategorySummaryResponseSchema).optional()
});

export const InterestResponseSchema = z.looseObject({
    _id: IdSchema,
    title: z.string()
});

export const InterestsResponseSchema = z.array(InterestResponseSchema).meta({
    example: interestsExample
});

export const EventTypeResponseSchema = z.looseObject({
    _id: IdSchema,
    title: z.string()
});

export const EventTypesResponseSchema = z.array(EventTypeResponseSchema).meta({
    example: eventTypesExample
});

export const CategoriesResponseSchema = z.array(CategoryResponseSchema).meta({
    example: categoriesExample
});

export const MediaUploadResponseSchema = z.looseObject({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
    size: z.number()
}).meta({ example: mediaUploadExample });

const eventListExample = {
    location: {
        type: "Point",
        coordinates: [-122.4194, 37.7749]
    },
    fee: {
        amount: 25,
        currency: "USD"
    },
    _id: "69e22b13ba1baa17b151ae5f",
    title: "Tech Startup Networking Night",
    description: "An evening for founders, developers, and investors to connect and share ideas.",
    date: 1776708000,
    fullAddress: "123 Market St, San Francisco, CA 94103, USA",
    imageUrl: "http://localhost:3000/uploads/seed-events/city-connections.svg",
    categories: [
        {
            _id: "69e22b12ba1baa17b151ae05",
            title: "Social",
            parent: null
        }
    ],
    author: "69e22b12ba1baa17b151ae3f",
    maxAttendees: 120,
    active: true,
    type: {
        _id: "69e22b13ba1baa17b151ae54",
        title: "Concert"
    },
    createdAt: "2026-04-17T12:44:03.248Z"
};

const singleEventExample = {
    ...eventListExample,
    author: {
        _id: "69e22b12ba1baa17b151ae3f",
        username: "CoolChick",
        email: "coolchick123@test.com"
    }
};

const createdEventExample = {
    title: "The newest event",
    description: "We will meet and drink some wine together",
    date: "2026-05-23T18:12:32.000Z",
    fullAddress: "Prater",
    location: {
        type: "Point",
        coordinates: [16.40087, 48.21649]
    },
    imageUrl: "http://localhost:3000/uploads/1757422084506-7c94cec780e171cbcac050d10e8baf0b.jpg",
    categories: ["6928390fd7389e93704196b7"],
    author: "69283909f08c060c850ffcd3",
    attendees: ["69283909f08c060c850ffcd3"],
    maxAttendees: -1,
    fee: {
        amount: 0,
        currency: "EUR"
    },
    active: true,
    type: "692839034c7fe8b98b766765",
    _id: "69283d7d7a7c120c986d07bb",
    createdAt: "2025-11-27T12:01:01.090Z"
};

const EventLocationResponseSchema = z.looseObject({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).meta({ example: [-122.4194, 37.7749] })
});

const EventFeeResponseSchema = z.looseObject({
    amount: z.number(),
    currency: z.string()
});

const EventCategoryResponseSchema = z.looseObject({
    _id: IdSchema,
    title: z.string(),
    parent: z.union([IdSchema, z.null()]).optional()
});

const EventReferenceResponseSchema = z.looseObject({
    _id: IdSchema,
    title: z.string()
});

const EventAuthorResponseSchema = z.looseObject({
    _id: IdSchema,
    username: z.string(),
    email: z.string()
});

export const EventResponseSchema = z.looseObject({
    _id: IdSchema,
    title: z.string(),
    description: z.string(),
    date: z.union([z.number(), z.string()]),
    fullAddress: z.string(),
    imageUrl: z.string(),
    location: EventLocationResponseSchema,
    maxAttendees: z.number(),
    active: z.boolean()
});

export const EventListItemResponseSchema = EventResponseSchema.extend({
    date: z.number(),
    fee: EventFeeResponseSchema,
    categories: z.array(EventCategoryResponseSchema),
    author: IdSchema,
    type: EventReferenceResponseSchema,
    createdAt: z.string()
}).meta({ example: eventListExample });

export const EventDetailResponseSchema = EventListItemResponseSchema.extend({
    author: EventAuthorResponseSchema
}).meta({ example: singleEventExample });

export const CreatedEventResponseSchema = EventResponseSchema.extend({
    date: z.union([z.number(), z.string()]).meta({ example: createdEventExample.date }),
    fee: EventFeeResponseSchema,
    categories: z.array(IdSchema),
    author: IdSchema,
    attendees: z.array(IdSchema).optional(),
    type: IdSchema,
    createdAt: z.string()
}).meta({ example: createdEventExample });

const rsvpEventExample = {
    event: "69e22b13ba1baa17b151ae62",
    user: "69e22b13ba1baa17b151ae43",
    status: "confirmed",
    additionalGuests: 0,
    eventDate: "2026-04-06T09:00:00.000Z",
    _id: "69e496748a67eb4e7fc5dd9b",
    createdAt: "2026-04-19T08:46:44.752Z"
};

const rsvpListExample = {
    total: 1,
    entities: [
        {
            _id: "69ae8dc7805da996300bd4b1",
            event: "69ae8dc7805da996300bd4ab",
            user: {
                _id: "69ae8db6c90c31166a9f72a9",
                username: "ArtSoul",
                email: "artsoul123@test.com",
                interests: [],
                createdAt: "2026-03-09T09:07:02.948Z",
                updatedAt: "2026-03-09T09:07:02.948Z"
            },
            status: "confirmed",
            additionalGuests: 0,
            eventDate: "2026-05-09T06:34:32.000Z",
            createdAt: "2026-03-09T09:07:19.044Z"
        }
    ]
};

export const RSVPResponseSchema = z.looseObject({
    _id: IdSchema,
    event: IdSchema,
    user: IdSchema,
    status: z.string(),
    additionalGuests: z.number().optional(),
    eventDate: z.string(),
    createdAt: z.string()
}).meta({ example: rsvpEventExample });

const RSVPUserResponseSchema = z.looseObject({
    _id: IdSchema,
    username: z.string(),
    email: z.string(),
    interests: z.array(IdSchema).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

export const RSVPListItemResponseSchema = RSVPResponseSchema.extend({
    user: RSVPUserResponseSchema
});

export const RSVPListResponseSchema = z.object({
    total: z.number(),
    entities: z.array(RSVPListItemResponseSchema)
}).meta({ example: rsvpListExample });
