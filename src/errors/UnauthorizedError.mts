export class UnauthorizedError extends Error {
    public readonly statusCode: number;

    constructor(message: string = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401;

        // Restores correct prototype chain for built-in errors
        Object.setPrototypeOf(this, UnauthorizedError.prototype);

        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnauthorizedError);
        }
    }
}