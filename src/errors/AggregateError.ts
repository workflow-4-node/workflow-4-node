import { ActivityRuntimeError } from './ActivityRuntimeError.js';

export class AggregateError extends ActivityRuntimeError {
    errors: Error[];

    constructor(errors: Error[], innerErr?: Error) {
        const message = errors.length ? `Many errors occurred. First: ${errors[0].message}` : 'Many errors occurred.';
        super(message, innerErr);
        this.errors = errors;
    }
}
