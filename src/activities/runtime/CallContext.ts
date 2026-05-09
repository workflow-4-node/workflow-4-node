import type { Activity } from '../Activity.js';
import type { ActivityExecutionContext } from './ActivityExecutionContext.js';
import type { ActivityExecutionState } from './ActivityExecutionState.js';
import type { SimpleProxy } from '../../common/SimpleProxy.js';

export interface CallContext {
    readonly instanceId: string;
    readonly activity: Activity;
    readonly executionContext: ActivityExecutionContext;
    readonly executionState: ActivityExecutionState;
    readonly scope: SimpleProxy;
    readonly parentActivityId: string | null;

    next(childActivityOrActivityId: Activity | string, variables?: Record<string, unknown>): CallContext;
    back(keepScope?: boolean): CallContext | null;
    complete(result?: unknown): void;
    cancel(): void;
    idle(): void;
    fail(e: Error): void;
    end(reason: string, result?: unknown): void;
    schedule(obj: Activity, endcallback: string): void;
    createBookmark(name: string, callback: string): void;
    resumeBookmark(name: string, reason: string, result: unknown): void;
}
