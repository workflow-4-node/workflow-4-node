export interface ProxyBackend {
    getValue(property: string): any;
    setValue(property: string, value: any): void;
    getKeys(): string[];
    hasKey(property: string): boolean;
    delete?(property: string): void;
}

export class SimpleProxy {
    [key: string]: any;

    constructor(backend: ProxyBackend) {
        return new Proxy(this, {
            get: (_, prop: string | symbol, receiver) => {
                if (prop in this || typeof prop === 'symbol') {
                    return Reflect.get(this, prop, receiver);
                }
                return backend.getValue(prop);
            },
            set: (_, prop: string | symbol, value, receiver) => {
                if (typeof prop === 'symbol') {
                    return Reflect.set(this, prop, value, receiver);
                }
                backend.setValue(prop, value);
                return true;
            },
            has: (_, prop: string | symbol) => {
                return typeof prop === 'symbol' || prop in this || backend.hasKey(prop);
            },
            deleteProperty: (_, prop: string | symbol) => {
                if (typeof prop === 'symbol') return true;
                backend.delete?.(prop);
                return true;
            },
            ownKeys: () => {
                const keys = new Set([...Reflect.ownKeys(this), ...backend.getKeys()]);
                return [...keys];
            },
            getOwnPropertyDescriptor: (_, prop: string | symbol) => {
                if (prop in this || typeof prop === 'symbol') {
                    return Reflect.getOwnPropertyDescriptor(this, prop);
                }
                if (backend.hasKey(prop)) {
                    return {
                        enumerable: true,
                        configurable: true,
                        get: () => backend.getValue(prop),
                        set: (v) => backend.setValue(prop, v),
                    };
                }
                return undefined;
            },
        });
    }
}
