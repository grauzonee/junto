import messages from "@/constants/errorMessages"
export class NotFoundError extends Error {
    entity: string;

    constructor(entity: string) {
        const message = messages.response.NOT_FOUND(entity);
        super(message);
        this.name = "NotFoundError";
        this.entity = entity;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class BadInputError extends Error {
    field: string;

    constructor(field: string, message: string) {
        super(message);
        this.name = "BadInputError";
        this.field = field;
        Object.setPrototypeOf(this, BadInputError.prototype);
    }
}
