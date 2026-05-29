import { inspect } from 'node:util';
import type { ActivityStateEvent } from './runtime/ActivityExecutionState.js';
import type { ActivityStateTracker } from './runtime/ActivityStateTracker.js';

export interface TrackerEntry {
    name: string;
    reason: string;
    result: string;
}

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

export class TestTracker implements ActivityStateTracker {
    readonly entries: TrackerEntry[] = [];

    activityStateChanged(args: ActivityStateEvent): void {
        const activity = (args.scope as Record<string, unknown>)?.['$activity'] as { toString(): string } | undefined;
        if (!activity) {
            return;
        }

        this.entries.push({
            name: activity.toString(),
            reason: args.reason ?? '',
            result: formatResult(args.result),
        });
    }
}
