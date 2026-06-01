import { Block } from './Block.js';

export interface WorkflowOptions {
    name?: string;
    version?: number;
}

export class Workflow extends Block {
    constructor();
    constructor(options: WorkflowOptions);
    constructor(options?: WorkflowOptions) {
        super();

        this.declareReservedProperty('version', options?.version ?? 0);
        this.declareReservedProperty('name', options?.name ?? null);
    }

    version: number = 0;
    name: string | null = null;
}
