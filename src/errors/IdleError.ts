import { ActivityStateExceptionError } from './ActivityStateExceptionError.js';

export class IdleError extends ActivityStateExceptionError {
    constructor(message?: string, innerErr?: Error) {
        super(message ?? 'Activity is idle.', innerErr);
    }
}
