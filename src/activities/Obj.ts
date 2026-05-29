import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Obj extends Activity {
    run(callContext: CallContext, args: unknown[]): void {
        callContext.schedule(args, 'argsGot');
    }

    argsGot(callContext: CallContext, reason: ActivityState, result: unknown): void {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        if (Array.isArray(result) && result.length > 1) {
            callContext.complete({ [String(result[0])]: result[1] });
        } else {
            callContext.complete(undefined);
        }
    }
}
