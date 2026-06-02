import { KeepAlive } from './KeepAlive.js';
import type { LockInfo, WorkflowPersistence } from './WorkflowPersistence.js';

export class KeepLockAlive extends KeepAlive {
    constructor(persistence: WorkflowPersistence, lockInfo: LockInfo, inLockTimeout: number, renewPeriod: number) {
        super(async () => await persistence.renewLock(lockInfo.id, inLockTimeout), renewPeriod);
    }
}
