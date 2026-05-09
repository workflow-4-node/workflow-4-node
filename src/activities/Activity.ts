import type { CallContext } from './runtime/CallContext.js';

export interface Activity {
    readonly instanceId: string;
    readonly id: string;
    readonly nonSerializedProperties: Set<string>;
    readonly promotedProperties?: readonly string[];
    [key: string]: unknown;

    complete(callContext: CallContext, result?: unknown): void;
    cancel(callContext: CallContext): void;
    idle(callContext: CallContext): void;
    fail(callContext: CallContext, e: Error): void;
    end(callContext: CallContext, reason: string, result?: unknown): void;
    schedule(callContext: CallContext, obj: Activity, endcallback: string): void;
    createScopePart(): Record<string, unknown>;
}
