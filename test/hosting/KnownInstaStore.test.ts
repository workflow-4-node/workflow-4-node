import { KnownInstaStore } from '../../src/hosting/KnownInstaStore.js';
import { ActivityState } from '../../src/common/enums.js';
import type { WorkflowInstance, InstanceHeader } from '../../src/hosting/KnownInstaStore.js';

function createInstance(overrides: Partial<WorkflowInstance> & { id: string; workflowName: string }): WorkflowInstance {
    return {
        execState: ActivityState.complete,
        workflowVersion: undefined,
        version: undefined,
        updatedOn: undefined,
        activeDelays: undefined,
        addTracker: () => {},
        ...overrides,
    };
}

function createStore(): KnownInstaStore {
    return new KnownInstaStore();
}

describe('KnownInstaStore', () => {
    // ----- Construction -----

    it('should create an instance without throwing', () => {
        const store = new KnownInstaStore();
        expect(store).toBeInstanceOf(KnownInstaStore);
    });

    // ----- add / get -----

    it('should add and retrieve an instance', () => {
        const store = createStore();
        const insta = createInstance({ id: 'inst1', workflowName: 'wf1' });
        store.add('wf1', insta);
        expect(store.get('wf1', 'inst1')).toBe(insta);
    });

    it('should return undefined for a non-existent instance', () => {
        const store = createStore();
        expect(store.get('wf1', 'does-not-exist')).toBeUndefined();
    });

    it('should keep instances with different workflow names separate', () => {
        const store = createStore();
        const insta1 = createInstance({ id: 'inst1', workflowName: 'wf1' });
        const insta2 = createInstance({ id: 'inst1', workflowName: 'wf2' });
        store.add('wf1', insta1);
        store.add('wf2', insta2);
        expect(store.get('wf1', 'inst1')).toBe(insta1);
        expect(store.get('wf2', 'inst1')).toBe(insta2);
    });

    it('should overwrite an existing instance on re-add', () => {
        const store = createStore();
        const insta1 = createInstance({ id: 'inst1', workflowName: 'wf1' });
        const insta2 = createInstance({ id: 'inst1', workflowName: 'wf1' });
        store.add('wf1', insta1);
        store.add('wf1', insta2);
        expect(store.get('wf1', 'inst1')).toBe(insta2);
    });

    // ----- exists -----

    it('should return true for an existing instance', () => {
        const store = createStore();
        store.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1' }));
        expect(store.exists('wf1', 'inst1')).toBe(true);
    });

    it('should return false for a non-existent instance', () => {
        const store = createStore();
        expect(store.exists('wf1', 'does-not-exist')).toBe(false);
    });

    it('should return false after removal', () => {
        const store = createStore();
        store.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1' }));
        store.remove('wf1', 'inst1');
        expect(store.exists('wf1', 'inst1')).toBe(false);
    });

    // ----- remove -----

    it('should remove an existing instance without throwing', () => {
        const store = createStore();
        store.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1' }));
        expect(() => store.remove('wf1', 'inst1')).not.toThrow();
        expect(store.get('wf1', 'inst1')).toBeUndefined();
    });

    it('should not throw when removing a non-existent instance', () => {
        const store = createStore();
        expect(() => store.remove('wf1', 'does-not-exist')).not.toThrow();
    });

    it('should only remove the specified instance', () => {
        const store = createStore();
        const insta1 = createInstance({ id: 'inst1', workflowName: 'wf1' });
        const insta2 = createInstance({ id: 'inst2', workflowName: 'wf1' });
        store.add('wf1', insta1);
        store.add('wf1', insta2);
        store.remove('wf1', 'inst1');
        expect(store.get('wf1', 'inst1')).toBeUndefined();
        expect(store.get('wf1', 'inst2')).toBe(insta2);
    });

    // ----- getNextWakeupables -----

    it('should return an empty array when no idle instances with delays exist', () => {
        const store = createStore();
        const result = store.getNextWakeupables(10);
        expect(result).toEqual([]);
    });

    it('should return an empty array when instances are not idle', () => {
        const store = createStore();
        const insta = createInstance({
            id: 'inst1',
            workflowName: 'wf1',
            execState: ActivityState.complete,
            activeDelays: [{ methodName: 'm1', delayTo: new Date(2020, 1, 1) }],
        });
        store.add('wf1', insta);
        const result = store.getNextWakeupables(10);
        expect(result).toEqual([]);
    });

    it('should return wakeupable items for idle instances with expired delays', () => {
        const store = createStore();
        const past = new Date(2020, 1, 1);
        const insta = createInstance({
            id: 'inst1',
            workflowName: 'wf1',
            execState: ActivityState.idle,
            activeDelays: [{ methodName: 'm1', delayTo: past }],
        });
        store.add('wf1', insta);
        const result = store.getNextWakeupables(10);
        expect(result).toHaveLength(1);
        expect(result[0].instanceId).toBe('inst1');
        expect(result[0].workflowName).toBe('wf1');
        expect(result[0].activeDelay.methodName).toBe('m1');
        expect(result[0].activeDelay.delayTo).toEqual(past);
    });

    it('should not return idle instances with future delays', () => {
        const store = createStore();
        const future = new Date(2099, 1, 1);
        const insta = createInstance({
            id: 'inst1',
            workflowName: 'wf1',
            execState: ActivityState.idle,
            activeDelays: [{ methodName: 'm1', delayTo: future }],
        });
        store.add('wf1', insta);
        const result = store.getNextWakeupables(10);
        expect(result).toEqual([]);
    });

    it('should return all matching wakeupable items up to count', () => {
        const store = createStore();
        const past = new Date(2020, 1, 1);
        const insta1 = createInstance({
            id: 'inst1',
            workflowName: 'wf1',
            execState: ActivityState.idle,
            activeDelays: [{ methodName: 'm1', delayTo: past }],
        });
        const insta2 = createInstance({
            id: 'inst2',
            workflowName: 'wf1',
            execState: ActivityState.idle,
            activeDelays: [{ methodName: 'm2', delayTo: past }],
        });
        store.add('wf1', insta1);
        store.add('wf1', insta2);
        const result = store.getNextWakeupables(1);
        expect(result).toHaveLength(1);
    });

    it('should return multiple delays for the same instance', () => {
        const store = createStore();
        const past = new Date(2020, 1, 1);
        const insta = createInstance({
            id: 'inst1',
            workflowName: 'wf1',
            execState: ActivityState.idle,
            activeDelays: [
                { methodName: 'm1', delayTo: past },
                { methodName: 'm2', delayTo: past },
            ],
        });
        store.add('wf1', insta);
        const result = store.getNextWakeupables(10);
        expect(result).toHaveLength(2);
        expect(result[0].activeDelay.methodName).toBe('m1');
        expect(result[1].activeDelay.methodName).toBe('m2');
    });

    // ----- getRunningInstanceHeadersForOtherVersion -----

    it('should return empty when no instances exist for the workflow', () => {
        const store = createStore();
        const result = store.getRunningInstanceHeadersForOtherVersion('wf1', 1);
        expect(result).toEqual([]);
    });

    it('should return empty when all instances have the same version', () => {
        const store = createStore();
        store.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1', version: 1 }));
        store.add('wf1', createInstance({ id: 'inst2', workflowName: 'wf1', version: 1 }));
        const result = store.getRunningInstanceHeadersForOtherVersion('wf1', 1);
        expect(result).toEqual([]);
    });

    it('should return instances with different versions', () => {
        const store = createStore();
        store.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1', version: 1 }));
        store.add('wf1', createInstance({ id: 'inst2', workflowName: 'wf1', version: 2 }));
        const result = store.getRunningInstanceHeadersForOtherVersion('wf1', 1);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            workflowName: 'wf1',
            workflowVersion: undefined,
            instanceId: 'inst2',
        });
    });

    it('should ignore instances from other workflows', () => {
        const store = createStore();
        store.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1', version: 1 }));
        store.add('wf2', createInstance({ id: 'inst2', workflowName: 'wf2', version: 2 }));
        const result = store.getRunningInstanceHeadersForOtherVersion('wf1', 1);
        expect(result).toHaveLength(0);
    });

    it('should return multiple headers for different version instances', () => {
        const store = createStore();
        store.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1', version: 1 }));
        store.add('wf1', createInstance({ id: 'inst2', workflowName: 'wf1', version: 2 }));
        store.add('wf1', createInstance({ id: 'inst3', workflowName: 'wf1', version: 3 }));
        const result = store.getRunningInstanceHeadersForOtherVersion('wf1', 1);
        expect(result).toHaveLength(2);
        const ids = result.map((h: InstanceHeader) => h.instanceId).sort();
        expect(ids).toEqual(['inst2', 'inst3']);
    });

    // ----- addTracker -----

    it('should add a tracker to all instances', () => {
        const store = createStore();
        const tracker1Calls: string[] = [];
        const tracker2Calls: string[] = [];

        const insta1 = createInstance({
            id: 'inst1',
            workflowName: 'wf1',
            addTracker: (_t: unknown) => tracker1Calls.push('tracker-added'),
        });
        const insta2 = createInstance({
            id: 'inst2',
            workflowName: 'wf1',
            addTracker: (_t: unknown) => tracker2Calls.push('tracker-added'),
        });

        store.add('wf1', insta1);
        store.add('wf1', insta2);

        const tracker = { name: 'test-tracker' };
        store.addTracker(tracker);

        expect(tracker1Calls).toEqual(['tracker-added']);
        expect(tracker2Calls).toEqual(['tracker-added']);
    });

    it('should not throw when there are no instances', () => {
        const store = createStore();
        expect(() => store.addTracker({})).not.toThrow();
    });

    // ----- Isolation -----

    it('should isolate instances between separate store instances', () => {
        const store1 = createStore();
        const store2 = createStore();
        store1.add('wf1', createInstance({ id: 'inst1', workflowName: 'wf1' }));
        expect(store2.get('wf1', 'inst1')).toBeUndefined();
    });
});
