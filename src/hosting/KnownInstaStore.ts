import { specStrings } from '../common/specStrings.js';
import { ActivityState } from '../common/enums.js';

export type ActiveDelay = {
    methodName: string;
    delayTo: Date;
};

export type WakeupableItem = {
    instanceId: string;
    workflowName: string;
    updatedOn?: Date;
    activeDelay: ActiveDelay;
};

export type InstanceHeader = {
    workflowName: string;
    workflowVersion: number | undefined;
    instanceId: string;
};

export interface WorkflowInstance {
    id: string;
    workflowName: string;
    workflowVersion?: number;
    version?: number;
    execState: ActivityState;
    updatedOn?: Date;
    activeDelays?: ActiveDelay[];
    addTracker(tracker: unknown): void;
}

export class KnownInstaStore {
    private readonly instances = new Map<string, WorkflowInstance>();

    add(workflowName: string, insta: WorkflowInstance): void {
        this.instances.set(specStrings.hosting.doubleKeys(workflowName, insta.id), insta);
    }

    get(workflowName: string, instanceId: string): WorkflowInstance | undefined {
        return this.instances.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    }

    exists(workflowName: string, instanceId: string): boolean {
        return this.instances.has(specStrings.hosting.doubleKeys(workflowName, instanceId));
    }

    remove(workflowName: string, instanceId: string): void {
        this.instances.delete(specStrings.hosting.doubleKeys(workflowName, instanceId));
    }

    getNextWakeupables(count: number): WakeupableItem[] {
        const now = new Date();
        const result: WakeupableItem[] = [];

        for (const insta of this.instances.values()) {
            if (insta.execState === ActivityState.idle && insta.activeDelays) {
                for (const ad of insta.activeDelays) {
                    if (ad.delayTo <= now) {
                        result.push({
                            instanceId: insta.id,
                            workflowName: insta.workflowName,
                            activeDelay: {
                                methodName: ad.methodName,
                                delayTo: ad.delayTo,
                            },
                        });
                    }
                }
            }
        }

        result.sort((i1, i2) => {
            if (i1.updatedOn !== undefined && i2.updatedOn !== undefined) {
                if (i1.updatedOn < i2.updatedOn) {
                    return -1;
                }
                if (i1.updatedOn > i2.updatedOn) {
                    return 1;
                }
            }
            if (i1.activeDelay.delayTo < i2.activeDelay.delayTo) {
                return -1;
            }
            if (i1.activeDelay.delayTo > i2.activeDelay.delayTo) {
                return 1;
            }
            return 0;
        });

        return result.slice(0, count);
    }

    getRunningInstanceHeadersForOtherVersion(workflowName: string, version: number): InstanceHeader[] {
        const result: InstanceHeader[] = [];
        for (const insta of this.instances.values()) {
            if (insta.workflowName === workflowName && insta.version !== version) {
                result.push({
                    workflowName: insta.workflowName,
                    workflowVersion: insta.workflowVersion,
                    instanceId: insta.id,
                });
            }
        }
        return result;
    }

    addTracker(tracker: unknown): void {
        for (const insta of this.instances.values()) {
            insta.addTracker(tracker);
        }
    }
}
