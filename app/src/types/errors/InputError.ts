import messages from "@/constants/errorMessages"

export class HttpError extends Error {
    statusCode: number;
    fieldErrors?: Record<string, string>;
    formErrors?: string[];
    constructor(message: string, statusCode: number, fieldErrors?: Record<string, string>, formErrors?: string[]) {
        super(message);
        this.fieldErrors = fieldErrors;
        this.formErrors = formErrors;
        this.name = "HttpError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

export class EmptyBodyError extends HttpError {
    constructor() {
        const message = messages.response.EMPTY_BODY;
        super(message, 400, {}, [message]);
        this.name = "EmptyBodyError";
        Object.setPrototypeOf(this, EmptyBodyError.prototype);
    }
}

export class NotFoundError extends HttpError {
    entity: string;

    constructor(entity: string) {
        const message = messages.response.NOT_FOUND(entity);
        super(message, 404, {}, [message]);
        this.name = "NotFoundError";
        this.entity = entity;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class BadInputError extends HttpError {
    field: string;

    constructor(field: string, message: string) {
        super(message, 400, { [field]: message }, []);
        this.name = "BadInputError";
        this.field = field;
        Object.setPrototypeOf(this, BadInputError.prototype);
    }
}
