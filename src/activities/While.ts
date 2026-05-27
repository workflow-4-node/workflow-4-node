import { ActivityState } from '../common/enums.js';
import { WithBody } from './WithBody.js';
import { type CallContext } from './runtime/CallContext.js';

export class While extends WithBody {
    condition: unknown = null;
    private lastBodyResult?: unknown;

    run(callContext: CallContext, _args: unknown[]) {
        const condition = this.condition;
        if (condition) {
            callContext.schedule(condition, 'conditionGot');
        } else {
            callContext.complete(undefined);
        }
    }

    conditionGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            if (!result) {
                callContext.complete(this.lastBodyResult);
            } else {
                this.runBody(callContext);
            }
        } else {
            callContext.end(reason, result);
        }
    }

    bodyCompleted(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            this.lastBodyResult = result;
            callContext.schedule(this.condition, 'conditionGot');
        } else {
            callContext.end(reason, result);
        }
    }
}
