import { randomUUID } from 'node:crypto';
import { ExtensibleSet } from '../common/ExtensibleSet.js';
import { ActivityState } from '../common/enums.js';
import { specStrings } from '../common/specStrings.js';
import { type Logger, w4fLogger } from '../common/w4nLogger.js';
import { ActivityRuntimeError } from '../errors/ActivityRuntimeError.js';
import { ActivityStateExceptionError } from '../errors/ActivityStateExceptionError.js';
import { TypeError as W4NTypeError } from '../errors/TypeError.js';
import type { ActivityExecutionContext } from './runtime/ActivityExecutionContext.js';
import type { ActivityStateValue } from './runtime/ActivityExecutionState.js';
import type { CallContext } from './runtime/CallContext.js';

interface SchedulingState {
    many: boolean;
    indices: Map<string, number>;
    results: unknown[];
    total: number;
    idleCount: number;
    cancelCount: number;
    completedCount: number;
    endBookmarkName: string | null;
    endCallbackName: string;
}

/** Default set of property names excluded from activity scopes. */
const HIDE_FROM_SCOPE_DEFAULTS = new Set([
    // Activity identity / metadata
    'id',
    '@import',
    'args',
    'displayName',
    // Internal state
    '_instanceId',
    '_structureInitialized',
    '_scopeKeys',
    '_createScopePartImpl',
    '_collectAll',
    // Internal sets — backing fields are own properties
    '_nonSerializedProperties',
    '_hideFromScopeProperties',
    '_codeProperties',
    '_arrayProperties',
    // Getters / accessors (defensive — subclasses may shadow them as own props)
    'hideFromScopeProperties',
    'nonSerializedProperties',
    'codeProperties',
    'arrayProperties',
    'collectAll',
    'instanceId',
    'internalInstanceId',
    'logger',
]);

export abstract class Activity {
    constructor() {
        this.id = randomUUID();
        this._nonSerializedProperties = new ExtensibleSet();
        this._hideFromScopeProperties = new ExtensibleSet(HIDE_FROM_SCOPE_DEFAULTS);
        this._codeProperties = new ExtensibleSet();
        this._arrayProperties = new ExtensibleSet();
        this._arrayProperties.add('args');
    }

    //#region Properties

    private readonly _nonSerializedProperties: ExtensibleSet<string>;
    private readonly _hideFromScopeProperties: ExtensibleSet<string>;
    private readonly _codeProperties: ExtensibleSet<string>;
    private readonly _arrayProperties: ExtensibleSet<string>;

    private _collectAll = true;
    private _instanceId: string | null = null;
    private _structureInitialized = false;
    private _scopeKeys: Set<string> | null = null;
    private _createScopePartImpl: ((a: Activity) => Record<string, unknown>) | null = null;

    get nonSerializedProperties(): ExtensibleSet<string> {
        return this._nonSerializedProperties;
    }

    /**
     * Properties in this set are excluded from the activity's scope.
     * They will NOT be available on `this` inside scope-bound methods
     * ({@link initializeExec}, {@link run}, {@link unInitializeExec},
     * {@link resultCollected}, {@link defaultEndCallback}).
     */
    protected get hideFromScopeProperties(): ExtensibleSet<string> {
        return this._hideFromScopeProperties;
    }

    protected get codeProperties(): ExtensibleSet<string> {
        return this._codeProperties;
    }

    protected get arrayProperties(): ExtensibleSet<string> {
        return this._arrayProperties;
    }

    readonly id: string;
    args: unknown[] = [];
    displayName: string | null = null;

    get collectAll(): boolean {
        return this._collectAll;
    }

    protected set collectAll(value: boolean) {
        this._collectAll = value;
    }

    get instanceId(): string {
        if (this._instanceId) {
            return this._instanceId;
        }
        throw new ActivityRuntimeError('Activity is not initialized in a context.');
    }

    /** @internal */
    set instanceId(value: string) {
        this._instanceId = value;
    }

    /** @internal */
    get internalInstanceId(): string | null {
        return this._instanceId;
    }

    get logger(): Logger {
        return w4fLogger.child({ activity: this.constructor.name });
    }

    //#endregion

    //#region Public methods

    toString(): string {
        return (this.displayName ? this.displayName + ' ' : '') + '(' + this.constructor.name + ':' + this.id + ')';
    }

    /* forEach */

    async all(execContext: ActivityExecutionContext): Promise<Activity[]> {
        return await this.childrenImpl(true, null, execContext, null);
    }

    async children(execContext: ActivityExecutionContext): Promise<Activity[]> {
        return await this.childrenImpl(true, this, execContext, null);
    }

    async immediateChildren(execContext: ActivityExecutionContext): Promise<Activity[]> {
        return await this.childrenImpl(false, this, execContext, null);
    }

    /* Structure */

    isArrayProperty(propName: string): boolean {
        return this._arrayProperties.has(propName);
    }

    /** Returns true if the property stores code (e.g., a function body) rather than a regular value. */
    isCodeProperty(propName: string): boolean {
        return this._codeProperties.has(propName);
    }

    async initializeStructure(_execContext: ActivityExecutionContext): Promise<void> {
        // virtual
    }

    clone(): this {
        const makeClone = (value: unknown, canCloneArrays: boolean): unknown => {
            if (value instanceof Activity) {
                return value.clone();
            }
            if (value instanceof Set) {
                const newSet = new Set();
                for (const item of value) {
                    newSet.add(item);
                }
                return newSet;
            }
            if (Array.isArray(value)) {
                if (canCloneArrays) {
                    return value.map((item) => makeClone(item, false));
                }
                return value;
            }
            return value;
        };

        const Ctor = this.constructor as new () => this;
        const newInst = new Ctor();
        for (const key of Object.keys(this) as (keyof this)[]) {
            const value = this[key];
            if (newInst[key] !== value) {
                (newInst as Record<string, unknown>)[key as string] = makeClone(value, true);
            }
        }
        return newInst;
    }

    /* RUN */

    start(callContext: CallContext, ...args: unknown[]): void {
        this.startImpl(callContext, null, args.length > 0 ? args : undefined);
    }

    /**
     * Called when the activity execution is about to start.
     *
     * @remarks
     * **IMPORTANT:** This method is invoked via `.call(scope)`, so `this` is bound to the
     * **scope object** (not the Activity instance). Properties listed in
     * {@link hideFromScopeProperties} are excluded from the scope and will NOT be available on
     * `this`. Access activity fields via `callContext.activity`.
     */
    initializeExec(): void {
        // virtual
    }

    /**
     * Called when the activity execution is ending (complete, cancel, idle, or fail).
     *
     * @remarks
     * **IMPORTANT:** This method is invoked via `.call(scope, reason, result)`, so `this` is
     * bound to the **scope object** (not the Activity instance). Properties listed in
     * {@link hideFromScopeProperties} are excluded from the scope and will NOT be available on
     * `this`. Access activity fields via `callContext.activity`.
     */
    unInitializeExec(_reason: ActivityStateValue, _result?: unknown): void {
        // virtual
    }

    /**
     * Executes the activity logic.
     *
     * @remarks
     * **IMPORTANT:** This method is invoked via `.call(scope, callContext, args)`, so `this` is
     * bound to the **scope object** (not the Activity instance). Properties listed in
     * {@link hideFromScopeProperties} are excluded from the scope and will NOT be available on
     * `this`. Access activity fields via `callContext.activity`.
     */
    run(callContext: CallContext, args: unknown[]): void {
        callContext.activity.complete(callContext, args);
    }

    complete(callContext: CallContext, result?: unknown): void {
        this.end(callContext, ActivityState.complete, result);
    }

    cancel(callContext: CallContext): void {
        this.end(callContext, ActivityState.cancel);
    }

    idle(callContext: CallContext): void {
        this.end(callContext, ActivityState.idle);
    }

    fail(callContext: CallContext, e: Error): void {
        this.end(callContext, ActivityState.fail, e);
    }

    end(callContext: CallContext, reason: ActivityStateValue, result?: unknown): void {
        let finalReason: ActivityStateValue = reason;
        let finalResult = result;

        try {
            this.unInitializeExec.call(callContext.scope, reason, result);
        } catch (e) {
            finalReason = ActivityState.fail;
            finalResult = e;
        }

        const state = callContext.executionState;

        if (state.execState === ActivityState.cancel || state.execState === ActivityState.fail) {
            return;
        }

        state.execState = finalReason;

        const inIdle = finalReason === ActivityState.idle;
        const execContext = callContext.executionContext;
        const savedScope = callContext.scope;

        const nextContext = callContext.back(inIdle);

        if (nextContext) {
            try {
                const bmName = specStrings.activities.createValueCollectedBMName(this.instanceId);
                if (execContext.isBookmarkExists(bmName)) {
                    void execContext
                        .resumeBookmarkInScope(nextContext, bmName, finalReason, finalResult)
                        .then(() => {
                            state.emitState(finalResult, savedScope);
                        })
                        .catch((e: unknown) => {
                            nextContext.fail(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
                        });
                    return;
                }
            } catch (e) {
                nextContext.fail(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            }
        } else {
            if (inIdle && execContext.processResumeBookmarkQueue()) {
                return;
            }
        }
        state.emitState(finalResult, savedScope);
    }

    schedule(callContext: CallContext, obj: unknown, endCallback?: string): void {
        const scope = callContext.scope;
        const execContext = callContext.executionContext;
        const selfId = callContext.instanceId;
        const log = this.logger;

        const effectiveEndCallback = endCallback || 'defaultEndCallback';

        if (typeof effectiveEndCallback !== 'string') {
            callContext.fail(new W4NTypeError("Provided argument 'endCallback' value is not a string."));
            return;
        }

        const invokeEndCallback = (reason: ActivityStateValue, result?: unknown): void => {
            setImmediate(async () => {
                const cb = (scope as Record<string, unknown>)[effectiveEndCallback];
                if (typeof cb === 'function') {
                    try {
                        await cb.call(scope, callContext, reason, result);
                    } catch (e) {
                        log.warn(e, 'Error happened in end callback: %s', effectiveEndCallback);
                    }
                }
            });
        };

        const cb = (scope as Record<string, unknown>)[effectiveEndCallback];
        if (typeof cb !== 'function') {
            callContext.fail(new W4NTypeError(`'${effectiveEndCallback}' is not a function.`));
            return;
        }

        if ((scope as Record<string, unknown>).__schedulingState) {
            log.warn('%s: Already existing scheduling state: %j', selfId, (scope as Record<string, unknown>).__schedulingState as any);
            callContext.fail(new ActivityStateExceptionError('There are already scheduled items exists.'));
            return;
        }

        log.debug("%s: Scheduling object(s) by using end callback '%s': %j", selfId, effectiveEndCallback, obj as any);

        const state: SchedulingState = {
            many: Array.isArray(obj),
            indices: new Map(),
            results: [],
            total: 0,
            idleCount: 0,
            cancelCount: 0,
            completedCount: 0,
            endBookmarkName: null,
            endCallbackName: effectiveEndCallback,
        };

        const bookmarkNames: string[] = [];
        try {
            let startedAny = false;
            let index = 0;

            const processValue = (value: unknown): void => {
                log.debug('%s: Checking value: %j', selfId, value as any);
                let activity: Activity | null = null;
                let variables: Record<string, unknown> | null = null;

                if (value instanceof Activity) {
                    activity = value;
                } else if (typeof value === 'object' && value !== null) {
                    const valueObj = value as Record<string, unknown>;
                    if (valueObj.activity instanceof Activity) {
                        activity = valueObj.activity;
                        variables =
                            valueObj.variables && typeof valueObj.variables === 'object'
                                ? (valueObj.variables as Record<string, unknown>)
                                : null;
                    }
                }

                if (activity) {
                    const instanceId = activity.instanceId;
                    log.debug('%s: Value is an activity with instance id: %s', selfId, instanceId);
                    if (state.indices.has(instanceId)) {
                        throw new ActivityStateExceptionError(`Activity instance '${instanceId}' has been scheduled already.`);
                    }
                    log.debug('%s: Creating end bookmark, and starting it.', selfId);
                    bookmarkNames.push(
                        execContext.createBookmark(
                            selfId!,
                            specStrings.activities.createValueCollectedBMName(instanceId),
                            'resultCollected',
                        ),
                    );
                    activity.startImpl(callContext, variables);
                    startedAny = true;
                    state.indices.set(instanceId, index);
                    state.results.push(null);
                    state.total++;
                } else {
                    log.debug('%s: Value is not an activity.', selfId);
                    state.results.push(value);
                }
            };

            if (state.many) {
                log.debug('%s: There are many values, iterating.', selfId);
                const items = obj as unknown[];
                for (const value of items) {
                    processValue(value);
                    index++;
                }
            } else {
                processValue(obj);
            }

            if (!startedAny) {
                log.debug('%s: No activity has been started, calling end callback with original object.', selfId);
                const result = state.many ? state.results : state.results[0];
                invokeEndCallback(ActivityState.complete, result);
            } else {
                log.debug('%s: %d activities has been started. Registering end bookmark.', selfId, state.indices.size);
                const endBM = specStrings.activities.createCollectingCompletedBMName(selfId!);
                bookmarkNames.push(execContext.createBookmark(selfId!, endBM, effectiveEndCallback));
                state.endBookmarkName = endBM;
                (scope as Record<string, unknown>).__schedulingState = state;
            }
            // TODO: scope.update(SimpleProxy.updateMode.oneWay);
        } catch (e) {
            log.warn(e, '%s: Runtime error happened', selfId);
            if (bookmarkNames.length > 0) {
                log.debug('%s: Set bookmarks to noop: %j', selfId, bookmarkNames);
                execContext.noopCallbacks(bookmarkNames);
            }
            scope.delete('__schedulingState');
            log.debug('%s: Invoking end callback with the error.', selfId);
            invokeEndCallback(ActivityState.fail, e instanceof Error ? e : new ActivityRuntimeError(String(e)));
        } finally {
            log.debug('%s: Final state indices count: %d, total: %d', selfId, state.indices.size, state.total);
        }
    }

    /**
     * Callback invoked when a scheduled child activity's result is collected.
     *
     * @remarks
     * **IMPORTANT:** This method is invoked via `.call(scope, callContext, ...)` by the bookmark
     * system, so `this` is bound to the **scope object** (not the Activity instance). Properties
     * listed in {@link hideFromScopeProperties} are excluded from the scope and will NOT be
     * available on `this`. Access activity fields via `callContext.activity`. The
     * `__schedulingState` is read from and written to `this` (the scope).
     */
    resultCollected(callContext: CallContext, reason: ActivityStateValue, result: unknown, bookmark: string): void {
        const selfId = callContext.instanceId;
        const execContext = callContext.executionContext;
        const childId = specStrings.getString(bookmark);
        const scope = callContext.scope;
        const log = callContext.activity.logger;

        log.debug(
            '%s: Scheduling result item collected, childId: %s, reason: %s, result: %j, bookmark: %j',
            selfId,
            childId,
            reason,
            result as any,
            bookmark,
        );

        let finished: (() => void) | null = null;
        const state = (scope as Record<string, unknown>).__schedulingState as SchedulingState | undefined;
        let failFlag = false;

        try {
            if (!state || typeof state !== 'object') {
                throw new ActivityStateExceptionError("Value of __schedulingState is '" + state + "'.");
            }

            if (!childId) {
                throw new ActivityStateExceptionError('Cannot extract child ID from bookmark name.');
            }

            const index = state.indices.get(childId);
            if (index === undefined) {
                throw new ActivityStateExceptionError(`Child activity of '${childId}' scheduling state index out of range.`);
            }

            log.debug('%s: Finished child activity id is: %s', selfId, childId);

            switch (reason) {
                case ActivityState.complete:
                    log.debug('%s: Setting %d. value to result: %j', selfId, index, result as any);
                    state.results[index] = result;
                    log.debug('%s: Removing id from state.', selfId);
                    state.indices.delete(childId);
                    state.completedCount++;
                    break;
                case ActivityState.fail:
                    log.warn(result instanceof Error ? result : new Error(String(result)), '%s: Failed', selfId);
                    failFlag = true;
                    state.indices.delete(childId);
                    break;
                case ActivityState.cancel:
                    log.debug('%s: Incrementing cancel counter.', selfId);
                    state.cancelCount++;
                    log.debug('%s: Removing id from state.', selfId);
                    state.indices.delete(childId);
                    break;
                case ActivityState.idle:
                    log.debug('%s: Incrementing idle counter.', selfId);
                    state.idleCount++;
                    break;
                default:
                    throw new ActivityStateExceptionError(`Result collected with unknown reason '${reason}'.`);
            }

            log.debug(
                '%s: State so far = total: %s, indices count: %d, completed count: %d, cancel count: %d, error count: %d, idle count: %d',
                selfId,
                state.total,
                state.indices.size,
                state.completedCount,
                state.cancelCount,
                failFlag ? 1 : 0,
                state.idleCount,
            );

            const endWithNoCollectAll = !callContext.activity.collectAll && reason !== ActivityState.idle;

            if (endWithNoCollectAll || failFlag) {
                if (!failFlag) {
                    log.debug("%s: ---- Collecting of values ended, because we're not collecting all values (eg.: Pick).", selfId);
                } else {
                    log.debug('%s: ---- Collecting of values ended, because of an error.', selfId);
                }
                log.debug('%s: Shutting down %d other, running activities.', selfId, state.indices.size);
                const ids: string[] = [];
                for (const id of state.indices.keys()) {
                    ids.push(id);
                    log.debug('%s: Deleting scope of activity: %s', selfId, id);
                    execContext.deleteScopeOfActivity(callContext, id);
                    const ibmName = specStrings.activities.createValueCollectedBMName(id);
                    log.debug('%s: Deleting value collected bookmark: %s', selfId, ibmName);
                    execContext.deleteBookmark(ibmName);
                }
                execContext.cancelExecution(callContext.scope, ids);
                log.debug('%s: Activities cancelled: %j', selfId, ids);
                log.debug('%s: Reporting the actual reason: %s and result: %j', selfId, reason, result as any);

                finished = () => {
                    void execContext.resumeBookmarkInScope(callContext, state.endBookmarkName!, reason, result);
                };
            } else {
                const onEnd = state.indices.size - state.idleCount === 0;
                if (onEnd) {
                    log.debug(
                        '%s: ---- Collecting of values ended (ended because of collect all is off: %s).',
                        selfId,
                        endWithNoCollectAll,
                    );
                    if (state.cancelCount > 0) {
                        log.debug('%s: Collecting has been cancelled, resuming end bookmarks.', selfId);
                        finished = () => {
                            void execContext.resumeBookmarkInScope(callContext, state.endBookmarkName!, ActivityState.cancel, undefined);
                        };
                    } else if (state.idleCount > 0) {
                        log.debug('%s: This entry has been gone to idle, propagating counter.', selfId);
                        state.idleCount--;
                        void execContext.resumeBookmarkInScope(callContext, state.endBookmarkName!, ActivityState.idle, undefined);
                    } else {
                        const finalResult = state.many ? state.results : state.results[0];
                        log.debug(
                            '%s: This entry has been completed, resuming collect bookmark with the result(s): %j',
                            selfId,
                            finalResult as any,
                        );
                        finished = () => {
                            void execContext.resumeBookmarkInScope(
                                callContext,
                                state.endBookmarkName!,
                                ActivityState.complete,
                                finalResult,
                            );
                        };
                    }
                }
            }
        } catch (e) {
            callContext.fail(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            scope.delete('__schedulingState');
        } finally {
            if (finished) {
                log.debug('%s: Scheduling finished, removing state.', selfId);
                scope.delete('__schedulingState');
                finished();
            }
        }
    }

    /* SCOPE */

    createScopePart(): Record<string, unknown> {
        if (!this._structureInitialized) {
            throw new ActivityRuntimeError('Cannot create activity scope for uninitialized activities.');
        }

        if (this._createScopePartImpl === null) {
            let first = true;
            let src = 'return {';
            for (const fieldName of this.getScopeKeys()) {
                if (first) {
                    first = false;
                } else {
                    src += ',\n';
                }
                src += fieldName + ':a.' + fieldName;
            }
            src += '}';

            try {
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                this._createScopePartImpl = new Function('a', src) as (a: Activity) => Record<string, unknown>;
            } catch (e) {
                this.logger.warn('Invalid scope part function: %s', src);
                throw new ActivityRuntimeError('Invalid scope part function: ' + src, e instanceof Error ? e : undefined);
            }
        }

        return this._createScopePartImpl(this);
    }

    getScopeKeys() {
        if (!this._scopeKeys || !this._structureInitialized) {
            this._scopeKeys = new Set();
            for (const key of this.allKeys()) {
                if (this._hideFromScopeProperties.has(key)) {
                    continue;
                }
                // Exclude Activity.prototype methods except the whitelisted ones
                // that must appear on scope (defaultEndCallback).
                const isOnActivityProto = key in Activity.prototype;
                if (!isOnActivityProto || key === 'defaultEndCallback') {
                    this._scopeKeys.add(key);
                }
            }
        }
        return this._scopeKeys;
    }

    //#endregion

    //#region Protected methods

    /**
     * Default callback invoked when scheduled activities complete (or fail/cancel).
     *
     * @remarks
     * **IMPORTANT:** This method is invoked via `.call(scope, callContext, reason, result)`, so
     * `this` is bound to the **scope object** (not the Activity instance). Properties listed in
     * {@link hideFromScopeProperties} are excluded from the scope and will NOT be available on
     * `this`. Access activity fields via `callContext.activity`.
     */
    protected defaultEndCallback(callContext: CallContext, reason: ActivityStateValue, result?: unknown): void {
        callContext.end(reason, result);
    }

    //#endregion

    //#region Private methods

    private async childrenImpl(
        deep: boolean,
        except: Activity | null,
        execContext: ActivityExecutionContext,
        visited: Set<Activity> | null,
    ): Promise<Activity[]> {
        const effectiveVisited = visited ?? new Set<Activity>();

        if (effectiveVisited.has(this)) {
            return [];
        }
        effectiveVisited.add(this);

        await this.ensureStructureInitialized(execContext);

        const result: Activity[] = [];
        if (this !== except) {
            result.push(this);
        }

        for (const fieldName of Object.keys(this) as (keyof this)[]) {
            const fieldValue = this[fieldName] as any;
            if (fieldValue) {
                if (Array.isArray(fieldValue)) {
                    for (const obj of fieldValue) {
                        if (obj instanceof Activity) {
                            if (deep) {
                                const subItems = await obj.childrenImpl(deep, except, execContext, effectiveVisited);
                                result.push(...subItems);
                            } else {
                                result.push(obj);
                            }
                        }
                    }
                } else if (fieldValue instanceof Activity) {
                    if (deep) {
                        const subItems = await fieldValue.childrenImpl(deep, except, execContext, effectiveVisited);
                        result.push(...subItems);
                    } else {
                        result.push(fieldValue);
                    }
                }
            }
        }
        return result;
    }

    private async ensureStructureInitialized(execContext: ActivityExecutionContext): Promise<void> {
        if (!this._structureInitialized) {
            await this.initializeStructure(execContext);
            this._structureInitialized = true;
        }
    }

    private startImpl(callContext: CallContext, variables: Record<string, unknown> | null, args?: unknown[]): void {
        if (args === undefined) {
            args = this.args != null ? (Array.isArray(this.args) ? this.args : [this.args]) : [];
        }

        if (!Array.isArray(args)) {
            args = [args];
        }

        const myCallContext = callContext.next(this, variables ?? undefined);
        const state = myCallContext.executionState;

        if (state.isRunning) {
            throw new Error('Activity is already running.');
        }

        const capturedArgs = args;
        setImmediate(() => {
            state.reportState(ActivityState.run, null, myCallContext.scope);
            try {
                this.initializeExec.call(myCallContext.scope);
                this.run.call(myCallContext.scope, myCallContext, capturedArgs);
            } catch (e) {
                this.fail(myCallContext, e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            }
        });
    }

    /**
     * Yields every key visible on this activity — own enumerable properties plus
     * non-enumerable prototype methods from the full prototype chain.  Equivalent to a
     * `for…in` loop on an ES5-style prototype hierarchy where subclass methods are
     * enumerable.  TypeScript class methods are non-enumerable, so we walk the chain
     * manually.
     *
     * Stops before `Object.prototype` (excludes `toString`, `hasOwnProperty`, etc.).
     * Skips `constructor` at every prototype level.
     */
    private *allKeys(): Generator<string> {
        // Own enumerable properties
        for (const key of Object.keys(this)) {
            yield key;
        }

        // Walk the prototype chain for non-enumerable prototype methods
        for (let proto = Object.getPrototypeOf(this); proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
            for (const key of Object.getOwnPropertyNames(proto)) {
                if (key !== 'constructor') {
                    yield key;
                }
            }
        }
    }

    //#endregion
}
