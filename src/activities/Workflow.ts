import { Block } from './Block.js';

export class Workflow extends Block {
    constructor(name?: string) {
        super();

        this.declareReservedProperty('name', name ?? null);
    }

    name: string | null = null;
}
