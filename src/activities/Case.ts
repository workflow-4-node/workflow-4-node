import { constants } from '../common/constants.js';
import { ActivityState } from '../common/enums.js';
import { WithBody } from './WithBody.js';
import { type CallContext } from './runtime/CallContext.js';

export class Case extends WithBody {
    value: unknown = null;
    expression: unknown = null;

    run(callContext: CallContext, _args: unknown[]) {
        callContext.schedule(this.value, 'valueGot');
    }

    valueGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            if (this.expression === result) {
                this.runBody(callContext);
            } else {
                callContext.complete(constants.markers.nope);
            }
        } else {
            callContext.end(reason, result);
        }
    }
}
