import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Assign extends Activity {
    value: unknown = null;
    to = '';

    run(callContext: CallContext, _args: unknown[]) {
        if (this.to && this.value) {
            callContext.schedule(this.value, 'valueGot');
        } else {
            callContext.complete();
        }
    }

    valueGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            (this as any)[this.to] = result;
        }
        callContext.end(reason, result);
    }
}
