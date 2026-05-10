import type { Activity } from '../Activity.js';
import type { ActivityExecutionContext } from './ActivityExecutionContext.js';
import type { ActivityExecutionState, ActivityStateValue } from './ActivityExecutionState.js';
import type { ScopeTree } from './ScopeTree.js';
import { ActivityRuntimeError } from '../../errors/ActivityRuntimeError.js';

/** The scope object returned by proxy.obj(). */
type Scope = Record<string, any>;

export class CallContext {
    constructor(executionContext: ActivityExecutionContext);
    constructor(executionContext: ActivityExecutionContext, activity: Activity, scope?: Scope);
    constructor(executionContext: ActivityExecutionContext, activityId: string, scope?: Scope);
    constructor(executionContext: ActivityExecutionContext, activityOrActivityId?: Activity | string, scope?: Scope) {
        this._executionContext = executionContext;
        if (activityOrActivityId !== undefined) {
            this._activity =
                typeof activityOrActivityId === 'string' ? executionContext.getKnownActivity(activityOrActivityId) : activityOrActivityId;
        }
        this._scope = scope;
    }

    private _executionContext: ActivityExecutionContext;
    private _activity?: Activity;
    private _scope?: Scope;
    private _executionState?: ActivityExecutionState;

    get instanceId(): string | null {
        return this._activity?.instanceId ?? null;
    }

    get parentActivityId(): string | null {
        const id = this.instanceId;
        if (!id) {
            return null;
        }
        const state = this._executionContext.getExecutionState(id);
        return state.parentInstanceId;
    }

    get activity(): Activity {
        if (!this._activity) {
            throw new ActivityRuntimeError('CallContext has no activity.');
        }
        return this._activity;
    }

    get executionContext(): ActivityExecutionContext {
        return this._executionContext;
    }

    get executionState(): ActivityExecutionState {
        if (!this._executionState) {
            const id = this.instanceId;
            if (!id) {
                throw new ActivityRuntimeError('CallContext has no activity, cannot get execution state.');
            }
            this._executionState = this._executionContext.getExecutionState(id);
        }
        return this._executionState;
    }

    get scope(): Scope {
        if (!this._scope) {
            const id = this.instanceId;
            if (!id) {
                throw new ActivityRuntimeError('CallContext has no activity, cannot get scope.');
            }
            this._scope = this.getScopeTree().find(id);
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
            const id = this.instanceId;
            if (!id) {
                return null;
            }
            return new CallContext(this._executionContext, parentId, this.getScopeTree().back(id, keepScope));
        }
        return null;
    }

    complete(result?: unknown): void {
        this._activity!.complete(this, result);
    }

    cancel(): void {
        this._activity!.cancel(this);
    }

    idle(): void {
        this._activity!.idle(this);
    }

    fail(e: Error): void {
        this._activity!.fail(this, e);
    }

    end(reason: ActivityStateValue, result?: unknown): void {
        this._activity!.end(this, reason, result);
    }

    schedule(obj: Activity, endcallback: string): void {
        this._activity!.schedule(this, obj, endcallback);
    }

    createBookmark(name: string, callback: string): void {
        const id = this.instanceId;
        if (!id) {
            throw new ActivityRuntimeError('CallContext has no activity, cannot create bookmark.');
        }
        this._executionContext.createBookmark(id, name, callback);
    }

    resumeBookmark(name: string, reason: ActivityStateValue, result: unknown): void {
        this._executionContext.resumeBookmarkInternal(this, name, reason, result);
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
