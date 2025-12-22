import { uc_first } from "@/constants/utils"
export default {
    // Errors for models
    validation: {
        NOT_EXISTS: (field: string) => `Provided ${field.toLowerCase()} does not exist`,
        NOT_EXISTS_MUL: (field: string) => `One or more ${field.toLowerCase()} do not exist`,
        IMAGE_NOT_EXISTS: (field: string) => `Invalid field ${field.toLowerCase()}, image doesn't exist`,
        NOT_CORRECT: (field: string) => uc_first(field) + " is not correct",
        PASSWORDS_EQUAL: "Passwords are equal"
    },
    // Errors for validation schemes
    http: {
        UNIQUE_VALUES: (field: string) => uc_first(field) + " field must contain unique values",
        INVALID_ID: (field: string) => uc_first(field) + " field must contain valid id",
        MUST_MATCH: (field: string) => uc_first(field) + " must match",
        MIN_LENGTH: (field: string, length: number) => uc_first(field) + ` must be at least ${length} characters long`,
        MAX_LENGTH: (field: string, length: number) => uc_first(field) + ` must be maximum ${length} characters long`,
        DATE_IN_PAST: "Date cannot be in the past",
        NO_FIELDS: "At least one field must be provided"
    },
    // Errors fro request handlers
    response: {
        EMPTY_BODY: "Empty body in not allowed",
        NOT_FOUND: (entity: string) => uc_first(entity) + " not found",
        IN_USE: (field: string) => uc_first(field) + " already in use",
        INVALID: (field: string) => `Invalid ${field.toLowerCase()}`,
        DUPLICATE_ATTEND: "The user is already attending the event",
        SERVER_ERROR: (action = "on our side", advice = "try again later") => `Error ${action.toLowerCase()}, ${advice.toLowerCase()}`
    }
}
