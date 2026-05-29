import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Throw extends Activity {
    error: unknown = null;

    run(callContext: CallContext, _args: unknown[]) {
        if (!this.error) {
            if ((this as any).Try_ReThrow !== undefined) {
                (this as any).Try_ReThrow = true;
            }
            callContext.complete();
        } else {
            callContext.schedule(this.error, 'errorGot');
        }
    }

    errorGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        let e: unknown;
        if (typeof result === 'string') {
            e = new Error(result);
        } else if (result instanceof Error) {
            e = result;
        } else {
            callContext.complete();
            return;
        }

        if ((this as any).Try_ReThrow !== undefined) {
            (this as any).Try_ReThrow = e;
            callContext.complete();
        } else {
            callContext.fail(e as Error);
        }
    }
}
