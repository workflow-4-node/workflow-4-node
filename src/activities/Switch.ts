import { constants } from '../common/constants.js';
import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { Case } from './Case.js';
import { Default } from './Default.js';
import { When } from './When.js';
import { type CallContext } from './runtime/CallContext.js';
import { ActivityRuntimeError } from '../errors/ActivityRuntimeError.js';

interface SwitchParts {
    cases: Case[];
    whens: When[];
    default: Default | null;
}

export class Switch extends Activity {
    expression: unknown = null;

    private _parts: SwitchParts | null = null;
    private _doCase = false;

    run(callContext: CallContext, args: unknown[]) {
        if (args && args.length) {
            const parts: SwitchParts = {
                cases: [],
                whens: [],
                default: null,
            };
            for (const arg of args) {
                if (arg instanceof Case) {
                    parts.cases.push(arg);
                } else if (arg instanceof When) {
                    parts.whens.push(arg);
                } else if (arg instanceof Default) {
                    if (parts.default === null) {
                        parts.default = arg;
                    } else {
                        throw new ActivityRuntimeError('Multiple default for a switch is not allowed.');
                    }
                }
            }
            if (parts.cases.length || parts.whens.length || parts.default) {
                this._parts = parts;
                if (parts.cases.length) {
                    this._doCase = true;
                    callContext.schedule(this.expression, 'expressionGot');
                } else {
                    this._doCase = false;
                    this.step(callContext);
                }
                return;
            }
        }
        callContext.complete();
    }

    expressionGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            this.expression = result;
            this.step(callContext);
        } else {
            callContext.end(reason, result);
        }
    }

    private step(callContext: CallContext) {
        const parts = this._parts!;
        if (this._doCase && parts.cases.length) {
            const next = parts.cases.shift()!;
            // Pass the switch expression result as a scope variable so the Case
            // can compare against it (Cases have their own `expression` field
            // that would otherwise shadow the value inherited from the parent scope).
            callContext.schedule({ activity: next, variables: { expression: this.expression } }, 'partCompleted');
        } else if (!this._doCase && parts.whens.length) {
            const next = parts.whens.shift()!;
            callContext.schedule(next, 'partCompleted');
        } else if (parts.default) {
            callContext.schedule(parts.default, 'partCompleted');
        } else {
            callContext.complete();
        }
    }

    partCompleted(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            if (result === constants.markers.nope) {
                this.step(callContext);
            } else {
                callContext.complete(result);
            }
        } else {
            callContext.end(reason, result);
        }
    }
}
