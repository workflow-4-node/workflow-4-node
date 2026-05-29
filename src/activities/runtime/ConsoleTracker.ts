import { inspect } from 'node:util';
import { ActivityState } from '../../common/enums.js';
import type { ActivityStateEvent } from './ActivityExecutionState.js';
import type { ActivityStateTracker } from './ActivityStateTracker.js';

function formatResult(result: unknown): string {
    if (result instanceof Error) {
        return result.stack ?? result.message;
    }
    if (typeof result === 'object' && result !== null) {
        return inspect(result);
    }
    if (typeof result === 'string') {
        return result.length > 100 ? result.slice(0, 100) : result;
    }
    if (result === undefined || result === null) {
        return '';
    }
    if (typeof result === 'boolean' || typeof result === 'number' || typeof result === 'bigint' || typeof result === 'symbol') {
        return String(result);
    }
    return '';
}

export class ConsoleTracker implements ActivityStateTracker {
    activityStateChanged(args: ActivityStateEvent): void {
        const activity = (args.scope as Record<string, unknown>)?.['$activity'] as { toString(): string } | undefined;
        if (!activity) {
            return;
        }

        const reason = args.reason;
        const result = formatResult(args.result);

        const name = activity.toString();
        const resultStr = result ? `, result: ${result}` : '';
        const method = reason === ActivityState.fail ? 'error' : 'log';
        console[method](`Activity '${name}' state changed - reason: ${reason}${resultStr}`);
    }
}
