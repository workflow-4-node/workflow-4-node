import { WorkflowError } from './WorkflowError.js';

export class MethodNotFoundError extends WorkflowError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
