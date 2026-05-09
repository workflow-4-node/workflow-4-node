import { ScopeTree } from '../../../src/activities/runtime/ScopeTree.js';
import { ScopeNode } from '../../../src/activities/runtime/ScopeNode.js';
import { Expression } from '../../../src/activities/Expression.js';
import { constants } from '../../../src/common/constants.js';
import type { Activity } from '../../../src/activities/Activity.js';
import { type ActivityExecutionContext } from '../../../src/index.js';

function mockActivity(overrides: Partial<Activity> = {}): Activity {
    const id = `act-${Math.random().toString(36).slice(2, 8)}`;
    return {
        instanceId: id,
        id,
        nonSerializedProperties: new Set(),
        complete: () => {},
        cancel: () => {},
        idle: () => {},
        fail: () => {},
        end: () => {},
        schedule: () => {},
        createScopePart: () => ({}),
        ...overrides,
    };
}

function createTree(initialScope: Record<string, any> = {}): ScopeTree {
    return new ScopeTree(initialScope, (id: string) => mockActivity({ instanceId: id }));
}

describe('ScopeTree', () => {
    describe('constructor', () => {
        it('should create a tree with an initial scope node', () => {
            const tree = createTree({ env: 'test' });
            const proxy = tree.find(constants.ids.initialScope);
            expect(proxy).toBeDefined();
        });
    });

    describe('find', () => {
        it('should find a node by its instanceId', () => {
            const tree = createTree();
            const proxy = tree.next(constants.ids.initialScope, 'child-1', { data: 123 }, undefined);
            expect(proxy).toBeDefined();

            const found = tree.find('child-1');
            expect(found).toBeDefined();
        });

        it('should throw for non-existent node', () => {
            const tree = createTree();
            expect(() => tree.find('nope')).toThrow('not found');
        });
    });

    describe('findPart', () => {
        it('should return the scopePart for a non-initial node', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'child-1', { color: 'blue' });
            const part = tree.findPart('child-1');
            expect(part).toEqual({ color: 'blue' });
        });

        it('should return null for the initial scope', () => {
            const tree = createTree();
            const part = tree.findPart(constants.ids.initialScope);
            expect(part).toBeNull();
        });
    });

    describe('next / back', () => {
        it('should create a child scope via next', () => {
            const tree = createTree();
            const proxy = tree.next(constants.ids.initialScope, 'child-1', { x: 1 }, 'test-user');
            expect(proxy).toBeDefined();

            const part = tree.findPart('child-1');
            expect(part).toEqual({ x: 1 });
        });

        it('should go back to parent scope via back', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'child-1', { x: 1 });
            const backProxy = tree.back('child-1');
            expect(backProxy).toBeDefined();
        });

        it('should throw when going back from initial scope', () => {
            const tree = createTree();
            expect(() => tree.back(constants.ids.initialScope)).toThrow('Cannot go back');
        });

        it('should keep the child node when keepItem is true', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'child-1', { x: 1 });
            tree.back('child-1', true);

            // Node should still exist — we can still find its scope part
            const part = tree.findPart('child-1');
            expect(part).toEqual({ x: 1 });
        });

        it('should remove the child node when keepItem is false', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'child-1', { x: 1 });
            tree.back('child-1', false);

            expect(() => tree.find('child-1')).toThrow('not found');
        });
    });

    describe('hasProperty', () => {
        it('should find a property on the current node', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', { myProp: 42 });
            const node = (tree as any).nodes.get('n1') as ScopeNode;
            expect(tree.hasProperty(node, 'myProp')).toBe(true);
        });

        it('should find a property by walking up the tree', () => {
            const tree = createTree();
            // Create parent and child scopes via next
            tree.next(constants.ids.initialScope, 'parent', { shared: 'value' });
            const parentNode = (tree as any).nodes.get('parent') as ScopeNode;

            // Manually create child and link
            const childAct = mockActivity({ instanceId: 'child' });
            const child = new ScopeNode('child', { own: 'local' }, undefined, childAct);
            child.parent = parentNode;

            expect(tree.hasProperty(child, 'own')).toBe(true);
            expect(tree.hasProperty(child, 'shared')).toBe(true);
        });

        it('should detect $activity', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', {});
            const node = (tree as any).nodes.get('n1') as ScopeNode;
            expect(tree.hasProperty(node, '$activity')).toBe(true);
        });

        it('should detect $parent when not at root', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'parent', {});
            const parentNode = (tree as any).nodes.get('parent') as ScopeNode;
            const childAct = mockActivity({ instanceId: 'child' });
            const child = new ScopeNode('child', {}, undefined, childAct);
            child.parent = parentNode;

            expect(tree.hasProperty(child, '$parent')).toBe(true);
        });

        it('should not have $parent at the root', () => {
            const tree = createTree();
            const initial = (tree as any).initialNode as ScopeNode;
            expect(tree.hasProperty(initial, '$parent')).toBe(false);
        });
    });

    describe('getValue / setValue', () => {
        it('should get and set a property on a node', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', { count: 0 });
            const node = (tree as any).nodes.get('n1') as ScopeNode;

            tree.setValue(node, 'count', 42);
            expect(tree.getValue(node, 'count')).toBe(42);
        });

        it('should walk up to find the value', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'parent', { color: 'red' });
            const parentNode = (tree as any).nodes.get('parent') as ScopeNode;

            const child = new ScopeNode('child', {}, undefined, mockActivity({ instanceId: 'child' }));
            child.parent = parentNode;

            expect(tree.getValue(child, 'color')).toBe('red');
        });

        it('should return $activity', () => {
            const tree = createTree();
            const act = mockActivity({ instanceId: 'n1' });
            tree.next(constants.ids.initialScope, 'n1', {});
            const node = (tree as any).nodes.get('n1') as ScopeNode;
            // Override activity on the node
            (node as any).activity = act;

            expect(tree.getValue(node, '$activity')).toBe(act);
        });

        it('should return undefined for missing property', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', {});
            const node = (tree as any).nodes.get('n1') as ScopeNode;
            expect(tree.getValue(node, 'nope')).toBeUndefined();
        });

        it('should create a property when setValue finds no existing one', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', {});
            const node = (tree as any).nodes.get('n1') as ScopeNode;

            tree.setValue(node, 'newProp', 'created');
            expect(tree.getValue(node, 'newProp')).toBe('created');
        });
    });

    describe('deleteProperty', () => {
        it('should delete an existing property', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', { foo: 'bar' });
            const node = (tree as any).nodes.get('n1') as ScopeNode;

            expect(tree.deleteProperty(node, 'foo')).toBe(true);
            expect(tree.hasProperty(node, 'foo')).toBe(false);
        });

        it('should return false for missing property', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', {});
            const node = (tree as any).nodes.get('n1') as ScopeNode;
            expect(tree.deleteProperty(node, 'nope')).toBe(false);
        });
    });

    describe('enumeratePropertyNames', () => {
        it('should include $parent, $activity, and scope keys', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', { a: 1, b: 2 });
            const node = (tree as any).nodes.get('n1') as ScopeNode;

            const names = [...tree.enumeratePropertyNames(node)];
            expect(names).toContain('$parent');
            expect(names).toContain('$activity');
            expect(names).toContain('a');
            expect(names).toContain('b');
        });

        it('should stop walking when noWalk is true', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'parent', { shared: 'val' });
            const parentNode = (tree as any).nodes.get('parent') as ScopeNode;

            const child = new ScopeNode('child', { own: 'local' }, undefined, mockActivity({ instanceId: 'child' }));
            child.parent = parentNode;

            const names = [...tree.enumeratePropertyNames(child, true)];
            expect(names).toContain('own');
            expect(names).not.toContain('shared');
        });
    });

    describe('getExecutionState / setState', () => {
        it('should round-trip serialization of a simple tree', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'n1', { msg: 'hello' });

            const state = tree.getExecutionState({} as unknown as ActivityExecutionContext, false);
            expect(state.state).toHaveLength(1);
            expect(state.state[0].instanceId).toBe('n1');
        });

        it('should serialize, modify, then restore via setState', () => {
            // Build a 3-branch tree
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'A1', { val: 1 });
            tree.next('A1', 'A2', { val: 2 });
            tree.next('A1', 'B1', { val: 10 });
            tree.next(constants.ids.initialScope, 'C1', { val: 100 });

            // Serialize
            const snapshot = tree.getExecutionState({} as unknown as ActivityExecutionContext, false);

            // Verify serialized state
            const ids = snapshot.state.map((s: any) => s.instanceId).sort();
            expect(ids).toEqual(['A1', 'A2', 'B1', 'C1']);

            // Modify tree
            const a2 = tree.find('A2');
            a2.val = 999;
            expect(a2.val).toBe(999);

            const b1 = tree.find('B1');
            b1.newProp = 'added';
            expect(b1.newProp).toBe('added');

            // Restore from snapshot
            tree.setState(snapshot.state);

            // Verify modifications undone
            expect(tree.find('A2').val).toBe(2);
            expect((tree.find('B1') as any).newProp).toBeUndefined();

            // Tree structure still intact
            expect(tree.find('C1').val).toBe(100);
        });

        it('should deserialize snapshot into a new empty tree', () => {
            // Build source tree, serialize
            const source = createTree();
            source.next(constants.ids.initialScope, 'X1', { data: 'first' });
            source.next('X1', 'X2', { data: 'second' });
            source.next('X1', 'X3', { data: 'third' });

            const snapshot = source.getExecutionState({} as unknown as ActivityExecutionContext, false);

            // Create a brand new empty tree
            const target = createTree();

            // Deserialize into it
            target.setState(snapshot.state);

            // Assert tree was rebuilt from snapshot
            expect(target.find('X1')).toBeDefined();
            expect(target.find('X2')).toBeDefined();
            expect(target.find('X3')).toBeDefined();
            expect(target.find('X1').data).toBe('first');
            expect(target.find('X2').data).toBe('second');
            expect(target.find('X3').data).toBe('third');

            // Parent-child relationships
            expect((target.find('X2') as any).$parent.$activity.instanceId).toBe('X1');
        });
    });

    describe('Expression parent resolution', () => {
        it('should skip Expression nodes in getRealParent', () => {
            const tree = createTree();
            const expr = new Expression();
            (expr as any).instanceId = 'expr-1';
            (expr as any).id = 'expression';

            const realParent = new ScopeNode('real-parent', {});
            const exprNode = new ScopeNode('expr-1', {}, undefined, expr as unknown as Activity);
            exprNode.parent = realParent;
            const child = new ScopeNode('child', {}, undefined, mockActivity({ instanceId: 'child' }));
            child.parent = exprNode;

            // child's real parent should be real-parent, not exprNode
            expect(tree.hasProperty(child, '$parent')).toBe(true);
        });
    });

    describe('deleteScopePart', () => {
        it('should delete a child scope subtree', () => {
            const tree = createTree();
            tree.next(constants.ids.initialScope, 'parent', {});
            tree.next('parent', 'child', {});

            tree.deleteScopePart('parent', 'child');
            expect(() => tree.find('child')).toThrow('not found');
        });

        it('should throw when deleting the initial scope', () => {
            const tree = createTree();
            expect(() => tree.deleteScopePart(constants.ids.initialScope, constants.ids.initialScope)).toThrow(
                'Cannot delete the initial scope',
            );
        });
    });
});
