import { ActivityState } from '../common/enums.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';
import assert from 'node:assert';

export class Merge extends Activity {
    run(callContext: CallContext, args: unknown[]): void {
        callContext.schedule(args, 'argsGot');
    }

    argsGot(callContext: CallContext, reason: ActivityState, result: unknown): void {
        if (reason !== ActivityState.complete) {
            callContext.end(reason, result);
            return;
        }

        assert(Array.isArray(result), 'Merge activity expects an array of objects or arrays as input.');

        let merged: unknown[] | Record<string, unknown> | undefined;
        let mergedIsObj = false;
        let mergedIsArray = false;

        for (const item of result) {
            const isObj = typeof item === 'object' && item !== null && !Array.isArray(item);
            const isArray = Array.isArray(item);

            if (isObj || isArray) {
                if (!merged) {
                    merged = isObj ? { ...(item as Record<string, unknown>) } : [...(item as unknown[])];
                    mergedIsObj = isObj;
                    mergedIsArray = isArray;
                } else if (isObj) {
                    if (!mergedIsObj) {
                        callContext.fail(new Error('Object cannot be merged with an array.'));
                        return;
                    }
                    Object.assign(merged as Record<string, unknown>, item as Record<string, unknown>);
                } else {
                    if (!mergedIsArray) {
                        callContext.fail(new Error('Array cannot be merged with an object.'));
                        return;
                    }
                    (merged as unknown[]).push(...(item as unknown[]));
                }
            } else {
                callContext.fail(new Error('Only objects and arrays can be merged.'));
                return;
            }
        }

        callContext.complete(merged);
    }
}
