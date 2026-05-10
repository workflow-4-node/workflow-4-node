import type { ScopeNode } from '../../../src/activities/runtime/ScopeNode.js';
import { ScopeTree } from '../../../src/activities/runtime/ScopeTree.js';
import { constants } from '../../../src/common/constants.js';
import type { Activity } from '../../../src/activities/Activity.js';
import { ExtensibleSet } from '../../../src/common/ExtensibleSet.js';

function getActivityById(id: string): Activity {
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
    } as unknown as Activity;
}

function nodeById(tree: ScopeTree, id: string): ScopeNode {
    const node = (tree as any).nodes.get(id) as ScopeNode | undefined;
    if (!node) throw new Error(`Node '${id}' not found`);
    return node;
}

describe('scope', () => {
    describe('create', () => {
        it('should return a SimpleProxy', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', { foo: 'bar' });
            const proxy = tree.find('n1');
            expect(typeof proxy).toBe('object');
        });
    });

    describe('proxy getValue', () => {
        it('should get a property from the node via tree', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', { color: 'red' });
            const proxy = tree.find('n1');
            expect(proxy.color).toBe('red');
        });

        it('should walk up the tree to find properties', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'parent', { shared: 'from-parent' });
            tree.next('parent', 'child', { own: 'from-child' });

            const proxy = tree.find('child');
            expect(proxy.own).toBe('from-child');
            expect(proxy.shared).toBe('from-parent');
        });

        it('should return $activity', () => {
            const act = getActivityById('n1');
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', {});
            const node = nodeById(tree, 'n1');
            (node as any).activity = act;

            const proxy = tree.find('n1');
            expect(proxy.$activity).toBe(act);
        });

        it('should return $parent proxy', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'parent', {});
            tree.next('parent', 'child', {});

            const proxy = tree.find('child');
            const parentProxy = proxy.$parent;
            expect(parentProxy).toBeDefined();
            expect(typeof parentProxy).toBe('object');
        });

        it('should return undefined for missing $parent on root', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', {});

            const proxy = tree.find('n1');
            expect(proxy.$parent).toBeUndefined();
        });

        it('should return delete function', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', { foo: 'bar' });

            const proxy = tree.find('n1');
            const del = proxy.delete;
            expect(typeof del).toBe('function');
            del('foo');
            expect(nodeById(tree, 'n1').isPropertyExists('foo')).toBe(false);
        });
    });

    describe('proxy setValue', () => {
        it('should set a property via the tree', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', {});

            const proxy = tree.find('n1');
            proxy.color = 'red';
            expect(proxy.color).toBe('red');
        });
    });

    describe('proxy hasKey', () => {
        it('should detect existing properties', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', { exists: true });

            const proxy = tree.find('n1');
            expect('exists' in proxy).toBe(true);
        });

        it('should detect $activity', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', {});

            const proxy = tree.find('n1');
            expect('$activity' in proxy).toBe(true);
        });

        it('should return false for missing properties', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', {});

            const proxy = tree.find('n1');
            expect('nope' in proxy).toBe(false);
        });
    });

    describe('proxy getKeys', () => {
        it('should return unique property names', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', { a: 1, b: 2 });

            const proxy = tree.find('n1');
            const keys = Object.keys(proxy);
            expect(keys).toContain('a');
            expect(keys).toContain('b');
        });

        it('should include $parent and $activity', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'parent', {});
            tree.next('parent', 'child', {});

            const proxy = tree.find('child');
            const keys = Object.keys(proxy);
            expect(keys).toContain('$parent');
            expect(keys).toContain('$activity');
        });
    });

    describe('proxy delete', () => {
        it('should delete a property via the tree', () => {
            const tree = new ScopeTree({}, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', { foo: 'bar' });

            const proxy = tree.find('n1');
            delete proxy.foo;
            expect(nodeById(tree, 'n1').isPropertyExists('foo')).toBe(false);
        });
    });

    describe('initial scope with properties', () => {
        it('should make initial scope properties visible from child nodes', () => {
            const tree = new ScopeTree({ global: 'value' }, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', { local: 'own' });

            const proxy = tree.find('n1');
            expect(proxy.local).toBe('own');
            expect(proxy.global).toBe('value');
        });

        it('should not allow setting properties on the initial scope from a child', () => {
            const tree = new ScopeTree({ existing: 'keep' }, getActivityById);
            tree.next(constants.ids.initialScope, 'n1', {});

            const proxy = tree.find('n1');
            proxy.newProp = 'created';
            expect(proxy.newProp).toBe('created');

            // Verify the initial scope was not polluted
            const initialNode = (tree as any).initialNode as ScopeNode;
            expect(initialNode.getPropertyValue('newProp')).toBeUndefined();
        });

        it('should resolve $parent and $activity correctly with multiple independent branches', () => {
            // Build 3 branches from the initial scope:
            //   branch-A: level1-A → level2-A → level3-A
            //   branch-B: level1-B → level2-B
            //   branch-C: level1-C
            const tree = new ScopeTree({ root: 'val' }, getActivityById);
            tree.next(constants.ids.initialScope, 'level1-A', { a: 1 });
            tree.next('level1-A', 'level2-A', { a: 2 });
            tree.next('level2-A', 'level3-A', { a: 3 });
            tree.next(constants.ids.initialScope, 'level1-B', { b: 10 });
            tree.next('level1-B', 'level2-B', { b: 20 });
            tree.next(constants.ids.initialScope, 'level1-C', { c: 100 });

            // --- Branch A: level3-A ---
            const p3a = tree.find('level3-A');
            // own value
            expect(p3a.a).toBe(3);
            // parent walk — should see level2-A value, NOT branch B/C values
            const p3aParent = p3a.$parent;
            expect(p3aParent).toBeDefined();
            expect(p3aParent.a).toBe(2);
            expect(p3aParent.b).toBeUndefined();
            expect(p3aParent.c).toBeUndefined();
            expect(p3aParent.$activity.instanceId).toBe('level2-A');
            // grandparent
            const p3aGrand = p3aParent.$parent;
            expect(p3aGrand).toBeDefined();
            expect(p3aGrand.a).toBe(1);
            expect(p3aGrand.b).toBeUndefined();
            expect(p3aGrand.c).toBeUndefined();
            expect(p3aGrand.$activity.instanceId).toBe('level1-A');
            // root scope
            expect(p3aGrand.root).toBe('val');
            expect(p3aGrand.$parent).toBeUndefined();

            // --- Branch B: level2-B ---
            const p2b = tree.find('level2-B');
            expect(p2b.b).toBe(20);
            expect(p2b.a).toBeUndefined();
            expect(p2b.c).toBeUndefined();
            const p2bParent = p2b.$parent;
            expect(p2bParent).toBeDefined();
            expect(p2bParent.b).toBe(10);
            expect(p2bParent.$activity.instanceId).toBe('level1-B');

            // --- Branch C: level1-C ---
            const p1c = tree.find('level1-C');
            expect(p1c.c).toBe(100);
            expect(p1c.a).toBeUndefined();
            expect(p1c.b).toBeUndefined();
            // parent is the initial scope → $parent undefined
            expect(p1c.$parent).toBeUndefined();

            // --- Cross-contamination checks ---
            // level2-A should NOT see branch-B values
            expect(tree.find('level2-A').b).toBeUndefined();
            // level2-B should NOT see branch-A values
            expect(tree.find('level2-B').a).toBeUndefined();
            // level1-C should NOT see any A/B values
            expect(tree.find('level1-C').a).toBeUndefined();
            expect(tree.find('level1-C').b).toBeUndefined();
        });
    });
});
