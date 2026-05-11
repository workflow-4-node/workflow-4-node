import { EventEmitter } from 'events';
import { ActivityState } from '../../common/enums.js';
import { converters } from '../../common/converters.js';
import { ActivityRuntimeError } from '../../errors/ActivityRuntimeError.js';
import { BookmarkNotFoundError } from '../../errors/BookmarkNotFoundError.js';
import { TypeError as W4NTypeError } from '../../errors/TypeError.js';
import { Activity } from '../Activity.js';
import type { ActivityStateValue } from './ActivityExecutionState.js';
import type { Serializer } from '../../serialization/Serializer.js';
import { ScopeTree } from './ScopeTree.js';
import { ActivityExecutionState } from './ActivityExecutionState.js';
import { ResumeBookmarkQueue } from './ResumeBookmarkQueue.js';
import { CallContext } from './CallContext.js';

interface Bookmark {
    name: string;
    instanceId: string;
    timestamp: number;
    endCallback: string | ((...args: unknown[]) => void);
}

/** Shared noop function for bookmark callback reset, matching the old _.noop pattern. */
const noop = () => {
    /* noop */
};

export class ActivityExecutionContext extends EventEmitter {
    constructor(engine?: unknown) {
        super();
        this.engine = engine;
        this._scopeTree = this.createScopeTree();
    }

    //#region Private fields

    readonly engine?: unknown;
    private readonly _activityStates = new Map<string, ActivityExecutionState>();
    private readonly _bookmarks = new Map<string, Bookmark>();
    private readonly _resumeBMQueue = new ResumeBookmarkQueue();
    private readonly _knownActivities = new Map<string, Activity>();
    private _scopeTree: ScopeTree;
    private _rootActivity: Activity | null = null;

    //#endregion

    //#region Public getters

    get rootActivity(): Activity {
        if (!this._rootActivity) {
            throw new ActivityRuntimeError('Context is not initialized.');
        }
        return this._rootActivity;
    }

    //#endregion

    //#region Public methods

    initialize(rootActivity: Activity): void {
        if (this._rootActivity) {
            throw new ActivityRuntimeError('Context is already initialized.');
        }
        if (!(rootActivity instanceof Activity)) {
            throw new W4NTypeError("Argument 'rootActivity' value is not an activity.");
        }

        this._rootActivity = rootActivity;
        this.initializeImpl(null, rootActivity, { instanceId: 0 });
    }

    getExecutionState(activityOrId: Activity | string): ActivityExecutionState {
        let id: string;

        if (typeof activityOrId === 'string') {
            id = activityOrId;
        } else if (activityOrId && typeof activityOrId.instanceId === 'string') {
            id = activityOrId.instanceId;
        } else {
            throw new W4NTypeError('Cannot get state of ' + String(activityOrId));
        }

        let state = this._activityStates.get(id);
        if (!state) {
            state = new ActivityExecutionState(id);
            state.on(ActivityState.run, (args: unknown) => {
                this.emit(ActivityState.run, args);
            });
            state.on(ActivityState.end, (args: unknown) => {
                this.emit(ActivityState.end, args);
            });
            this._activityStates.set(id, state);
        }
        return state;
    }

    createBookmark(activityId: string, name: string, endCallback: string): string {
        this.registerBookmark({
            name,
            instanceId: activityId,
            timestamp: Date.now(),
            endCallback,
        });
        return name;
    }

    registerBookmark(bookmark: Bookmark): void {
        if (this._bookmarks.has(bookmark.name)) {
            throw new ActivityRuntimeError("Bookmark '" + bookmark.name + "' already exists.");
        }
        this._bookmarks.set(bookmark.name, bookmark);
    }

    isBookmarkExists(name: string): boolean {
        return this._bookmarks.has(name);
    }

    getBookmarkTimestamp(name: string, throwIfNotFound?: boolean): number | null {
        const bm = this._bookmarks.get(name);
        if (!bm && throwIfNotFound) {
            throw new BookmarkNotFoundError("Bookmark '" + name + "' not found.");
        }
        return bm ? bm.timestamp : null;
    }

    deleteBookmark(name: string): void {
        this._bookmarks.delete(name);
    }

    noopCallbacks(bookmarkNames: string[]): void {
        for (const name of bookmarkNames) {
            const bm = this._bookmarks.get(name);
            if (bm) {
                bm.endCallback = noop;
            }
        }
    }

    async resumeBookmarkInScope(callContext: CallContext, name: string, reason: string, result: unknown): Promise<boolean> {
        const bm = this._bookmarks.get(name);
        if (!bm) {
            throw new BookmarkNotFoundError("Bookmark '" + name + "' doesn't exist. Cannot continue with reason: " + reason + '.');
        }

        return new Promise<boolean>((resolve, reject) => {
            setImmediate(() => {
                try {
                    const currentBm = this._bookmarks.get(name);
                    if (currentBm) {
                        // If bm still exists.
                        this.doResumeBookmark(
                            callContext,
                            currentBm,
                            reason,
                            result,
                            (reason as ActivityStateValue) === ActivityState.idle,
                        );
                        resolve(true);
                    }
                    resolve(false);
                } catch (e) {
                    reject(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
                }
            });
        });
    }

    resumeBookmarkInternal(_callContext: CallContext, name: string, reason: string, result: unknown): void {
        this._resumeBMQueue.enqueue(name, reason, result);
    }

    resumeBookmarkExternal(name: string, reason: string, result: unknown): void {
        const bm = this._bookmarks.get(name);
        if (!bm) {
            throw new BookmarkNotFoundError(
                "External resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exist.",
            );
        }
        this.doResumeBookmark(new CallContext(this, bm.instanceId), bm, reason, result);
    }

    processResumeBookmarkQueue(): boolean {
        const command = this._resumeBMQueue.dequeue();
        if (command) {
            const bm = this._bookmarks.get(command.name);
            if (!bm) {
                throw new BookmarkNotFoundError(
                    "Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exist.",
                );
            }
            this.doResumeBookmark(new CallContext(this, bm.instanceId), bm, command.reason, command.result);
            return true;
        }
        return false;
    }

    cancelExecution(scope: unknown, ids: string[]): void {
        const allIds = new Set<string>();
        for (const id of ids) {
            this.cancelSubtree(scope, allIds, id);
        }
        for (const [name, bm] of this._bookmarks) {
            if (allIds.has(bm.instanceId)) {
                this._bookmarks.delete(name);
            }
        }
    }

    deleteScopeOfActivity(callContext: CallContext, activityId: string): void {
        this.getScopeTree().deleteScopePart(callContext.instanceId, activityId);
    }

    getKnownActivity(activityId: string): Activity {
        const activity = this._knownActivities.get(activityId);
        if (!activity) {
            throw new ActivityRuntimeError("Activity by id '" + activityId + "' not found.");
        }
        return activity;
    }

    getScopeTree(): ScopeTree {
        return this._scopeTree;
    }

    emitWorkflowEvent(args: unknown[]): void {
        this.emit('workflowEvent', args);
    }

    //#endregion

    //#region Serialization

    getStateAndPromotions(
        serializer?: Serializer,
        enablePromotions?: boolean,
    ): { state: unknown; promotedProperties: Record<string, unknown> | null } {
        if (serializer && typeof serializer.toJSON !== 'function') {
            throw new W4NTypeError("Argument 'serializer' is not a serializer.");
        }

        const activityStates = new Map<string, Record<string, unknown>>();
        for (const s of this._activityStates.values()) {
            activityStates.set(s.instanceId, s.toJSON());
        }

        const scopeStateAndPromotions = this.getScopeTree().getExecutionState(this, !!enablePromotions, serializer);

        let serialized: unknown;
        if (serializer) {
            serialized = serializer.toJSON({
                activityStates,
                bookmarks: this._bookmarks,
                scope: scopeStateAndPromotions.state,
            });
        } else {
            serialized = {
                activityStates: converters.mapToArray(activityStates),
                bookmarks: converters.mapToArray(this._bookmarks),
                scope: scopeStateAndPromotions.state,
            };
        }

        return {
            state: serialized,
            promotedProperties: scopeStateAndPromotions.promotedProperties,
        };
    }

    setState(serializer: Serializer, json: string): void;
    setState(serializer: undefined, json: Record<string, unknown>): void;
    setState(serializer: Serializer | undefined, json: unknown): void {
        if (serializer && typeof serializer.fromJSON !== 'function') {
            throw new W4NTypeError("Argument 'serializer' is not a serializer.");
        }

        let parsed: Record<string, unknown>;

        if (serializer) {
            if (typeof json !== 'string') {
                throw new W4NTypeError("Argument 'json' is not a string when serializer is provided.");
            }
            parsed = serializer.fromJSON(json);
            if (!(parsed.activityStates instanceof Map)) {
                throw new W4NTypeError("activityStates property value of argument 'json' is not a Map instance.");
            }
            if (!(parsed.bookmarks instanceof Map)) {
                throw new W4NTypeError("Bookmarks property value of argument 'json' is not a Map instance.");
            }
        } else {
            if (typeof json !== 'object' || json === null) {
                throw new W4NTypeError("Argument 'json' is not an object.");
            }
            if (!('activityStates' in json) || !json.activityStates) {
                throw new W4NTypeError("activityStates property value of argument 'json' is not an object.");
            }
            if (!('bookmarks' in json) || !json.bookmarks) {
                throw new W4NTypeError("Bookmarks property value of argument 'json' is not an object.");
            }
            // Deserialize from raw arrays.
            const rawActivityStates = converters.arrayToMap(json.activityStates as [string, unknown][]);
            const rawBookmarks = converters.arrayToMap(json.bookmarks as [string, unknown][]);
            parsed = {
                activityStates: rawActivityStates,
                bookmarks: rawBookmarks,
                scope: 'scope' in json ? json.scope : undefined,
            };
        }

        if (!(parsed.activityStates instanceof Map)) {
            throw new ActivityRuntimeError('activityStates is not a Map.');
        }
        for (const s of this._activityStates.values()) {
            const stored = (parsed.activityStates as Map<string, Record<string, unknown>>).get(s.instanceId);
            if (!stored) {
                throw new ActivityRuntimeError("Activity's state of '" + s.instanceId + "' not found.");
            }
            s.fromJSON(stored);
        }

        if (!(parsed.bookmarks instanceof Map)) {
            throw new ActivityRuntimeError('bookmarks is not a Map.');
        }
        this._bookmarks.clear();
        for (const [key, value] of (parsed.bookmarks as Map<string, Bookmark>).entries()) {
            this._bookmarks.set(key, value);
        }
        this.getScopeTree().setState(parsed.scope as Parameters<ScopeTree['setState']>[0], serializer);
    }

    //#endregion

    //#region Private methods

    private createScopeTree(): ScopeTree {
        return new ScopeTree(
            {
                resultCollected: (context: CallContext, reason: string, result: unknown, bookmarkName: string) => {
                    context.activity.resultCollected.call(context.scope, context, reason as ActivityStateValue, result, bookmarkName);
                },
            },
            (id: string) => this.getKnownActivity(id),
        );
    }

    private initializeImpl(parent: Activity | null, activity: Activity, idCounter: { instanceId: number }): void {
        const activityInstanceId = activity.internalInstanceId;
        const nextId = (idCounter.instanceId++).toString();

        let effectiveId: string;
        if (!activityInstanceId) {
            effectiveId = nextId;
            activity.instanceId = effectiveId;
        } else if (activityInstanceId !== nextId) {
            throw new ActivityRuntimeError('Activity ' + activity.toString() + ' has been assigned to another position.');
        } else {
            effectiveId = activityInstanceId;
        }

        const state = this.getExecutionState(effectiveId);
        state.parentInstanceId = parent ? parent.instanceId : null;
        this._knownActivities.set(effectiveId, activity);

        for (const child of activity.immediateChildren(this)) {
            this.initializeImpl(activity, child, idCounter);
            state.childInstanceIds.add(child.instanceId);
        }
    }

    private doResumeBookmark(callContext: CallContext, bookmark: Bookmark, reason: string, result: unknown, noRemove?: boolean): void {
        if (!noRemove) {
            this._bookmarks.delete(bookmark.name);
        }

        const scope = callContext.scope;
        let cb: ((...args: unknown[]) => void) | null = null;

        if (typeof bookmark.endCallback === 'string') {
            const scopeCb = (scope as Record<string, unknown>)[bookmark.endCallback];
            if (typeof scopeCb === 'function') {
                cb = scopeCb as (...args: unknown[]) => void;
            }
        } else if (typeof bookmark.endCallback === 'function') {
            cb = bookmark.endCallback;
        }

        if (!cb) {
            throw new ActivityRuntimeError(
                "Bookmark's '" + bookmark.name + "' callback '" + String(bookmark.endCallback) + "' is not defined on the current scope.",
            );
        }

        // TODO: if it fails, resume on default callback with the error!
        cb.call(scope, callContext, reason, result, bookmark);
    }

    private cancelSubtree(scope: unknown, allIds: Set<string>, activityId: string): void {
        allIds.add(activityId);
        const state = this.getExecutionState(activityId);
        for (const id of state.childInstanceIds.values()) {
            this.cancelSubtree(scope, allIds, id);
        }
        state.reportState(ActivityState.cancel, null, scope);
    }

    //#endregion
}
