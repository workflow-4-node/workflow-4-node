import { WorkflowError } from './WorkflowError.js';

export class MethodIsNotAccessibleError extends WorkflowError {
    constructor(message: string, innerErr?: Error) {
        super(message, innerErr);
    }
}
