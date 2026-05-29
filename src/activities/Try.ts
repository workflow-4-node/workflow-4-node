import { ActivityState } from '../common/enums.js';

import { Activity } from './Activity.js';
import { Block } from './Block.js';
import { type CallContext } from './runtime/CallContext.js';
import { ActivityRuntimeError } from '../errors/ActivityRuntimeError.js';

export class Try extends Activity {
    varName = 'e';
    catch: unknown = null;
    finally: unknown = null;

    // Accessed by runtime engine / scope — intentionally non-private
    _body: Block | null = null;
    _originalResult?: unknown;
    _originalReason?: ActivityState;
    _catchResult?: unknown;

    constructor() {
        super();
        this.arrayProperties.add('catch');
        this.arrayProperties.add('finally');
    }

    async initializeStructure(): Promise<void> {
        this._body = new Block();
        this._body.args = this.args;
        this.args = [];

        if (this.catch) {
            const prev = this.catch;
            this.catch = new Block();
            (this.catch as Block).args = prev as unknown[];
        }
        if (this.finally) {
            const prev = this.finally;
            this.finally = new Block();
            (this.finally as Block).args = prev as unknown[];
        }
    }

    run(callContext: CallContext, _args: unknown[]) {
        if (this._body) {
            callContext.schedule(this._body, 'bodyFinished');
        } else {
            callContext.complete();
        }
    }

    bodyFinished(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (this.catch || this.finally) {
            this._originalResult = result;
            this._originalReason = reason;
            if (reason === ActivityState.fail && !(result instanceof ActivityRuntimeError) && this.catch) {
                (this as any)[this.varName] = result;
                (this as any).Try_ReThrow = false;
                callContext.schedule(this.catch, 'catchDone');
                return;
            } else if ((reason === ActivityState.fail || reason === ActivityState.complete) && this.finally) {
                callContext.schedule(this.finally, 'finallyDone');
                return;
            }
        }
        callContext.end(reason, result);
    }

    catchDone(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }
        this._catchResult = result;
        if (this.finally) {
            callContext.schedule(this.finally, 'finallyDone');
        } else {
            this.continueAfterFinally(callContext);
        }
    }

    finallyDone(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }
        this.continueAfterFinally(callContext);
    }

    continueAfterFinally(callContext: CallContext) {
        const reason = this._originalReason;
        const result = this._originalResult;
        const tryReThrow = (this as any).Try_ReThrow;
        if (reason === ActivityState.fail && tryReThrow !== undefined) {
            if (tryReThrow === true) {
                callContext.fail(result as Error);
            } else if (tryReThrow instanceof Error) {
                callContext.fail(tryReThrow);
            } else {
                callContext.complete(this._catchResult);
            }
        } else {
            callContext.end(reason!, result);
        }
    }
}
