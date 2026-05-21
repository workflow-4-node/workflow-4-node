import { type ActivityState } from '../common/enums.js';
import { Declarator } from './Declarator.js';
import { type CallContext } from './runtime/CallContext.js';

export class Parallel extends Declarator {
    varsDeclared(callContext: CallContext, args: unknown[]) {
        if (args && args.length) {
            callContext.schedule(args, 'argsGot');
        } else {
            callContext.complete([]);
        }
    }

    argsGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        callContext.end(reason, result);
    }
}
