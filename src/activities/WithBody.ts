import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { Block } from './Block.js';
import { type CallContext } from './runtime/CallContext.js';

export abstract class WithBody extends Activity {
    protected bodyBlock: Block | null = null;

    async initializeStructure(): Promise<void> {
        this.bodyBlock = new Block();
        this.bodyBlock.args = this.args;
        this.args = [];
    }

    run(callContext: CallContext, _args: unknown[]): void {
        const body = this.bodyBlock;
        if (body && body.args && body.args.length) {
            callContext.schedule(body, 'bodyCompleted');
        } else {
            this.bodyCompleted(callContext, ActivityState.complete, undefined);
        }
    }

    /** Called when the body block completes. */
    bodyCompleted(callContext: CallContext, reason: ActivityState, result?: unknown): void {
        callContext.end(reason, result);
    }

    /** Schedules the body block, used by subclasses that want to run the body explicitly. */
    protected runBody(callContext: CallContext): void {
        const body = this.bodyBlock;
        if (body && body.args && body.args.length) {
            callContext.schedule(body, 'bodyCompleted');
        } else {
            this.bodyCompleted(callContext, ActivityState.complete, undefined);
        }
    }
}
