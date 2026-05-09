import { ScopeNode } from '../../../src/activities/runtime/ScopeNode.js';
import type { Activity } from '../../../src/activities/Activity.js';

function mockActivity(overrides: Partial<Activity> = {}): Activity {
    return {
        instanceId: 'act-1',
        id: 'test-activity',
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

describe('ScopeNode', () => {
    describe('constructor', () => {
        it('should create a node with instanceId and scopePart', () => {
            const node = new ScopeNode('node-1', { foo: 'bar' });
            expect(node.instanceId).toBe('node-1');
            expect(node.userId).toBeUndefined();
            expect(node.activity).toBeNull();
            expect(node.parent).toBeNull();
            expect(node.scopePart).toEqual({ foo: 'bar' });
        });

        it('should accept optional userId and activity', () => {
            const activity = mockActivity({ instanceId: 'act-1' });
            const node = new ScopeNode('node-1', {}, 'my-user', activity);
            expect(node.userId).toBe('my-user');
            expect(node.activity).toBe(activity);
        });

        it('should collect keys from scopePart', () => {
            const node = new ScopeNode('node-1', { a: 1, b: 2, c: 3 });
            const keys = [...node.enumeratePropertyNames(true)];
            expect(keys).toEqual(['a', 'b', 'c']);
        });

        it('should treat nullish activity as null', () => {
            const node1 = new ScopeNode('n1', {});
            expect(node1.activity).toBeNull();

            const node2 = new ScopeNode('n1', {}, undefined, undefined);
            expect(node2.activity).toBeNull();
        });
    });

    describe('parent', () => {
        it('should set parent via setter and add as child', () => {
            const parent = new ScopeNode('parent', {});
            const child = new ScopeNode('child', {});
            child.parent = parent;

            expect(child.parent).toBe(parent);
            expect([...parent.children()]).toContain(child);
        });

        it('should throw when setting parent to null', () => {
            const node = new ScopeNode('n1', {});
            expect(() => {
                node.parent = null;
            }).toThrow('Node argument expected.');
        });

        it('should throw when parent is already set', () => {
            const p1 = new ScopeNode('p1', {});
            const p2 = new ScopeNode('p2', {});
            const child = new ScopeNode('child', {});
            child.parent = p1;

            expect(() => {
                child.parent = p2;
            }).toThrow('Parent already defined.');
        });
    });

    describe('addChild / removeChild', () => {
        it('should add a child and set its parent', () => {
            const parent = new ScopeNode('parent', {});
            const child = new ScopeNode('child', {});
            parent.addChild(child);

            expect(child.parent).toBe(parent);
            expect([...parent.children()]).toEqual([child]);
        });

        it('should throw when child already has a parent', () => {
            const p1 = new ScopeNode('p1', {});
            const p2 = new ScopeNode('p2', {});
            const child = new ScopeNode('child', {});
            p1.addChild(child);

            expect(() => {
                p2.addChild(child);
            }).toThrow('Item has already had a parent node.');
        });

        it('should remove a child and clear its parent', () => {
            const parent = new ScopeNode('parent', {});
            const child = new ScopeNode('child', {});
            parent.addChild(child);
            parent.removeChild(child);

            expect(child.parent).toBeNull();
            expect([...parent.children()]).toEqual([]);
        });

        it('should throw when removing a non-child', () => {
            const parent = new ScopeNode('parent', {});
            const stranger = new ScopeNode('stranger', {});
            expect(() => {
                parent.removeChild(stranger);
            }).toThrow("Item is not a current node's child.");
        });
    });

    describe('clearChildren', () => {
        it('should remove all children', () => {
            const parent = new ScopeNode('parent', {});
            parent.addChild(new ScopeNode('c1', {}));
            parent.addChild(new ScopeNode('c2', {}));
            parent.addChild(new ScopeNode('c3', {}));
            parent.clearChildren();

            expect([...parent.children()]).toEqual([]);
        });
    });

    describe('walkToRoot', () => {
        it('should yield nodes from current up to root', () => {
            const root = new ScopeNode('root', {});
            const mid = new ScopeNode('mid', {});
            const leaf = new ScopeNode('leaf', {});
            mid.parent = root;
            leaf.parent = mid;

            expect([...leaf.walkToRoot()].map((n) => n.instanceId)).toEqual(['leaf', 'mid', 'root']);
        });

        it('should yield only self when no parent', () => {
            const node = new ScopeNode('alone', {});
            expect([...node.walkToRoot()].map((n) => n.instanceId)).toEqual(['alone']);
        });
    });

    describe('isPropertyExists', () => {
        it('should return true for existing properties', () => {
            const node = new ScopeNode('n1', { foo: 'bar', count: 42 });
            expect(node.isPropertyExists('foo')).toBe(true);
            expect(node.isPropertyExists('count')).toBe(true);
        });

        it('should return false for missing properties', () => {
            const node = new ScopeNode('n1', { foo: 'bar' });
            expect(node.isPropertyExists('nonexistent')).toBe(false);
        });

        it('should return false for undefined-valued properties', () => {
            const node = new ScopeNode('n1', { foo: undefined } as Record<string, any>);
            expect(node.isPropertyExists('foo')).toBe(false);
        });

        it('should return true for null-valued properties', () => {
            const node = new ScopeNode('n1', { foo: null } as Record<string, any>);
            expect(node.isPropertyExists('foo')).toBe(true);
        });
    });

    describe('getPropertyValue', () => {
        it('should return value for public properties', () => {
            const node = new ScopeNode('n1', { foo: 'bar' });
            expect(node.getPropertyValue('foo')).toBe('bar');
        });

        it('should return undefined for private properties when canReturnPrivate is false', () => {
            const node = new ScopeNode('n1', { _secret: 'hidden' });
            expect(node.getPropertyValue('_secret')).toBeUndefined();
        });

        it('should return private property value when canReturnPrivate is true', () => {
            const node = new ScopeNode('n1', { _secret: 'hidden' });
            expect(node.getPropertyValue('_secret', true)).toBe('hidden');
        });

        it('should return undefined for missing properties', () => {
            const node = new ScopeNode('n1', {});
            expect(node.getPropertyValue('nope')).toBeUndefined();
        });
    });

    describe('setPropertyValue', () => {
        it('should update an existing public property', () => {
            const node = new ScopeNode('n1', { foo: 'old' });
            expect(node.setPropertyValue('foo', 'new')).toBe(true);
            expect(node.getPropertyValue('foo')).toBe('new');
        });

        it('should return false for non-existing public property', () => {
            const node = new ScopeNode('n1', {});
            expect(node.setPropertyValue('foo', 'bar')).toBe(false);
            expect(node.isPropertyExists('foo')).toBe(false);
        });

        it('should set private property when canSetPrivate is true', () => {
            const node = new ScopeNode('n1', {});
            expect(node.setPropertyValue('_secret', 'value', true)).toBe(true);
            expect(node.getPropertyValue('_secret', true)).toBe('value');
        });

        it('should reject private property when canSetPrivate is false', () => {
            const node = new ScopeNode('n1', { _secret: 'old' });
            expect(node.setPropertyValue('_secret', 'new')).toBe(false);
            expect(node.getPropertyValue('_secret', true)).toBe('old');
        });

        it('should add key to enumeration when creating a new private property', () => {
            const node = new ScopeNode('n1', {});
            node.setPropertyValue('_priv', 'val', true);
            expect([...node.enumeratePropertyNames(true)]).toContain('_priv');
        });
    });

    describe('createPropertyWithValue', () => {
        it('should create a new property', () => {
            const node = new ScopeNode('n1', {});
            node.createPropertyWithValue('newProp', 42);
            expect(node.getPropertyValue('newProp')).toBe(42);
        });

        it('should overwrite an existing property', () => {
            const node = new ScopeNode('n1', { foo: 'old' });
            node.createPropertyWithValue('foo', 'new');
            expect(node.getPropertyValue('foo')).toBe('new');
        });

        it('should not duplicate key when property already exists', () => {
            const node = new ScopeNode('n1', { foo: 1 });
            const before = [...node.enumeratePropertyNames(true)].length;
            node.createPropertyWithValue('foo', 2);
            const after = [...node.enumeratePropertyNames(true)].length;
            expect(after).toBe(before);
        });
    });

    describe('deleteProperty', () => {
        it('should delete an existing public property', () => {
            const node = new ScopeNode('n1', { foo: 'bar' });
            expect(node.deleteProperty('foo')).toBe(true);
            expect(node.isPropertyExists('foo')).toBe(false);
        });

        it('should return false for missing properties', () => {
            const node = new ScopeNode('n1', {});
            expect(node.deleteProperty('nope')).toBe(false);
        });

        it('should delete private property when canDeletePrivate is true', () => {
            const node = new ScopeNode('n1', { _secret: 'val' });
            expect(node.deleteProperty('_secret', true)).toBe(true);
            expect(node.isPropertyExists('_secret')).toBe(false);
        });

        it('should reject deleting private property when canDeletePrivate is false', () => {
            const node = new ScopeNode('n1', { _secret: 'val' });
            expect(node.deleteProperty('_secret')).toBe(false);
            expect(node.getPropertyValue('_secret', true)).toBe('val');
        });

        it('should remove key from enumeration', () => {
            const node = new ScopeNode('n1', { foo: 'bar', baz: 'qux' });
            node.deleteProperty('foo');
            expect([...node.enumeratePropertyNames(true)]).toEqual(['baz']);
        });
    });

    describe('enumeratePropertyNames', () => {
        it('should yield all keys when canEnumeratePrivate is true', () => {
            const node = new ScopeNode('n1', { a: 1, _b: 2, c: 3 });
            expect([...node.enumeratePropertyNames(true)]).toEqual(['a', '_b', 'c']);
        });

        it('should skip private keys when canEnumeratePrivate is false', () => {
            const node = new ScopeNode('n1', { a: 1, _b: 2, c: 3 });
            expect([...node.enumeratePropertyNames()]).toEqual(['a', 'c']);
        });
    });

    describe('properties', () => {
        it('should yield name/value pairs for all keys', () => {
            const node = new ScopeNode('n1', { a: 1, b: 'two', c: true });
            expect([...node.properties()]).toEqual([
                { name: 'a', value: 1 },
                { name: 'b', value: 'two' },
                { name: 'c', value: true },
            ]);
        });
    });
});
