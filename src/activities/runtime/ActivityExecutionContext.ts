import type { Activity } from '../Activity.js';
import type { ActivityExecutionState } from './ActivityExecutionState.js';
import type { CallContext } from './CallContext.js';
import type { Serializer } from '../../serialization/Serializer.js';
import type { ScopeTree } from './ScopeTree.js';

export interface ActivityExecutionContext {
    readonly rootActivity: Activity;

    getExecutionState(activityOrId: Activity | string): ActivityExecutionState;
    createBookmark(activityId: string, name: string, endCallback: string): string;
    isBookmarkExists(name: string): boolean;
    deleteBookmark(name: string): void;
    noopCallbacks(bookmarkNames: string[]): void;
    resumeBookmarkInScope(callContext: CallContext, name: string, reason: string, result: unknown): Promise<boolean>;
    resumeBookmarkInternal(callContext: CallContext, name: string, reason: string, result: unknown): void;
    resumeBookmarkExternal(name: string, reason: string, result: unknown): void;
    processResumeBookmarkQueue(): boolean;
    cancelExecution(activity: Activity, ids: string[]): void;
    deleteScopeOfActivity(callContext: CallContext, activityId: string): void;
    getKnownActivity(activityId: string): Activity;
    getScopeTree(): ScopeTree;
    getStateAndPromotions(
        serializer?: Serializer,
        enablePromotions?: boolean,
    ): { state: unknown[]; promotedProperties: Record<string, unknown> | null };
    setState(serializer: Serializer | undefined, json: unknown[]): void;
}
