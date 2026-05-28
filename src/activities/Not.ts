import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Not extends Activity {
    isTrue: unknown = true;
    isFalse: unknown = false;

    run(callContext: CallContext, args: unknown[]): void {
        callContext.schedule(args, 'argsGot');
    }

    argsGot(callContext: CallContext, reason: ActivityState, result: unknown): void {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        let isTrue = false;
        if (Array.isArray(result) && result.length > 0) {
            isTrue = result[0] ? true : false;
        }

        if (isTrue) {
            callContext.schedule(this.isFalse, 'done');
        } else {
            callContext.schedule(this.isTrue, 'done');
        }
    }

    done(callContext: CallContext, reason: ActivityState, result?: unknown): void {
        callContext.end(reason, result);
    }
}
