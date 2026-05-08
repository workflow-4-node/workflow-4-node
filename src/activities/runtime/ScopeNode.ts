import { TypeError } from '../../errors/TypeError.js';

export class ScopeNode {
    constructor(instanceId: string, scopePart: Record<string, any>, userId?: string, activity?: unknown) {
        this.instanceId = instanceId;
        this.userId = userId;
        this.activity = activity ?? null;
        this.scopePartValue = scopePart;
        for (const key in scopePart) {
            this.keys.push(key);
        }
    }

    readonly instanceId: string;
    readonly userId?: string;
    readonly activity: unknown = null;

    private scopePartValue: Record<string, any>;
    private keys: string[] = [];
    private childrenMap: Map<string, ScopeNode> = new Map();
    private _parent: ScopeNode | null = null;

    get scopePart(): Record<string, any> {
        return this.scopePartValue;
    }

    get parent(): ScopeNode | null {
        return this._parent;
    }

    set parent(value: ScopeNode | null) {
        if (value === null) {
            throw new TypeError('Node argument expected.');
        }
        if (this._parent !== null) {
            throw new Error('Parent already defined.');
        }
        value.addChild(this);
    }

    *walkToRoot(): Generator<ScopeNode> {
        yield this;
        if (this._parent) {
            yield* this._parent.walkToRoot();
        }
    }

    *children(): Generator<ScopeNode> {
        for (const child of this.childrenMap.values()) {
            yield child;
        }
    }

    addChild(childItem: ScopeNode): void {
        if (childItem._parent) {
            throw new Error('Item has already had a parent node.');
        }
        childItem._parent = this;
        this.childrenMap.set(childItem.instanceId, childItem);
    }

    removeChild(childItem: ScopeNode): void {
        if (childItem._parent !== this) {
            throw new Error("Item is not a current node's child.");
        }
        childItem._parent = null;
        this.childrenMap.delete(childItem.instanceId);
    }

    clearChildren(): void {
        this.childrenMap.clear();
    }

    isPropertyExists(name: string): boolean {
        return name in this.scopePartValue;
    }

    getPropertyValue(name: string, canReturnPrivate?: boolean): any {
        if (canReturnPrivate) {
            return this.scopePartValue[name];
        }
        if (!ScopeNode.isPrivate(name)) {
            return this.scopePartValue[name];
        }
    }

    setPropertyValue(name: string, value: any, canSetPrivate?: boolean): boolean {
        if (ScopeNode.isPrivate(name)) {
            if (canSetPrivate) {
                if (!this.isPropertyExists(name)) {
                    this.keys.push(name);
                }
                this.scopePartValue[name] = value;
                return true;
            }
            return false;
        }
        if (name in this.scopePartValue) {
            this.scopePartValue[name] = value;
            return true;
        }
        return false;
    }

    createPropertyWithValue(name: string, value: any): void {
        if (!this.isPropertyExists(name)) {
            this.keys.push(name);
        }
        this.scopePartValue[name] = value;
    }

    deleteProperty(name: string, canDeletePrivate?: boolean): boolean {
        if (!(name in this.scopePartValue)) {
            return false;
        }
        if (ScopeNode.isPrivate(name) && !canDeletePrivate) {
            return false;
        }
        const index = this.keys.indexOf(name);
        if (index !== -1) {
            this.keys.splice(index, 1);
        }
        delete this.scopePartValue[name];
        return true;
    }

    *enumeratePropertyNames(canEnumeratePrivate?: boolean): Generator<string> {
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            if (canEnumeratePrivate || !ScopeNode.isPrivate(key)) {
                yield key;
            }
        }
    }

    *properties(): Generator<{ name: string; value: any }> {
        for (const key of this.keys) {
            yield { name: key, value: this.scopePartValue[key] };
        }
    }

    private static isPrivate(key: string): boolean {
        return key.startsWith('_');
    }
}
