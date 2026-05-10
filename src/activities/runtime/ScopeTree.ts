import { constants } from '../../common/constants.js';
import { WorkflowError } from '../../errors/WorkflowError.js';
import { TypeError } from '../../errors/TypeError.js';
import { type Serializer } from '../../serialization/Serializer.js';
import { type Activity } from '../Activity.js';
import { Expression } from '../Expression.js';
import { type ActivityExecutionContext } from './ActivityExecutionContext.js';
import { scope } from './scope.js';
import { ScopeNode } from './ScopeNode.js';
import type { SerializedScopeNode } from './ScopeNode.js';
import { scopeSerializer } from './scopeSerializer.js';

export class ScopeTree {
    constructor(initialScope: Record<string, any>, getActivityByIdFunc: (activityId: string) => Activity) {
        this.initialNode = new ScopeNode(constants.ids.initialScope, initialScope);
        this.nodes = new Map();
        this.nodes.set(this.initialNode.instanceId, this.initialNode);
        this.getActivityById = getActivityByIdFunc;
    }

    private readonly initialNode: ScopeNode;
    private nodes: Map<string, ScopeNode>;
    private readonly getActivityById: (activityId: string) => Activity;

    //#region Serialization

    getExecutionState(execContext: ActivityExecutionContext, enablePromotions: boolean, serializer?: Serializer) {
        return scopeSerializer.serialize(execContext, this.getActivityById, enablePromotions, this.nodes.values(), serializer);
    }

    setState(json: SerializedScopeNode[], serializer?: Serializer): void {
        if (!Array.isArray(json)) {
            throw new TypeError('Array argument expected.');
        }

        if (this.nodes.size !== 1) {
            const prev = this.nodes;
            this.nodes = new Map();
            this.nodes.set(constants.ids.initialScope, prev.get(constants.ids.initialScope)!);
            this.initialNode.clearChildren();
        }

        try {
            // Create nodes:
            for (const node of scopeSerializer.deserializeNodes(this.getActivityById, json, serializer)) {
                this.nodes.set(node.instanceId, node);
            }
            // Setup Tree:
            for (const item of json) {
                const child = this.nodes.get(item.instanceId);
                if (item.parentId !== null) {
                    const parent = this.nodes.get(item.parentId);
                    if (child && parent) {
                        child.parent = parent;
                    }
                }
            }
            // Setup specials:
            for (const node of this.nodes.values()) {
                for (const key of Object.keys(node.scopePart)) {
                    const value = node.scopePart[key];
                    if (value && value.$type === constants.markers.$parent) {
                        const parentNode = this.nodes.get(String(value.id));
                        if (parentNode) {
                            const parentScope = scope.create(this, parentNode);
                            (parentScope as Record<string, unknown>).__marker = constants.markers.$parent;
                            node.scopePart[key] = parentScope;
                        }
                    }
                }
            }
        } catch (e) {
            throw new WorkflowError('Cannot restore state tree, because data is corrupt.', e instanceof Error ? e : undefined);
        }
    }

    //#endregion

    //#region Proxy

    private getRealParent(currentNode: ScopeNode): ScopeNode | null {
        const parent = currentNode.parent;
        if (parent && currentNode.activity instanceof Expression) {
            return parent.parent;
        }
        return parent;
    }

    hasProperty(currentNode: ScopeNode, name: string): boolean {
        if (name === '$parent') {
            const parent = this.getRealParent(currentNode);
            if (parent && parent !== this.initialNode) {
                return true;
            }
            return false;
        }

        if (name === '$activity') {
            return true;
        }

        for (const node of currentNode.walkToRoot()) {
            if (node.isPropertyExists(name)) {
                return true;
            }
            if (node.userId === name) {
                return true;
            }
        }
        return false;
    }

    getValue(currentNode: ScopeNode, name: string): unknown {
        if (name === '$parent') {
            const parent = this.getRealParent(currentNode);
            if (parent && parent !== this.initialNode) {
                const parentScope = scope.create(this, parent);
                (parentScope as Record<string, unknown>).__marker = constants.markers.$parent;
                return parentScope;
            }
            return undefined;
        }

        if (name === '$activity') {
            return currentNode.activity;
        }

        let canReturnPrivate = true;
        for (const node of currentNode.walkToRoot()) {
            const value = node.getPropertyValue(name, canReturnPrivate);
            if (value !== undefined) {
                return value;
            }
            if (node.userId === name && node !== currentNode) {
                return scope.create(this, node);
            }
            canReturnPrivate = false;
        }
        return undefined;
    }

    setValue(currentNode: ScopeNode, name: string, value: unknown, noWalk?: boolean): boolean {
        let canSetPrivate = true;
        let setDone = false;
        for (const node of currentNode.walkToRoot()) {
            if (node === this.initialNode) {
                break;
            }
            if (node.setPropertyValue(name, value, canSetPrivate)) {
                setDone = true;
                break;
            }
            canSetPrivate = false;
            if (noWalk) {
                break;
            }
        }

        if (!setDone) {
            currentNode.createPropertyWithValue(name, value);
        }

        return true;
    }

    deleteProperty(currentNode: ScopeNode, name: string, noWalk?: boolean): boolean {
        let canDeletePrivate = true;
        for (const node of currentNode.walkToRoot()) {
            if (node === this.initialNode) {
                break;
            }
            if (node.deleteProperty(name, canDeletePrivate)) {
                return true;
            }
            canDeletePrivate = false;
            if (noWalk) {
                break;
            }
        }
        return false;
    }

    *enumeratePropertyNames(currentNode: ScopeNode, noWalk?: boolean): Generator<string> {
        let canEnumeratePrivate = true;
        let node: ScopeNode | null = currentNode;
        do {
            yield '$parent';
            yield '$activity';
            if (node.userId) {
                yield node.userId;
            }
            yield* node.enumeratePropertyNames(canEnumeratePrivate);
            canEnumeratePrivate = false;

            if (noWalk) {
                break;
            }

            node = node.parent;
        } while (node);
    }

    //#endregion

    //#region Walk

    next(nodeInstanceId: string, childInstanceId: string, scopePart: Record<string, any>, childUserId?: string) {
        const currentNode = this.getNodeByExternalId(nodeInstanceId);
        const nextNode = new ScopeNode(childInstanceId, scopePart, childUserId, this.getActivityById(childInstanceId));
        currentNode.addChild(nextNode);
        this.nodes.set(childInstanceId, nextNode);
        return scope.create(this, nextNode);
    }

    back(nodeId: string, keepItem?: boolean) {
        const currentNode = this.getNodeByExternalId(nodeId);
        if (currentNode === this.initialNode) {
            throw new Error('Cannot go back because current scope is the initial scope.');
        }
        const parent = currentNode.parent!;
        if (!keepItem) {
            parent.removeChild(currentNode);
            this.nodes.delete(currentNode.instanceId);
        }
        return scope.create(this, parent);
    }

    find(nodeId: string) {
        const currentNode = this.getNodeByExternalId(nodeId);
        return scope.create(this, currentNode);
    }

    findPart(nodeId: string): Record<string, any> | null {
        const currentNode = this.getNodeByExternalId(nodeId);
        if (currentNode !== this.initialNode) {
            return currentNode.scopePart;
        }
        return null;
    }

    //#endregion

    //#region Helpers

    private getNodeByExternalId(id: string): ScopeNode {
        if (id === constants.ids.initialScope) {
            return this.initialNode;
        }
        const node = this.nodes.get(id);
        if (!node) {
            throw new Error("Scope node for activity id '" + id + "' is not found.");
        }
        return node;
    }

    deleteScopePart(currentNodeId: string, id: string): void {
        const currentNode = this.getNodeByExternalId(currentNodeId);
        const delNode = this.nodes.get(id);
        if (delNode) {
            if (delNode === this.initialNode) {
                throw new Error('Cannot delete the initial scope.');
            }
            let found = false;
            for (const node of delNode.walkToRoot()) {
                if (node === currentNode) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error('Cannot delete scope, because current active scope is inside in it.');
            }
            delNode.parent!.removeChild(delNode);
            this.removeAllNodes(delNode);
        }
    }

    private removeAllNodes(node: ScopeNode): void {
        this.nodes.delete(node.instanceId);
        for (const c of node.children()) {
            this.removeAllNodes(c);
        }
    }

    //#endregion
}
