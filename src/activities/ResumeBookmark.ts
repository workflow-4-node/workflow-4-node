import { ActivityState } from '../common/enums.js';
import { ValidationError } from '../errors/ValidationError.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';

const validReasons: ActivityState[] = [ActivityState.complete, ActivityState.fail, ActivityState.cancel];

export class ResumeBookmark extends Activity {
    bookmarkName: string = '';
    reason: string = ActivityState.complete;
    mustExists: boolean = true;

    run(callContext: CallContext, args: unknown[]) {
        const bookmarkName = this.bookmarkName;
        const reason = this.reason as ActivityState;

        if (!bookmarkName) {
            callContext.fail(new ValidationError('Bookmark name expected.'));
            return;
        }

        if (!validReasons.includes(reason)) {
            callContext.fail(new ValidationError("Reason value '" + reason + "' is not valid."));
            return;
        }

        let result = false;
        if (this.mustExists) {
            callContext.resumeBookmark(bookmarkName, reason, args);
            result = true;
        } else {
            if (callContext.executionContext.isBookmarkExists(bookmarkName)) {
                callContext.resumeBookmark(bookmarkName, reason, args);
                result = true;
            }
        }

        callContext.complete(result);
    }
}
