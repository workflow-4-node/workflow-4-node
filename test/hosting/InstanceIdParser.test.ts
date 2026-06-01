import { InstanceIdParser } from '../../src/hosting/InstanceIdParser.js';

function createParser(): InstanceIdParser {
    return new InstanceIdParser();
}

describe('InstanceIdParser', () => {
    // ----- Construction -----

    it('should create an instance without throwing', () => {
        const parser = new InstanceIdParser();
        expect(parser).toBeInstanceOf(InstanceIdParser);
    });

    it('should start with an empty internal cache', () => {
        const parser = createParser();
        // Internal cache is private, but we can verify by observing parse behavior:
        // first call creates + caches, second call reuses — both should work identically
        const obj = { a: 1 };
        expect(parser.parse('a', obj)).toBe('1');
        expect(parser.parse('a', obj)).toBe('1');
    });

    // ----- Argument validation -----

    it('should throw when obj is null', () => {
        const parser = createParser();
        expect(() => parser.parse('x', null)).toThrow("Argument 'obj' expected.");
    });

    it('should throw when obj is undefined', () => {
        const parser = createParser();
        expect(() => parser.parse('x', undefined)).toThrow("Argument 'obj' expected.");
    });

    it('should throw when path is not a string', () => {
        const parser = createParser();
        expect(() => parser.parse(42 as unknown as string, {})).toThrow(TypeError);
        expect(() => parser.parse(42 as unknown as string, {})).toThrow("Argument 'path' is not a string.");
    });

    it('should throw when path is an object', () => {
        const parser = createParser();
        expect(() => parser.parse({} as unknown as string, {})).toThrow(TypeError);
    });

    it('should throw when path is an array', () => {
        const parser = createParser();
        expect(() => parser.parse([] as unknown as string, {})).toThrow(TypeError);
    });

    // ----- Simple property access -----

    it('should parse a simple property with "this." prefix', () => {
        const parser = createParser();
        const obj = { name: 'test-workflow' };
        expect(parser.parse('this.name', obj)).toBe('test-workflow');
    });

    it('should parse a simple property without prefix', () => {
        const parser = createParser();
        const obj = { name: 'test-workflow' };
        expect(parser.parse('name', obj)).toBe('test-workflow');
    });

    it('should parse a numeric property', () => {
        const parser = createParser();
        const obj = { id: 42 };
        expect(parser.parse('id', obj)).toBe('42');
    });

    it('should parse a boolean property', () => {
        const parser = createParser();
        const obj = { active: true };
        expect(parser.parse('active', obj)).toBe('true');
    });

    it('should parse a null property', () => {
        const parser = createParser();
        const obj = { value: null };
        // .toString() on null throws
        expect(() => parser.parse('value', obj)).toThrow();
    });

    it('should parse an undefined property', () => {
        const parser = createParser();
        const obj: Record<string, unknown> = {};
        // Accessing undefined then calling .toString() on undefined throws
        expect(() => parser.parse('missing', obj)).toThrow();
    });

    it('should parse a property containing an empty string', () => {
        const parser = createParser();
        const obj = { text: '' };
        expect(parser.parse('text', obj)).toBe('');
    });

    it('should parse a property containing a whitespace string', () => {
        const parser = createParser();
        const obj = { text: '  ' };
        expect(parser.parse('text', obj)).toBe('  ');
    });

    // ----- Array indexing -----

    it('should parse an array index with bracket notation', () => {
        const parser = createParser();
        const obj = ['a', 'b', 'c'];
        expect(parser.parse('[0]', obj)).toBe('a');
        expect(parser.parse('[1]', obj)).toBe('b');
        expect(parser.parse('[2]', obj)).toBe('c');
    });

    it('should parse an array index via property path', () => {
        const parser = createParser();
        const obj = { items: ['x', 'y'] };
        expect(parser.parse('items[0]', obj)).toBe('x');
        expect(parser.parse('items[1]', obj)).toBe('y');
    });

    it('should parse "this" prefixed array index', () => {
        const parser = createParser();
        const obj = [10, 20];
        expect(parser.parse('this[0]', obj)).toBe('10');
        expect(parser.parse('this[1]', obj)).toBe('20');
    });

    // ----- Nested property access -----

    it('should parse nested properties with dot notation', () => {
        const parser = createParser();
        const obj = { address: { city: 'Budapest', zip: '1011' } };
        expect(parser.parse('address.city', obj)).toBe('Budapest');
        expect(parser.parse('address.zip', obj)).toBe('1011');
    });

    it('should parse deeply nested properties', () => {
        const parser = createParser();
        const obj = { a: { b: { c: 'deep' } } };
        expect(parser.parse('a.b.c', obj)).toBe('deep');
    });

    it('should parse "this" prefixed nested properties', () => {
        const parser = createParser();
        const obj = { level1: { level2: 'nested' } };
        expect(parser.parse('this.level1.level2', obj)).toBe('nested');
    });

    // ----- Mixed array + object access -----

    it('should parse array inside object', () => {
        const parser = createParser();
        const obj = { list: ['first', 'second'] };
        expect(parser.parse('list[0]', obj)).toBe('first');
        expect(parser.parse('list[1]', obj)).toBe('second');
    });

    it('should parse object inside array', () => {
        const parser = createParser();
        const obj = { items: [{ id: 1 }, { id: 2 }] };
        expect(parser.parse('items[0].id', obj)).toBe('1');
        expect(parser.parse('items[1].id', obj)).toBe('2');
    });

    it('should parse nested array indices', () => {
        const parser = createParser();
        const obj = {
            matrix: [
                [1, 2],
                [3, 4],
            ],
        };
        expect(parser.parse('matrix[0][0]', obj)).toBe('1');
        expect(parser.parse('matrix[1][1]', obj)).toBe('4');
    });

    // ----- Caching behavior -----

    it('should cache the compiled parser for a given path', () => {
        const parser = createParser();
        const obj = { value: 'cached' };

        // First call — creates and caches
        expect(parser.parse('this.value', obj)).toBe('cached');

        // Second call — should use cache
        expect(parser.parse('this.value', obj)).toBe('cached');
    });

    it('should reuse cached parser across different objects', () => {
        const parser = createParser();
        const obj1 = { x: 10 };
        const obj2 = { x: 20 };

        expect(parser.parse('x', obj1)).toBe('10');
        expect(parser.parse('x', obj2)).toBe('20');
    });

    it('should cache different paths independently', () => {
        const parser = createParser();
        const obj = { a: 'alpha', b: 'beta' };

        expect(parser.parse('a', obj)).toBe('alpha');
        expect(parser.parse('b', obj)).toBe('beta');
        expect(parser.parse('a', obj)).toBe('alpha');
        expect(parser.parse('b', obj)).toBe('beta');
    });

    // ----- Complex property values -----

    it('should return toString of an object property', () => {
        const parser = createParser();
        const nested = { x: 1 };
        const obj = { data: nested };
        expect(parser.parse('data', obj)).toBe('[object Object]');
    });

    it('should return toString of an array property', () => {
        const parser = createParser();
        const obj = { list: [1, 2, 3] };
        const result = parser.parse('list', obj);
        expect(result).toBe('1,2,3');
    });

    it('should return toString of a function property', () => {
        const parser = createParser();
        function handler() {
            return 'hello';
        }
        const obj = { handler };
        const result = parser.parse('handler', obj);
        expect(typeof result).toBe('string');
        expect(result).toContain('handler');
    });

    it('should return toString of a Date property', () => {
        const parser = createParser();
        const date = new Date('2024-01-15T00:00:00.000Z');
        const obj = { createdAt: date };
        expect(parser.parse('createdAt', obj)).toBe(date.toString());
    });

    // ----- Edge cases -----

    it('should handle path with only "this" keyword', () => {
        const parser = createParser();
        const obj = {
            toString() {
                return 'custom';
            },
        };
        expect(parser.parse('this', obj)).toBe('custom');
    });

    it('should handle path that is just "this" and obj is a primitive wrapper', () => {
        const parser = createParser();
        const obj = 42;
        expect(parser.parse('this', obj)).toBe('42');
    });

    it('should handle path with "this" as an array', () => {
        const parser = createParser();
        const obj = [1, 2, 3];
        expect(parser.parse('this', obj)).toBe('1,2,3');
    });

    it('should work with a function as obj', () => {
        const parser = createParser();
        function myFunc() {
            return 'func-result';
        }
        // Functions have .toString() which returns the source
        const result = parser.parse('this', myFunc);
        expect(typeof result).toBe('string');
        expect(result).toContain('function');
    });
});
