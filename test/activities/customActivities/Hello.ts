import { type ActivityExecutionContext } from '../../../src/activities/runtime/ActivityExecutionContext.js';
import { CustomActivity } from '../../../src/index.js';
import type { Activity } from '../../../src/activities/Activity.js';

export class Hello extends CustomActivity {
    to: string | null = null;

    protected async createImplementation(_execContext: ActivityExecutionContext): Promise<Activity | Record<string, unknown>> {
        // Return raw markup — the base class parses it in ensureImplementationCreated
        return {
            '@block': {
                to: '= this.to',
                args: function (this: any) {
                    return `Hello ${this.to}!`;
                },
            },
        };
    }
}
