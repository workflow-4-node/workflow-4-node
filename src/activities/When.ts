import { constants } from '../common/constants.js';
import { ActivityState } from '../common/enums.js';
import { WithBody } from './WithBody.js';
import { type CallContext } from './runtime/CallContext.js';

export class When extends WithBody {
    condition: unknown = null;

    run(callContext: CallContext, _args: unknown[]) {
        callContext.schedule(this.condition, 'conditionGot');
    }

    conditionGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            if (result) {
                this.runBody(callContext);
            } else {
                callContext.complete(constants.markers.nope);
            }
        } else {
            callContext.end(reason, result);
        }
    }
}
