import { W4NError } from './W4NError.js';

export class TypeError extends W4NError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
