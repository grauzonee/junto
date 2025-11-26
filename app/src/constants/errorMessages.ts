export default {
    validation: {
        INVALID_ID: "",
        NOT_EXISTS: "",
    },
    http: {
        UNIQUE_VALUES: (field: string) => field + " field must contain unique values",
        INVALID_ID: (field: string) => field + " field must contain valid id",
        MUST_MATCH: (field: string) => field + " must match",
        MIN_LENGTH: (field: string, length: number) => field + ` must be at least ${length} characters long`,
        MAX_LENGTH: (field: string, length: number) => field + ` must be maximum ${length} characters long`,
        DATE_IN_PAST: "Date cannot be in the past",
        NO_FIELDS: "At least one field must be provided"
    }
}
