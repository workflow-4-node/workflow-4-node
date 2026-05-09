import type { Activity } from '../Activity.js';
import type { ActivityExecutionContext } from './ActivityExecutionContext.js';
import type { ActivityExecutionState } from './ActivityExecutionState.js';
import type { SimpleProxy } from '../../common/SimpleProxy.js';
import type { ScopeTree } from './ScopeTree.js';

export class CallContext {
    constructor(executionContext: ActivityExecutionContext, activity: Activity, scope?: SimpleProxy);
    constructor(executionContext: ActivityExecutionContext, activityId: string, scope?: SimpleProxy);
    constructor(executionContext: ActivityExecutionContext, activityOrActivityId: Activity | string, scope?: SimpleProxy) {
        this._executionContext = executionContext;
        this._activity =
            typeof activityOrActivityId === 'string' ? executionContext.getKnownActivity(activityOrActivityId) : activityOrActivityId;
        this._scope = scope;
    }

    private _executionContext: ActivityExecutionContext;
    private _activity: Activity;
    private _scope?: SimpleProxy;
    private _executionState?: ActivityExecutionState;

    get instanceId(): string {
        return this._activity.instanceId;
    }

    get parentActivityId(): string | null {
        const state = this._executionContext.getExecutionState(this.instanceId);
        return state.parentInstanceId;
    }

    get activity(): Activity {
        return this._activity;
    }

    get executionContext(): ActivityExecutionContext {
        return this._executionContext;
    }

    get executionState(): ActivityExecutionState {
        if (!this._executionState) {
            this._executionState = this._executionContext.getExecutionState(this.instanceId);
        }
        return this._executionState;
    }

    get scope(): SimpleProxy {
        if (!this._scope) {
            this._scope = this.getScopeTree().find(this.instanceId);
        }
        return this._scope;
    }

    next(childActivityOrActivityId: Activity | string, variables?: Record<string, unknown>): CallContext {
        const child = this.asActivity(childActivityOrActivityId);
        const part = child.createScopePart();
        if (variables) {
            Object.assign(part, variables);
        }
        return new CallContext(this._executionContext, child, this.getScopeTree().next(this.instanceId, child.instanceId, part, child.id));
    }

    back(keepScope?: boolean): CallContext | null {
        const parentId = this.parentActivityId;
        if (parentId) {
            return new CallContext(this._executionContext, parentId, this.getScopeTree().back(this.instanceId, keepScope));
        }
        return null;
    }

    complete(result?: unknown): void {
        this._activity.complete(this, result);
    }

    cancel(): void {
        this._activity.cancel(this);
    }

    idle(): void {
        this._activity.idle(this);
    }

    fail(e: Error): void {
        this._activity.fail(this, e);
    }

    end(reason: string, result?: unknown): void {
        this._activity.end(this, reason, result);
    }

    schedule(obj: Activity, endcallback: string): void {
        this._activity.schedule(this, obj, endcallback);
    }

    createBookmark(name: string, callback: string): void {
        this._executionContext.createBookmark(this.instanceId, name, callback);
    }

    resumeBookmark(name: string, reason: string, result: unknown): void {
        this._executionContext.resumeBookmarkInScope(this, name, reason, result);
    }

    private asActivity(activityOrActivityId: Activity | string): Activity {
        if (typeof activityOrActivityId !== 'string') {
            return activityOrActivityId;
        }
        return this._executionContext.getKnownActivity(activityOrActivityId);
    }

    private getScopeTree(): ScopeTree {
        return this._executionContext.getScopeTree();
    }
}
