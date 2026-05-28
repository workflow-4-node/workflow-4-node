import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Or extends Activity {
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
        if (Array.isArray(result)) {
            for (const v of result) {
                isTrue = (v ? true : false) || isTrue;
            }
        }

        if (isTrue) {
            callContext.schedule(this.isTrue, 'done');
        } else {
            callContext.schedule(this.isFalse, 'done');
        }
    }

    done(callContext: CallContext, reason: ActivityState, result?: unknown): void {
        callContext.end(reason, result);
    }
}
