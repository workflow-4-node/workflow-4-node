import { promiseHelpers } from '../common/promiseHelpers.js';
import { LockError } from '../errors/index.js';
import type { InstanceHeader, WakeupableItem } from './KnownInstaStore.js';
import type { LockInfo, PersistedState, WorkflowPersistence } from './WorkflowPersistence.js';

/**
 * Wraps a {@link WorkflowPersistence} implementation and adds
 * retry-on-null semantics to `enterLock` (mirroring the behaviour
 * of the original JS `WorkflowPersistence` class).
 */
export class WorkflowPersistenceSocket implements WorkflowPersistence {
    constructor(
        private readonly impl: WorkflowPersistence,
        private readonly enterLockTimeoutMs: number,
    ) {}

    async enterLock(lockName: string, inLockTimeoutMs: number): Promise<LockInfo | null> {
        return promiseHelpers.retryFor(
            async () => {
                const lockInfo = await this.impl.enterLock(lockName, inLockTimeoutMs);
                if (!lockInfo) {
                    throw new LockError(`Entering lock '${lockName}' has timed out.`);
                }
                return lockInfo;
            },
            this.enterLockTimeoutMs,
            { minInterval: 250, maxInterval: 3000 },
            (err) => err instanceof LockError,
        );
    }

    async renewLock(lockId: string, inLockTimeoutMs: number): Promise<void> {
        return this.impl.renewLock(lockId, inLockTimeoutMs);
    }

    async exitLock(lockId: string): Promise<void> {
        return this.impl.exitLock(lockId);
    }

    async isRunning(workflowName: string, instanceId: string): Promise<boolean> {
        return this.impl.isRunning(workflowName, instanceId);
    }

    async persistState(state: PersistedState): Promise<void> {
        return this.impl.persistState(state);
    }

    async getRunningInstanceIdHeader(workflowName: string, instanceId: string): Promise<InstanceHeader | null> {
        return this.impl.getRunningInstanceIdHeader(workflowName, instanceId);
    }

    async loadState(workflowName: string, instanceId: string): Promise<PersistedState> {
        return this.impl.loadState(workflowName, instanceId);
    }

    async removeState(workflowName: string, instanceId: string, succeeded: boolean, error?: string): Promise<void> {
        return this.impl.removeState(workflowName, instanceId, succeeded, error);
    }

    async loadPromotedProperties(workflowName: string, instanceId: string): Promise<Record<string, unknown> | null> {
        return this.impl.loadPromotedProperties(workflowName, instanceId);
    }

    async getNextWakeupables(count: number): Promise<WakeupableItem[]> {
        return this.impl.getNextWakeupables(count);
    }

    async getRunningInstanceHeadersForOtherVersion(workflowName: string, version: number): Promise<InstanceHeader[]> {
        return this.impl.getRunningInstanceHeadersForOtherVersion(workflowName, version);
    }
}
