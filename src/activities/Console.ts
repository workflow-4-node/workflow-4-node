import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class Console extends Activity {
    level: string = 'log';

    run(callContext: CallContext, args: unknown[]): void {
        callContext.schedule(args, 'argsGot');
    }

    argsGot(callContext: CallContext, reason: ActivityState, result: unknown): void {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        let f = console.log;
        switch (this.level) {
            case 'error':
                f = console.error;
                break;
            case 'warn':
                f = console.warn;
                break;
            case 'info':
                f = console.info;
                break;
        }

        f.apply(console, result as unknown[]);
        callContext.complete(undefined);
    }
}
