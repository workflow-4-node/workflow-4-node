import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Falsy extends Activity {
    value: unknown = false;
    is: unknown = true;
    isNot: unknown = false;

    run(callContext: CallContext, _args: unknown[]): void {
        callContext.schedule(this.value, 'valueGot');
    }

    valueGot(callContext: CallContext, reason: ActivityState, result: unknown): void {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        if (result) {
            callContext.schedule(this.isNot, 'done');
        } else {
            callContext.schedule(this.is, 'done');
        }
    }

    done(callContext: CallContext, reason: ActivityState, result?: unknown): void {
        callContext.end(reason, result);
    }
}
