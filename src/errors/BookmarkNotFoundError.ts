import { ActivityRuntimeError } from './ActivityRuntimeError.js';

export class BookmarkNotFoundError extends ActivityRuntimeError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
