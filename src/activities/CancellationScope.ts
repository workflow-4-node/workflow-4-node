import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { Block } from './Block.js';
import { type CallContext } from './runtime/CallContext.js';
import { CancelledError } from '../errors/CancelledError.js';

export class CancellationScope extends Activity {
    cancelled: unknown = null;

    private _body: Block | null = null;

    constructor() {
        super();
        this.arrayProperties.add('cancelled');
    }

    async initializeStructure(): Promise<void> {
        this._body = new Block();
        this._body.args = this.args;
        this.args = [];

        if (this.cancelled) {
            const prev = this.cancelled;
            this.cancelled = new Block();
            (this.cancelled as Block).args = prev as unknown[];
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
        if (this.cancelled && (reason === ActivityState.cancel || (reason === ActivityState.fail && result instanceof CancelledError))) {
            callContext.schedule(this.cancelled, 'cancelledFinished');
        } else {
            callContext.end(reason, result);
        }
    }

    cancelledFinished(callContext: CallContext, reason: ActivityState, result?: unknown) {
        callContext.end(reason, result);
    }
}
