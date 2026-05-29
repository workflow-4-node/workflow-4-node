import type { ActivityStateEvent } from './ActivityExecutionState.js';

export interface ActivityStateTracker {
    activityStateChanged?(args: ActivityStateEvent): void;
    activityStateFilter?(args: ActivityStateEvent): boolean;
}
