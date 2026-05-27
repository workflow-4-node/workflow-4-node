import { type ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { ActivityRuntimeError } from '../errors/ActivityRuntimeError.js';
import { Declarator } from './Declarator.js';
import { activityMarkup } from './runtime/activityMarkup.js';
import { type ActivityExecutionContext } from './runtime/ActivityExecutionContext.js';
import { type CallContext } from './runtime/CallContext.js';

export abstract class CustomActivity extends Declarator {
    constructor() {
        super();

        this.reservedProperties.add('implementation');
        this.nonSerializedProperties.add('implementation');
        this.hideFromScopeProperties.add('createImplementation');
        this.hideFromScopeProperties.add('ensureImplementationCreated');
        this.hideFromScopeProperties.add('implementationCompleted');
    }

    private implementation: Activity | null = null;

    /** Override to return an activity or activity markup object that implements this activity's behavior. */
    protected abstract createImplementation(_execContext: ActivityExecutionContext): Promise<Activity | Record<string, unknown>>;

    async initializeStructure(execContext: ActivityExecutionContext): Promise<void> {
        await this.ensureImplementationCreated(execContext);
    }

    run(callContext: CallContext, args: unknown[]): void {
        if (!(this.implementation instanceof Activity)) {
            throw new ActivityRuntimeError("Custom activity's implementation is not available.");
        }
        Declarator.prototype.run.call(this, callContext, args);
    }

    varsDeclared(callContext: CallContext, _args: unknown[]): void {
        callContext.schedule(this.implementation, 'implInvoked');
    }

    implInvoked(callContext: CallContext, reason: ActivityState, result: unknown): void {
        (callContext.activity as CustomActivity).implementationCompleted.call(this, callContext, reason, result);
    }

    implementationCompleted(callContext: CallContext, reason: ActivityState, result: unknown): void {
        callContext.end(reason, result);
    }

    private async ensureImplementationCreated(execContext: ActivityExecutionContext): Promise<void> {
        if (this.implementation !== null) {
            return;
        }
        let result = await this.createImplementation(execContext);
        if (typeof result === 'object' && result !== null && !(result instanceof Activity) && !Array.isArray(result)) {
            result = await activityMarkup.parse(result);
        }
        if (!(result instanceof Activity)) {
            throw new ActivityRuntimeError("Method 'createImplementation' must return an Activity.");
        }
        this.implementation = result;
    }
}
