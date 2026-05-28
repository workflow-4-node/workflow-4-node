import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class NotEquals extends Activity {
    value: unknown = null;
    to: unknown = null;
    is: unknown = true;
    isNot: unknown = false;
    strict: boolean = false;

    run(callContext: CallContext, _args: unknown[]): void {
        callContext.schedule([this.value, this.to], 'valueAndToGot');
    }

    valueAndToGot(callContext: CallContext, reason: ActivityState, result: unknown): void {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        const values = result as unknown[];
        if (this.strict ? values[0] === values[1] : values[0] === values[1]) {
            callContext.schedule(this.isNot, 'done');
        } else {
            callContext.schedule(this.is, 'done');
        }
    }

    done(callContext: CallContext, reason: ActivityState, result?: unknown): void {
        callContext.end(reason, result);
    }
}
