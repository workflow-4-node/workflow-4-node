import { ValidationError } from '../errors/ValidationError.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

export class WaitForBookmark extends Activity {
    bookmarkName: string = '';

    run(callContext: CallContext, _args: unknown[]) {
        const bookmarkName = this.bookmarkName;

        if (!bookmarkName) {
            callContext.fail(new ValidationError("WaitForBookmark activity's property 'bookmarkName' is not a non-empty string."));
            return;
        }

        callContext.createBookmark(bookmarkName, '_bmReached');
        callContext.idle();
    }

    _bmReached(callContext: CallContext, reason: string, result: unknown) {
        callContext.end(reason as any, result);
    }
}
