import * as _ from 'es-toolkit';
import { Activity } from './Activity.js';
import { ActivityRuntimeError } from '../errors/ActivityRuntimeError.js';
import { type CallContext } from './runtime/CallContext.js';

export class Expression extends Activity {
    // _f is a backing field for the cached compiled function — underscore is intentional
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
                const result = f.call(callContext.activity, _);
                if (result === callContext.activity) {
                    callContext.fail(new ActivityRuntimeError("Expression can't reference itself."));
                    return;
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
