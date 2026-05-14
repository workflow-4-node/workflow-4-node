import * as _ from 'es-toolkit';
import { Activity } from './Activity.js';
import { ActivityRuntimeError } from '../errors/ActivityRuntimeError.js';
import { type CallContext } from './runtime/CallContext.js';

export class Expression extends Activity {
    // _f is a backing field for the cached compiled function
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    private _f: ((_: unknown) => unknown) | null = null;

    constructor(public expr?: string | null) {
        super();
        this.nonSerializedProperties.add('_f');
    }

    run(callContext: CallContext, _args: unknown[]) {
        const expr = this.expr;
        if (expr) {
            try {
                let f = this._f;
                if (!f) {
                    // eslint-disable-next-line @typescript-eslint/no-implied-eval
                    f = this._f = new Function('_', `return (${expr})`) as (_: unknown) => unknown;
                }
                // `this` is the scope proxy (Activity._start calls run.call(scope, ...)),
                // so property lookups in the expression go through the ScopeTree,
                // allowing references like `this.block.code` to resolve by userId.
                let result = f.call(this, _);
                if (result === callContext.activity) {
                    // Self-reference — try re-evaluating from the parent scope
                    const self: Record<string, any> = this as any;
                    const parent = self.$parent;
                    if (!parent) {
                        callContext.fail(new ActivityRuntimeError("Expression can't reference itself."));
                        return;
                    }
                    result = f.call(parent, _);
                }
                callContext.complete(result);
            } catch (e) {
                callContext.fail(e as Error);
            }
        } else {
            callContext.complete(null);
        }
    }
}
