import { scopeSerializer } from '../../../src/activities/runtime/scopeSerializer.js';
import { ScopeNode } from '../../../src/activities/runtime/ScopeNode.js';
import { constants } from '../../../src/common/constants.js';
import type { Activity } from '../../../src/activities/Activity.js';
import { ExtensibleSet } from '../../../src/common/ExtensibleSet.js';
import type { ActivityExecutionContext } from '../../../src/activities/runtime/ActivityExecutionContext.js';
import type { SerializedScopeNode } from '../../../src/activities/runtime/ScopeNode.js';

function mockActivity(overrides: Partial<Activity> = {}): Activity {
    const id = `act-${Math.random().toString(36).slice(2, 8)}`;
    return {
        instanceId: id,
        id,
        nonSerializedProperties: new ExtensibleSet(),
        complete: () => {},
        cancel: () => {},
        idle: () => {},
        fail: () => {},
        end: () => {},
        schedule: () => {},
        createScopePart: () => ({}),
        ...overrides,
    } as Activity;
}

function mockExecContext(): ActivityExecutionContext {
    return {} as ActivityExecutionContext;
}

describe('scopeSerializer', () => {
    describe('serialize', () => {
        it('should return empty state for an empty node list', () => {
            const result = scopeSerializer.serialize(mockExecContext(), () => mockActivity(), false, []);
            expect(result.state).toEqual([]);
            expect(result.promotedProperties).toBeNull();
        });

        it('should skip the initial scope node', () => {
            const initial = new ScopeNode(constants.ids.initialScope, { system: true });
            const result = scopeSerializer.serialize(mockExecContext(), () => mockActivity(), false, [initial]);
            expect(result.state).toEqual([]);
        });

        it('should serialize a simple node', () => {
            const act = mockActivity({ instanceId: 'n1' });
            const node = new ScopeNode('n1', { msg: 'hello' }, undefined, act);

            const result = scopeSerializer.serialize(mockExecContext(), (id) => (id === 'n1' ? act : mockActivity()), false, [node]);

            expect(result.state).toHaveLength(1);
            expect(result.state[0].instanceId).toBe('n1');
            expect(result.state[0].userId).toBeUndefined();
            expect(result.state[0].parentId).toBeNull();
            expect(result.state[0].parts).toHaveLength(1);
            expect(result.state[0].parts[0]).toEqual({ name: 'msg', value: 'hello' });
        });

        it('should skip nonSerializedProperties', () => {
            const act = mockActivity({
                instanceId: 'n1',
                nonSerializedProperties: new ExtensibleSet(new Set(['secret'])),
            });
            const node = new ScopeNode('n1', { visible: 'yes', secret: 'hidden' }, undefined, act);

            const result = scopeSerializer.serialize(mockExecContext(), () => act, false, [node]);

            const partNames = result.state[0].parts.map((p: any) => p.name || p);
            expect(partNames).toContain('visible');
            expect(partNames).not.toContain('secret');
        });

        it('should include parentId for child nodes', () => {
            const act = mockActivity({ instanceId: 'child' });
            const parent = new ScopeNode('parent', {});
            const child = new ScopeNode('child', { data: 1 }, undefined, act);
            child.parent = parent;

            const result = scopeSerializer.serialize(mockExecContext(), (id) => (id === 'child' ? act : mockActivity()), false, [child]);

            expect(result.state[0].parentId).toBe('parent');
        });

        it('should handle promotedProperties', () => {
            const act = mockActivity({
                instanceId: 'n1',
            }) as any;
            act.promotedProperties = new ExtensibleSet(new Set(['color']));
            const node = new ScopeNode('n1', { color: 'red', other: 42 }, undefined, act);

            const result = scopeSerializer.serialize(mockExecContext(), () => act, true, [node]);

            expect(result.promotedProperties).toEqual({ color: 'red' });
        });
    });

    describe('deserializeNodes', () => {
        it('should deserialize a single node from JSON', () => {
            const act = mockActivity({ instanceId: 'n1' });
            const json: SerializedScopeNode[] = [
                { instanceId: 'n1', userId: undefined, parentId: null, parts: [{ name: 'msg', value: 'hello' }] },
            ];

            const nodes = [...scopeSerializer.deserializeNodes((id) => (id === 'n1' ? act : mockActivity()), json)];

            expect(nodes).toHaveLength(1);
            expect(nodes[0].instanceId).toBe('n1');
            expect(nodes[0].scopePart).toEqual({ msg: 'hello' });
            expect(nodes[0].activity).toBe(act);
        });

        it('should deserialize multiple nodes', () => {
            const act1 = mockActivity({ instanceId: 'a' });
            const act2 = mockActivity({ instanceId: 'b' });
            const json: SerializedScopeNode[] = [
                { instanceId: 'a', userId: 'user1', parentId: null, parts: [] },
                { instanceId: 'b', userId: undefined, parentId: 'a', parts: [] },
            ];

            const nodes = [...scopeSerializer.deserializeNodes((id) => (id === 'a' ? act1 : id === 'b' ? act2 : mockActivity()), json)];

            expect(nodes).toHaveLength(2);
            expect(nodes[0].userId).toBe('user1');
            expect(nodes[1].instanceId).toBe('b');
        });
    });

    describe('round-trip', () => {
        it('should serialize and deserialize back to the same scope state', () => {
            const act = mockActivity({ instanceId: 'n1' });
            const node = new ScopeNode('n1', { greeting: 'hi', count: 5 }, 'my-user', act);

            const serialized = scopeSerializer.serialize(mockExecContext(), () => act, false, [node]);
            const deserialized = [...scopeSerializer.deserializeNodes(() => act, serialized.state)];

            expect(deserialized).toHaveLength(1);
            expect(deserialized[0].instanceId).toBe('n1');
            expect(deserialized[0].scopePart).toEqual({ greeting: 'hi', count: 5 });
            expect(deserialized[0].userId).toBe('my-user');
            expect(deserialized[0].activity).toBe(act);
        });
    });

    describe('handler registration', () => {
        it('should have pre-installed handlers', () => {
            expect(scopeSerializer.handlers.length).toBeGreaterThanOrEqual(4);
        });

        it('should install a new handler', () => {
            const before = scopeSerializer.handlers.length;
            scopeSerializer.installHandler({
                serialize() {
                    return false;
                },
                deserialize() {
                    return false;
                },
            });
            expect(scopeSerializer.handlers.length).toBe(before + 1);
        });
    });
});
