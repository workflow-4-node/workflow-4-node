import type { ActivityState } from '../common/enums.js';
import { ValidationError } from '../errors/ValidationError.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class EndMethod extends Activity {
    methodName: string | null = null;
    instanceIdPath: string | null = null;
    result: unknown = null;

    run(callContext: CallContext, _args: unknown[]): void {
        const methodName = this.methodName;
        if (typeof methodName === 'string') {
            const mn = methodName.trim();
            if (mn) {
                callContext.schedule(this.result, 'resultGot');
                return;
            }
        }
        callContext.fail(new ValidationError("EndMethod activity methodName property's value must be a valid identifier."));
    }

    resultGot(callContext: CallContext, reason: ActivityState, result: unknown): void {
        callContext.end(reason, result);
    }
}
