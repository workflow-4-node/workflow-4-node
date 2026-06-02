import type { ActiveDelay, InstanceHeader, WakeupableItem } from './KnownInstaStore.js';

export type LockInfo = {
    id: string;
    name: string;
    heldTo: Date;
};

export type PersistedState = {
    instanceId: string;
    createdOn: Date;
    workflowName: string;
    workflowVersion: number;
    updatedOn: Date;
    state: string;
    promotedProperties?: Record<string, unknown>;
    activeDelays?: ActiveDelay[];
};

/**
 * Interface for a raw persistence implementation.
 * Implementations provide the actual storage
 * and locking backend.
 */
export interface WorkflowPersistence {
    enterLock(lockName: string, inLockTimeoutMs: number): Promise<LockInfo | null>;
    renewLock(lockId: string, inLockTimeoutMs: number): Promise<void>;
    exitLock(lockId: string): Promise<void>;
    isRunning(workflowName: string, instanceId: string): Promise<boolean>;
    persistState(state: PersistedState): Promise<void>;
    getRunningInstanceIdHeader(workflowName: string, instanceId: string): Promise<InstanceHeader | null>;
    loadState(workflowName: string, instanceId: string): Promise<PersistedState>;
    removeState(workflowName: string, instanceId: string, succeeded: boolean, error?: string): Promise<void>;
    loadPromotedProperties(workflowName: string, instanceId: string): Promise<Record<string, unknown> | null>;
    getNextWakeupables(count: number): Promise<WakeupableItem[]>;
    getRunningInstanceHeadersForOtherVersion(workflowName: string, version: number): Promise<InstanceHeader[]>;
}
