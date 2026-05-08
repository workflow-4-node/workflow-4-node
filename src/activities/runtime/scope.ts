import { SimpleProxy, type ProxyBackend } from '../../common/SimpleProxy.js';
import { type ScopeNode } from './ScopeNode.js';

export const scope = {
    create(node: ScopeNode): SimpleProxy {
        const backend: ProxyBackend = {
            getKeys(): string[] {
                return [...node.enumeratePropertyNames()];
            },

            hasKey(property: string): boolean {
                return node.isPropertyExists(property);
            },

            getValue(property: string): any {
                if (property === '$keys') {
                    return node.enumeratePropertyNames();
                }
                if (property === 'delete') {
                    return (name: string) => node.deleteProperty(name);
                }
                return node.getPropertyValue(property);
            },

            setValue(property: string, value: any): void {
                node.setPropertyValue(property, value);
            },

            delete(property: string): void {
                node.deleteProperty(property);
            },
        };

        return new SimpleProxy(backend);
    },
};
