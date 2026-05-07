import { W4NError } from './W4NError.js';

export class ActivityStateExceptionError extends W4NError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
