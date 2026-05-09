import type { Activity } from '../Activity.js';
import type { ActivityExecutionState } from './ActivityExecutionState.js';
import type { CallContext } from './CallContext.js';
import type { Serializer } from '../../serialization/Serializer.js';

export interface ActivityExecutionContext {
    readonly rootActivity: Activity;

    getExecutionState(activityOrId: Activity | string): ActivityExecutionState;
    createBookmark(activityId: string, name: string, endCallback: string): void;
    isBookmarkExists(name: string): boolean;
    deleteBookmark(name: string): void;
    resumeBookmarkInScope(callContext: CallContext, name: string, reason: string, result: unknown): void;
    resumeBookmarkExternal(name: string, reason: string, result: unknown): void;
    processResumeBookmarkQueue(): void;
    getStateAndPromotions(
        serializer?: Serializer,
        enablePromotions?: boolean,
    ): { state: unknown[]; promotedProperties: Record<string, unknown> | null };
    setState(serializer: Serializer | undefined, json: unknown[]): void;
}
