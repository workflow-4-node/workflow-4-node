import { SimpleProxy, type ProxyBackend } from '../../src/common/SimpleProxy.js';

function createMockBackend(overrides: Partial<ProxyBackend> = {}): ProxyBackend & { calls: string[] } {
    const calls: string[] = [];
    const store = new Map<string, any>();
    return {
        calls,
        getValue(property: string): any {
            calls.push(`getValue(${property})`);
            return store.get(property);
        },
        setValue(property: string, value: any): void {
            calls.push(`setValue(${property}, ${JSON.stringify(value)})`);
            store.set(property, value);
        },
        getKeys(): string[] {
            calls.push('getKeys()');
            return [...store.keys()];
        },
        ...overrides,
    };
}

describe('SimpleProxy', () => {
    describe('construction', () => {
        it('should create a proxy that is instanceof SimpleProxy', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);
            expect(proxy).toBeInstanceOf(SimpleProxy);
        });
    });

    describe('get trap', () => {
        it('should return class methods from the target', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);
            expect(typeof (proxy as any).constructor).toBe('function');
        });

        it('should delegate unknown string properties to backend.getValue', () => {
            const backend = createMockBackend();
            backend.setValue('foo', 'bar');
            const proxy = new SimpleProxy(backend);

            const result = (proxy as any).foo;
            expect(result).toBe('bar');
            expect(backend.calls).toContain('getValue(foo)');
        });

        it('should return undefined for missing backend properties', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            const result = (proxy as any).nonexistent;
            expect(result).toBeUndefined();
        });

        it('should not delegate symbol properties to backend', () => {
            const backend = createMockBackend();
            const sym = Symbol('test');
            const proxy = new SimpleProxy(backend);

            (proxy as any)[sym] = 'symbol-value';
            expect(backend.calls).not.toContain('getValue(test)');
            const result = (proxy as any)[sym];
            expect(result).toBe('symbol-value');
        });

        it('should return backend values with falsy values', () => {
            const backend = createMockBackend();
            backend.setValue('count', 0);
            backend.setValue('active', false);
            backend.setValue('empty', '');
            backend.setValue('nothing', null);
            const proxy = new SimpleProxy(backend);

            expect((proxy as any).count).toBe(0);
            expect((proxy as any).active).toBe(false);
            expect((proxy as any).empty).toBe('');
            expect((proxy as any).nothing).toBeNull();
        });
    });

    describe('set trap', () => {
        it('should delegate string property writes to backend.setValue', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            (proxy as any).name = 'test-value';
            expect(backend.calls).toContain('setValue(name, "test-value")');
        });

        it('should set symbol properties on the target directly', () => {
            const backend = createMockBackend();
            const sym = Symbol('internal');
            const proxy = new SimpleProxy(backend);

            (proxy as any)[sym] = 'internal-data';
            expect(backend.calls).not.toContain('setValue');
            expect((proxy as any)[sym]).toBe('internal-data');
        });

        it('should update backend and reflect new value on subsequent get', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            (proxy as any).x = 10;
            expect((proxy as any).x).toBe(10);
            (proxy as any).x = 20;
            expect((proxy as any).x).toBe(20);
        });
    });

    describe('has trap (in operator)', () => {
        it('should return true for properties on the target', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);
            expect('constructor' in proxy).toBe(true);
        });

        it('should return true for properties known by the backend', () => {
            const backend = createMockBackend();
            backend.setValue('storedKey', 'value');
            const proxy = new SimpleProxy(backend);

            expect('storedKey' in proxy).toBe(true);
        });

        it('should return true for symbol properties', () => {
            const backend = createMockBackend();
            const sym = Symbol('sym');
            const proxy = new SimpleProxy(backend);
            (proxy as any)[sym] = true;

            expect(sym in proxy).toBe(true);
        });

        it('should return false for unknown properties', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            expect('unknownProp' in proxy).toBe(false);
        });
    });

    describe('deleteProperty trap', () => {
        it('should call backend.delete when available', () => {
            const deletedKeys: string[] = [];
            const backend = createMockBackend({
                delete: (key: string) => {
                    deletedKeys.push(key);
                },
            });
            backend.setValue('key', 'value');
            const proxy = new SimpleProxy(backend);

            delete (proxy as any).key;
            expect(deletedKeys).toEqual(['key']);
        });

        it('should not throw when backend.delete is not defined', () => {
            const backend = createMockBackend();
            backend.setValue('key', 'value');
            const proxy = new SimpleProxy(backend);

            expect(() => {
                delete (proxy as any).key;
            }).not.toThrow();
        });

        it('should skip deletion for symbol properties', () => {
            const deletedKeys: string[] = [];
            const backend = createMockBackend({
                delete: (key: string) => {
                    deletedKeys.push(key);
                },
            });
            const sym = Symbol('del');
            const proxy = new SimpleProxy(backend);
            (proxy as any)[sym] = 'keep';

            delete (proxy as any)[sym];
            expect(deletedKeys).toEqual([]);
        });
    });

    describe('ownKeys trap', () => {
        it('should include keys from the target', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            expect(Object.keys(proxy)).toEqual([]);
        });

        it('should include keys from the backend', () => {
            const backend = createMockBackend();
            backend.setValue('a', 1);
            backend.setValue('b', 2);
            const proxy = new SimpleProxy(backend);

            const keys = Object.keys(proxy);
            expect(keys).toContain('a');
            expect(keys).toContain('b');
        });

        it('should not duplicate keys that exist on both target and backend', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            backend.setValue('a', 1);
            (proxy as any).a = 1;

            const keys = Object.keys(proxy);
            const aCount = keys.filter((k) => k === 'a').length;
            expect(aCount).toBe(1);
        });
    });

    describe('getOwnPropertyDescriptor trap', () => {
        it('should return descriptor for target symbol properties', () => {
            const backend = createMockBackend();
            const sym = Symbol('own');
            const proxy = new SimpleProxy(backend);
            (proxy as any)[sym] = 'own-data';

            const desc = Object.getOwnPropertyDescriptor(proxy, sym);
            expect(desc).toBeDefined();
            expect(desc?.value).toBe('own-data');
        });

        it('should return descriptor for backend properties', () => {
            const backend = createMockBackend();
            backend.setValue('stored', 42);
            const proxy = new SimpleProxy(backend);

            const desc = Object.getOwnPropertyDescriptor(proxy, 'stored');
            expect(desc).toBeDefined();
            expect(desc?.enumerable).toBe(true);
            expect(desc?.configurable).toBe(true);
            expect(typeof desc?.get).toBe('function');
            expect(typeof desc?.set).toBe('function');
        });

        it('should return undefined for unknown properties', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            const desc = Object.getOwnPropertyDescriptor(proxy, 'nothingHere');
            expect(desc).toBeUndefined();
        });

        it('should return undefined for inherited properties', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            const desc = Object.getOwnPropertyDescriptor(proxy, 'constructor');
            expect(desc).toBeUndefined();
        });
    });

    describe('integration', () => {
        it('should support round-trip get/set through backend', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            (proxy as any).firstName = 'Alice';
            (proxy as any).lastName = 'Smith';

            expect((proxy as any).firstName).toBe('Alice');
            expect((proxy as any).lastName).toBe('Smith');

            expect(backend.calls).toContain('setValue(firstName, "Alice")');
            expect(backend.calls).toContain('setValue(lastName, "Smith")');
            expect(backend.calls).toContain('getValue(firstName)');
            expect(backend.calls).toContain('getValue(lastName)');
        });

        it('should work with Object.keys and for...in after setting values', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            (proxy as any).a = 1;
            (proxy as any).b = 2;

            expect(Object.keys(proxy)).toEqual(expect.arrayContaining(['a', 'b']));

            const loopKeys: string[] = [];
            for (const key in proxy) {
                loopKeys.push(key);
            }
            expect(loopKeys).toEqual(expect.arrayContaining(['a', 'b']));
        });

        it('should support spread operator on proxy', () => {
            const backend = createMockBackend();
            const proxy = new SimpleProxy(backend);

            backend.setValue('x', 10);
            backend.setValue('y', 20);

            const spread = { ...(proxy as any) };
            expect(spread.x).toBe(10);
            expect(spread.y).toBe(20);
        });
    });
});
