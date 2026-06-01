import type { Activity } from './Activity.js';
import { CustomActivity } from './CustomActivity.js';
import { type ActivityExecutionContext } from './runtime/ActivityExecutionContext.js';

export class Method extends CustomActivity {
    constructor() {
        super();

        this.declareReservedProperty('canCreateInstance', false);
        this.declareReservedProperty('methodName', null);
        this.declareReservedProperty('instanceIdPath', '');
    }

    canCreateInstance: boolean = false;
    methodName: string | null = null;
    instanceIdPath: string | null = null;
    result: unknown = null;

    protected async createImplementation(_execContext: ActivityExecutionContext): Promise<Activity | Record<string, unknown>> {
        return {
            '@block': {
                id: '_methodBlock',
                a: null,
                args: [
                    {
                        '@beginMethod': {
                            canCreateInstance: this.canCreateInstance,
                            methodName: this.methodName,
                            instanceIdPath: this.instanceIdPath,
                            '@to': 'a',
                        },
                    },
                    {
                        '@endMethod': {
                            methodName: this.methodName,
                            result: '= this._methodBlock.$parent.result',
                        },
                    },
                    '= this.a',
                ],
            },
        };
    }
}
