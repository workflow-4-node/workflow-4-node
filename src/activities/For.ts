import { ActivityState } from '../common/enums.js';
import { ValidationError } from '../errors/ValidationError.js';
import { WithBody } from './WithBody.js';
import { type CallContext } from './runtime/CallContext.js';

export class For extends WithBody {
    from: unknown = null;
    to: unknown = null;
    step: unknown = 1;
    varName = 'i';

    private _resolvedFrom: number = 0;
    private _resolvedTo: number = 0;
    private _resolvedStep: number = 1;

    run(callContext: CallContext, _args: unknown[]) {
        const from = this.from;
        const to = this.to;
        const step = this.step;
        if (from !== null && from !== undefined && to !== null && to !== undefined && step !== null && step !== undefined) {
            (this as any)[this.varName] = null;
            callContext.schedule([from, to, step], 'valuesGot');
        } else {
            callContext.complete(undefined);
        }
    }

    valuesGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            const results = result as unknown[];
            this._resolvedFrom = results[0] as number;
            this._resolvedTo = results[1] as number;
            this._resolvedStep = results[2] as number;
            this.doStep(callContext);
        } else {
            callContext.end(reason, result);
        }
    }

    private doStep(callContext: CallContext, lastResult?: unknown) {
        const varName = this.varName;
        const from = this._resolvedFrom;
        const to = this._resolvedTo;
        const step = this._resolvedStep;

        if (typeof from !== 'number') {
            callContext.fail(new ValidationError(`For activity's from value '${String(from)}' is not a number.`));
            return;
        }
        if (typeof to !== 'number') {
            callContext.fail(new ValidationError(`For activity's to value '${String(to)}' is not a number.`));
            return;
        }
        if (typeof step !== 'number') {
            callContext.fail(new ValidationError(`For activity's step value '${String(step)}' is not a number.`));
            return;
        }

        let current: number;
        if ((this as any)[varName] === null || (this as any)[varName] === undefined) {
            current = (this as any)[varName] = from;
        } else {
            current = (this as any)[varName] = (this as any)[varName] + step;
        }

        if (step >= 0 && current >= to) {
            callContext.complete(lastResult);
        } else if (step < 0 && current <= to) {
            callContext.complete(lastResult);
        } else {
            this.runBody(callContext);
        }
    }

    bodyCompleted(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            this.doStep(callContext, result);
        } else {
            callContext.end(reason, result);
        }
    }
}
