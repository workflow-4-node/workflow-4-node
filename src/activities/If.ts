import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { Block } from './Block.js';
import { type CallContext } from './runtime/CallContext.js';

export class If extends Activity {
    condition: unknown = null;
    then: unknown = null;
    else: unknown = null;

    constructor() {
        super();
        this.arrayProperties.add('then');
        this.arrayProperties.add('else');
    }

    async initializeStructure(): Promise<void> {
        if (this.then) {
            const prev = this.then;
            this.then = new Block();
            (this.then as Block).args = prev as unknown[];
        }
        if (this.else) {
            const prev = this.else;
            this.else = new Block();
            (this.else as Block).args = prev as unknown[];
        }
    }

    run(callContext: CallContext, _args: unknown[]) {
        if (this.condition) {
            callContext.schedule(this.condition, 'conditionGot');
        } else {
            callContext.complete();
        }
    }

    conditionGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            if (result) {
                if (this.then) {
                    callContext.schedule(this.then, 'bodyFinished');
                    return;
                }
            } else {
                if (this.else) {
                    callContext.schedule(this.else, 'bodyFinished');
                    return;
                }
            }
            callContext.complete();
        } else {
            callContext.end(reason, result);
        }
    }

    bodyFinished(callContext: CallContext, reason: ActivityState, result?: unknown) {
        callContext.end(reason, result);
    }
}
