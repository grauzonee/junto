export class NotFoundError extends Error { }

export class BadInputError extends Error {
    field: string;

    constructor(field: string, message: string) {
        super(message);
        this.name = "BadInputError";
        this.field = field;
        Object.setPrototypeOf(this, BadInputError.prototype);
    }
}
