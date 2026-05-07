import { W4NError } from './W4NError.js';

export class ActivityMarkupError extends W4NError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
