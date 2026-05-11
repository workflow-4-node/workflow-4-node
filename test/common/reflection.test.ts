import { jest } from '@jest/globals';
import { reflection } from '../../src/common/reflection.js';

describe('reflection.visitObject', () => {
    // ----- Edge cases: non-object inputs -----

    it('should not call the visitor for null', () => {
        const visitor = jest.fn<(...args: any[]) => boolean>();
        reflection.visitObject(null as any, visitor);
        expect(visitor).not.toHaveBeenCalled();
    });

    it('should not call the visitor for undefined', () => {
        const visitor = jest.fn<(...args: any[]) => boolean>();
        reflection.visitObject(undefined as any, visitor);
        expect(visitor).not.toHaveBeenCalled();
    });

    it('should not call the visitor for a primitive string', () => {
        const visitor = jest.fn<(...args: any[]) => boolean>();
        reflection.visitObject('hello' as any, visitor);
        expect(visitor).not.toHaveBeenCalled();
    });

    it('should not call the visitor for a number', () => {
        const visitor = jest.fn<(...args: any[]) => boolean>();
        reflection.visitObject(42 as any, visitor);
        expect(visitor).not.toHaveBeenCalled();
    });

    it('should not call the visitor for a boolean', () => {
        const visitor = jest.fn<(...args: any[]) => boolean>();
        reflection.visitObject(true as any, visitor);
        expect(visitor).not.toHaveBeenCalled();
    });

    // ----- Root object visit -----

    it('should visit the root object first with undefined key and parent', () => {
        const obj = { a: 1 };
        const calls: Array<[string | undefined, any, any]> = [];
        reflection.visitObject(obj, (key, value, parent) => {
            calls.push([key, value, parent]);
            return true;
        });

        // First call should be the root
        expect(calls[0]).toEqual([undefined, obj, undefined]);
    });

    it('should not visit any children if visitor returns false for the root', () => {
        const obj = { a: 1, b: 2 };
        const visitor = jest.fn<(...args: any[]) => boolean>().mockReturnValue(false);
        reflection.visitObject(obj, visitor);
        // Only the root call should have been made
        expect(visitor).toHaveBeenCalledTimes(1);
        expect(visitor).toHaveBeenCalledWith(undefined, obj, undefined);
    });

    // ----- Flat objects -----

    it('should visit all properties of a flat object', () => {
        const obj = { a: 1, b: 'two', c: true };
        const visited: Array<{ key: string; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            if (key !== undefined) {
                visited.push({ key, value });
            }
            return true;
        });

        expect(visited).toContainEqual({ key: 'a', value: 1 });
        expect(visited).toContainEqual({ key: 'b', value: 'two' });
        expect(visited).toContainEqual({ key: 'c', value: true });
        expect(visited.length).toBe(3);
    });

    it('should pass the correct parent for each property', () => {
        const obj = { a: 1, b: 2 };
        reflection.visitObject(obj, (key, value, parent) => {
            if (key !== undefined) {
                expect(parent).toBe(obj);
            }
            return true;
        });
    });

    // ----- Arrays -----

    it('should visit elements of an array with numeric string keys', () => {
        const arr = [10, 20, 30];
        const visited: Array<{ key: string; value: any }> = [];
        reflection.visitObject(arr, (key, value, _parent) => {
            if (key !== undefined) {
                visited.push({ key, value });
            }
            return true;
        });

        expect(visited).toContainEqual({ key: '0', value: 10 });
        expect(visited).toContainEqual({ key: '1', value: 20 });
        expect(visited).toContainEqual({ key: '2', value: 30 });
        expect(visited.length).toBe(3);
    });

    it('should pass the correct parent for array elements', () => {
        const arr = [1, 2, 3];
        reflection.visitObject(arr, (key, value, parent) => {
            if (key !== undefined) {
                expect(parent).toBe(arr);
            }
            return true;
        });
    });

    // ----- Nested objects (no double-visiting) -----

    it('should visit nested objects without double-visiting', () => {
        const obj = { a: { b: 1, c: 2 } };
        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            visited.push({ key, value });
            return true;
        });

        // Root call
        expect(visited[0]).toEqual({ key: undefined, value: obj });

        // The nested object should be visited exactly once: as property "a" of root
        const nestedVisits = visited.filter((v) => v.value === obj.a);
        expect(nestedVisits.length).toBe(1);
        expect(nestedVisits[0].key).toBe('a');

        // Properties of the nested object should be visited
        const bVisits = visited.filter((v) => v.value === 1);
        expect(bVisits.length).toBe(1);
        expect(bVisits[0].key).toBe('b');

        const cVisits = visited.filter((v) => v.value === 2);
        expect(cVisits.length).toBe(1);
        expect(cVisits[0].key).toBe('c');
    });

    it('should visit deeply nested objects without double-visiting', () => {
        const obj = { a: { b: { c: 3 } } };
        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            visited.push({ key, value });
            return true;
        });

        // Root
        expect(visited[0]).toEqual({ key: undefined, value: obj });

        // Each object/value should appear exactly once
        const deepValue = obj.a.b;
        expect(visited.filter((v) => v.value === obj.a).length).toBe(1);
        expect(visited.filter((v) => v.value === deepValue).length).toBe(1);
        expect(visited.filter((v) => v.value === 3).length).toBe(1);

        // Verify the key of each nested object
        expect(visited.filter((v) => v.value === obj.a)[0].key).toBe('a');
        expect(visited.filter((v) => v.value === deepValue)[0].key).toBe('b');
    });

    // ----- Nested arrays -----

    it('should visit nested arrays without double-visiting', () => {
        const arr = [1, [2, 3], 4];
        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(arr, (key, value, _parent) => {
            visited.push({ key, value });
            return true;
        });

        // Root
        expect(visited[0]).toEqual({ key: undefined, value: arr });

        // The nested array should appear exactly once
        const nestedArr = arr[1];
        expect(visited.filter((v) => v.value === nestedArr).length).toBe(1);

        // Elements of the nested array should appear exactly once
        expect(visited.filter((v) => v.value === 2).length).toBe(1);
        expect(visited.filter((v) => v.value === 3).length).toBe(1);
        expect(visited.filter((v) => v.value === 4).length).toBe(1);
    });

    // ----- Mixed nested objects and arrays -----

    it('should visit mixed objects and arrays without double-visiting', () => {
        const obj = { items: [{ name: 'a' }, { name: 'b' }] };
        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            visited.push({ key, value });
            return true;
        });

        // Root
        expect(visited.filter((v) => v.value === obj).length).toBe(1);

        // items array
        expect(visited.filter((v) => v.value === obj.items).length).toBe(1);
        expect(visited.filter((v) => v.value === obj.items)[0].key).toBe('items');

        // Each item object
        expect(visited.filter((v) => v.value === obj.items[0]).length).toBe(1);
        expect(visited.filter((v) => v.value === obj.items[1]).length).toBe(1);

        // String values
        expect(visited.filter((v) => v.value === 'a').length).toBe(1);
        expect(visited.filter((v) => v.value === 'b').length).toBe(1);
    });

    // ----- Visitor returning false stops recursion into that value -----

    it('should skip recursion into a child when visitor returns false', () => {
        const obj = { a: { b: { c: 3 } } };
        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            visited.push({ key, value });
            // Stop recursion into obj.a
            if (value === obj.a) {
                return false;
            }
            return true;
        });

        // Should have visited root and obj.a, but NOT obj.a's children
        expect(visited.filter((v) => v.value === obj).length).toBe(1);
        expect(visited.filter((v) => v.value === obj.a).length).toBe(1);
        expect(visited.filter((v) => v.value === obj.a.b).length).toBe(0);
        expect(visited.filter((v) => v.value === 3).length).toBe(0);
    });

    // ----- Ordering (DFS pre-order) -----

    it('should traverse in depth-first pre-order', () => {
        const obj = { a: { b: 1 }, c: 2 };
        const keys: Array<string | undefined> = [];
        reflection.visitObject(obj, (key, _value, _parent) => {
            keys.push(key);
            return true;
        });

        // Root → a → b → c (DFS pre-order)
        expect(keys[0]).toBeUndefined(); // root
        // "a" should come before its children
        const idxA = keys.indexOf('a');
        const idxB = keys.indexOf('b');
        const idxC = keys.indexOf('c');
        expect(idxA).toBeLessThan(idxB);
        expect(idxB).toBeLessThan(idxC);
    });

    // ----- Empty object -----

    it('should visit root of an empty object but no properties', () => {
        const obj = {};
        const visitor = jest.fn<(...args: any[]) => boolean>().mockReturnValue(true);
        reflection.visitObject(obj, visitor);
        expect(visitor).toHaveBeenCalledTimes(1);
        expect(visitor).toHaveBeenCalledWith(undefined, obj, undefined);
    });

    it('should visit root of an empty array but no elements', () => {
        const arr: number[] = [];
        const visitor = jest.fn<(...args: any[]) => boolean>().mockReturnValue(true);
        reflection.visitObject(arr, visitor);
        expect(visitor).toHaveBeenCalledTimes(1);
        expect(visitor).toHaveBeenCalledWith(undefined, arr, undefined);
    });

    // ----- Objects with various value types -----

    it('should handle objects containing null and undefined values', () => {
        const obj = { a: null, b: undefined, c: 1 };
        const visited: Array<{ key: string; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            if (key !== undefined) {
                visited.push({ key, value });
            }
            return true;
        });

        expect(visited).toContainEqual({ key: 'a', value: null });
        expect(visited).toContainEqual({ key: 'b', value: undefined });
        expect(visited).toContainEqual({ key: 'c', value: 1 });
        // null/undefined values should not cause recursion (typeof null === 'object')
        expect(visited.length).toBe(3);
    });

    // ----- Total visit count -----

    it('should visit the correct total number of items', () => {
        const obj = {
            a: 1,
            b: [2, 3, { c: 4 }],
            d: { e: { f: 5 } },
        };
        let count = 0;
        reflection.visitObject(obj, (_key, _value, _parent) => {
            count++;
            return true;
        });

        // Root + 3 top-level keys + 3 array elements + 1 nested obj in array
        // + 1 nested obj (d) + 1 sub-nested obj (e) + 1 leaf (f:5)
        // = root(1) + a,b,d(3) + 2,3,obj(3) + c:4(1) + e(1) + f:5(1) = 10
        expect(count).toBe(10);
    });

    // ----- Deep nesting doesn't cause stack overflow with reasonable depth -----

    it('should handle a moderately deep object tree', () => {
        // Build a chain: { a: { a: { a: ... { a: 1 } } } }
        let obj: any = 1;
        for (let i = 0; i < 100; i++) {
            obj = { a: obj };
        }

        let count = 0;
        reflection.visitObject(obj, (_key, _value, _parent) => {
            count++;
            return true;
        });

        // We should visit every level
        expect(count).toBe(101); // root + 100 nested objects + final primitive value "a: 1"
    });

    // ----- Array containing objects with arrays -----

    it('should visit nested array elements like { obj: { a: [{ b: ["1", "2"] }] } }', () => {
        const obj = { obj: { a: [{ b: ['1', '2'] }] } };
        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            visited.push({ key, value });
            return true;
        });

        // Root
        expect(visited[0]).toEqual({ key: undefined, value: obj });

        // "obj" property
        const objVisits = visited.filter((v) => v.value === obj.obj);
        expect(objVisits.length).toBe(1);
        expect(objVisits[0].key).toBe('obj');

        // "a" property (the array)
        expect(visited.filter((v) => v.value === obj.obj.a).length).toBe(1);
        expect(visited.filter((v) => v.value === obj.obj.a)[0].key).toBe('a');

        // The object inside the array: { b: ['1', '2'] }
        const innerObj = obj.obj.a[0];
        expect(visited.filter((v) => v.value === innerObj).length).toBe(1);

        // "b" array
        expect(visited.filter((v) => v.value === innerObj.b).length).toBe(1);
        expect(visited.filter((v) => v.value === innerObj.b)[0].key).toBe('b');

        // '1' and '2' strings
        expect(visited.filter((v) => v.value === '1').length).toBe(1);
        expect(visited.filter((v) => v.value === '2').length).toBe(1);

        // Total: root + obj + a + innerObj + b + '1' + '2' = 7
        expect(visited.length).toBe(7);
    });

    // ----- Cyclic references -----

    it('should not infinite-loop on a self-referencing object', () => {
        const obj: Record<string, any> = { a: 1 };
        obj.self = obj;

        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(obj, (key, value, _parent) => {
            visited.push({ key, value });
            return true;
        });

        // Root + a + self (obj again, but not recursed into)
        expect(visited.length).toBe(3);
        expect(visited[0]).toEqual({ key: undefined, value: obj });
        expect(visited[1]).toEqual({ key: 'a', value: 1 });
        expect(visited[2]).toEqual({ key: 'self', value: obj });
    });

    it('should not infinite-loop on a sibling cycle (a -> b -> a)', () => {
        const a: Record<string, any> = {};
        const b: Record<string, any> = {};
        a.b = b;
        b.a = a;

        const visited: Array<{ key: string | undefined; value: any }> = [];
        reflection.visitObject(a, (key, value, _parent) => {
            visited.push({ key, value });
            return true;
        });

        // Root (a) + b + a (back-reference, visited but not recursed)
        expect(visited.length).toBe(3);
        expect(visited[0]).toEqual({ key: undefined, value: a });
        expect(visited[1]).toEqual({ key: 'b', value: b });
        // The back-reference to 'a' from 'b' — 'a' is already visited so its children are skipped
        expect(visited[2]).toEqual({ key: 'a', value: a });
    });
});
