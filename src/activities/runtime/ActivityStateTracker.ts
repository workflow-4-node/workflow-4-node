export interface ActivityStateTracker {
    activityStateChanged?(args: any[]): void;
    activityStateFilter?(args: any[]): boolean;
}
