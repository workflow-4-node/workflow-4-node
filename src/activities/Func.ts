import { ActivityState } from '../common/enums.js';
import { ValidationError } from '../errors/ValidationError.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

type CodeOrActivity = ((...args: any[]) => any) | Activity;

export class Func extends Activity {
    constructor();
    constructor(code: (...args: any[]) => any);
    constructor(code: Activity);
    constructor(public code?: CodeOrActivity) {
        super();

        this.codeProperties.add('code');
    }

    private fnArgs?: any[] | null;

    run(callContext: CallContext, args: unknown[]) {
        callContext.schedule(args, 'argsGot');
    }

    argsGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        if (!(result === undefined || result === null || Array.isArray(result))) {
            callContext.fail(new ValidationError("Func activity's property 'args' is not an array, null or undefined."));
            return;
        }

        this.fnArgs = result;

        if (this.code === null || this.code === undefined) {
            callContext.complete(undefined);
            return;
        }

        callContext.schedule(this.code, 'codeGot');
    }

    codeGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        if (!(typeof result === 'function')) {
            callContext.fail(new ValidationError("Func activity's property 'code' is not a function."));
            return;
        }

        try {
            const fResult = result.apply(this, this.fnArgs || []);
            if (fResult && typeof fResult === 'object' && typeof fResult.then === 'function') {
                fResult.then((r: any) => callContext.complete(r)).catch((err: Error) => callContext.fail(err));
            } else {
                callContext.complete(fResult);
            }
        } catch (e) {
            callContext.fail(e as Error);
        }
    }
}
