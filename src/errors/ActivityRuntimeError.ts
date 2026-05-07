import { W4NError } from './W4NError.js';

export class ActivityRuntimeError extends W4NError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
