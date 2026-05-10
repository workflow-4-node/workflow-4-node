import { type ActivityStateTracker } from './ActivityStateTracker.js';

export class ActivityStateTrackerWrapper implements ActivityStateTracker {
    constructor(readonly tracker: ActivityStateTracker) {}

    activityStateChanged(args: any[]): void {
        if (this.tracker.activityStateChanged && this.activityStateFilter(args)) {
            this.tracker.activityStateChanged(args);
        }
    }

    activityStateFilter(args: any[]): boolean {
        if (this.tracker.activityStateFilter) {
            return this.tracker.activityStateFilter(args);
        }
        return true;
    }
}
