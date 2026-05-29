import { CancelledError } from '../errors/CancelledError.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Cancel extends Activity {
    force = false;

    run(callContext: CallContext, _args: unknown[]) {
        if (this.force) {
            callContext.fail(new CancelledError());
        } else {
            callContext.cancel();
        }
    }
}
