import type { ActivityState } from '../common/enums.js';
import { specStrings } from '../common/specStrings.js';
import { ValidationError } from '../errors/ValidationError.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class BeginMethod extends Activity {
    canCreateInstance: boolean = false;
    methodName: string | null = null;
    instanceIdPath: string | null = null;

    run(callContext: CallContext, _args: unknown[]): void {
        const methodName = this.methodName;
        if (typeof methodName === 'string') {
            const mn = methodName.trim();
            if (mn) {
                callContext.createBookmark(specStrings.hosting.createBeginMethodBMName(mn), 'methodInvoked');
                callContext.idle();
                return;
            }
        }
        callContext.fail(
            new ValidationError("BeginMethod activity methodName property's value '" + methodName + "' must be a valid identifier."),
        );
    }

    methodInvoked(callContext: CallContext, reason: ActivityState, result: unknown): void {
        callContext.end(reason, result);
    }
}
