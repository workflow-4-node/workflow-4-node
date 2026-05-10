export interface ProxyBackend {
    getValue(property: string | symbol): any;
    setValue(property: string | symbol, value: any): void;
    getKeys(): (string | symbol)[];
    hasKey(property: string | symbol): boolean;
    delete?(property: string | symbol): void;
}

export class ProxyBackendObject implements ProxyBackend {
    private readonly obj: Record<string | symbol, any> = {};

    getKeys(): (string | symbol)[] {
        return Object.keys(this.obj);
    }

    hasKey(property: string | symbol): boolean {
        return property in this.obj;
    }

    getValue(property: string | symbol): any {
        return this.obj[property];
    }

    setValue(property: string | symbol, value: any): void {
        this.obj[property] = value;
    }

    delete(property: string | symbol): void {
        delete this.obj[property];
    }

    entries() {
        return Object.entries(this.obj);
    }
}

export const proxy = {
    obj(backend?: ProxyBackend) {
        return this.create<Record<string | symbol, any>>({}, backend);
    },

    create<T extends object>(obj: T, backend?: ProxyBackend): T {
        const currentBackend = backend ?? new ProxyBackendObject();
        return new Proxy(obj, {
            get: (_, prop: string | symbol, receiver) => {
                if (prop in obj) {
                    return Reflect.get(obj, prop, receiver);
                }
                return currentBackend.getValue(prop);
            },
            set: (_, prop: string | symbol, value, receiver) => {
                if (prop in obj) {
                    return Reflect.set(obj, prop, value, receiver);
                }
                currentBackend.setValue(prop, value);
                return true;
            },
            has: (_, prop: string | symbol) => {
                return prop in obj || currentBackend.hasKey(prop);
            },
            deleteProperty: (_, prop: string | symbol) => {
                currentBackend.delete?.(prop);
                return true;
            },
            ownKeys: () => {
                const keys = [...Reflect.ownKeys(obj)];
                for (const key of currentBackend.getKeys()) {
                    if (!keys.includes(key)) {
                        keys.push(key);
                    }
                }
                return keys;
            },
            getOwnPropertyDescriptor: (_, prop: string | symbol) => {
                if (prop in obj) {
                    return Reflect.getOwnPropertyDescriptor(obj, prop);
                }
                if (currentBackend.hasKey(prop)) {
                    return {
                        enumerable: true,
                        configurable: true,
                        get: () => currentBackend.getValue(prop),
                        set: (v) => currentBackend.setValue(prop, v),
                    };
                }
                return undefined;
            },
        });
    },
};
