import { WorkflowError } from './WorkflowError.js';

export class WorkflowNotFoundError extends WorkflowError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
