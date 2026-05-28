import { ActivityState } from '../common/enums.js';
import { Declarator } from './Declarator.js';
import { type CallContext } from './runtime/CallContext.js';

export class Block extends Declarator {
    private _todo?: unknown[];

    varsDeclared(callContext: CallContext, args: unknown[]) {
        const todo: unknown[] = [];
        this._todo = todo;

        if (args.length) {
            for (let i = args.length - 1; i >= 1; i--) {
                todo.push(args[i]);
            }
            callContext.schedule(args[0], 'argGot');
        } else {
            callContext.complete();
        }
    }

    argGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        const todo = this._todo;

        if (reason === ActivityState.complete) {
            if (!todo || todo.length === 0) {
                callContext.complete(result);
            } else {
                callContext.schedule(todo.pop(), 'argGot');
            }
        } else {
            callContext.end(reason, result);
        }
    }
}
