import { ActivityState } from '../common/enums.js';
import { WithBody } from './WithBody.js';
import { type CallContext } from './runtime/CallContext.js';

export class ForEach extends WithBody {
    items: unknown = null;
    varName = 'item';

    private remainingItems: unknown[] | null = null;
    private itemIterator: Iterator<unknown> | null = null;

    run(callContext: CallContext, _args: unknown[]) {
        const items = this.items;
        if (items !== null && items !== undefined) {
            (this as any)[this.varName] = null;
            callContext.schedule(items, 'itemsGot');
        } else {
            callContext.complete(undefined);
        }
    }

    itemsGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete && result !== undefined) {
            if (result !== null && typeof result === 'object' && 'next' in (result as any) && typeof (result as any).next === 'function') {
                this.itemIterator = result as Iterator<unknown>;
            } else {
                this.remainingItems = Array.isArray(result) ? [...result] : [result];
            }
            this.doStep(callContext);
        } else {
            callContext.end(reason, result);
        }
    }

    private doStep(callContext: CallContext, lastResult?: unknown) {
        const varName = this.varName;
        const remainingItems = this.remainingItems;
        const iterator = this.itemIterator;

        if (remainingItems && remainingItems.length) {
            const item = remainingItems[0];
            remainingItems.splice(0, 1);
            const variables: Record<string, unknown> = {};
            variables[varName] = item;
            callContext.schedule({ activity: this.bodyBlock!, variables }, 'bodyFinished');
            return;
        }

        if (iterator) {
            const next = iterator.next();
            if (!next.done) {
                const variables: Record<string, unknown> = {};
                variables[varName] = next.value;
                callContext.schedule({ activity: this.bodyBlock!, variables }, 'bodyFinished');
                return;
            }
        }

        callContext.complete(lastResult);
    }

    bodyFinished(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            this.doStep(callContext, result);
        } else {
            callContext.end(reason, result);
        }
    }
}
