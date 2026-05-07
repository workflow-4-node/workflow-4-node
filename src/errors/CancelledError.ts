import { ActivityStateExceptionError } from './ActivityStateExceptionError.js';

export class CancelledError extends ActivityStateExceptionError {
    constructor(innerErr?: Error) {
        super('Activity execution has been cancelled.', innerErr);
    }
}
