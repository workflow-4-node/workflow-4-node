import { SimpleProxy, type ProxyBackend } from '../../common/SimpleProxy.js';
import { type ScopeNode } from './ScopeNode.js';
import type { ScopeTree } from './ScopeTree.js';

export const scope = {
    create(scopeTree: ScopeTree, node: ScopeNode): SimpleProxy {
        const backend: ProxyBackend = {
            getKeys(): string[] {
                const keys: string[] = [];
                const seen = new Set<string>();
                for (const key of scopeTree.enumeratePropertyNames(node)) {
                    if (!seen.has(key)) {
                        keys.push(key);
                        seen.add(key);
                    }
                }
                return keys;
            },

            hasKey(property: string): boolean {
                return scopeTree.hasProperty(node, property);
            },

            getValue(property: string): any {
                if (property === '$keys') {
                    return scopeTree.enumeratePropertyNames(node);
                }
                if (property === 'delete') {
                    return (name: string) => scopeTree.deleteProperty(node, name);
                }
                return scopeTree.getValue(node, property);
            },

            setValue(property: string, value: any): void {
                scopeTree.setValue(node, property, value);
            },

            delete(property: string): void {
                scopeTree.deleteProperty(node, property);
            },
        };

        return new SimpleProxy(backend);
    },
};
