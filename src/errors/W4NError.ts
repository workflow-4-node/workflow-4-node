declare global {
    interface ErrorConstructor {
        captureStackTrace(target: object, constructor?: (...args: any[]) => any): void;
    }
}

export class W4NError extends Error {
    constructor(message: string, innerErr?: Error) {
        super(message);
        this.name = this.constructor.name;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor as (...args: any[]) => any);
        }

        if (innerErr) {
            this.stack = (this.stack ?? '') + '\nCaused by: ' + (innerErr.stack ?? innerErr.message);
        }
    }
}
