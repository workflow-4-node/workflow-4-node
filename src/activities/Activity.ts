import { randomUUID } from 'node:crypto';
import { ExtensibleSet } from '../common/ExtensibleSet.js';
import { AactivityStates } from '../common/enums.js';
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

type ActivityOrScheduleItem = Activity | { activity: Activity; variables?: Record<string, unknown> };

export class Activity {
    constructor() {
        this.id = randomUUID();
        this._nonSerializedProperties = new ExtensibleSet();
        this._scopedProperties = new ExtensibleSet();
        this._codeProperties = new ExtensibleSet();
        this._arrayProperties = new ExtensibleSet();
        this['@require'] = null;
    }

    //#region Private fields

    private readonly _nonSerializedProperties: ExtensibleSet<string>;
    private readonly _scopedProperties: ExtensibleSet<string>;
    private readonly _codeProperties: ExtensibleSet<string>;
    private readonly _arrayProperties: ExtensibleSet<string>;

    private _collectAll = true;
    private _instanceId: string | null = null;
    private _structureInitialized = false;
    private _scopeKeys: string[] | null = null;
    private _createScopePartImpl: ((a: Activity) => Record<string, unknown>) | null = null;

    //#endregion

    //#region Protected fields, getters and setters

    get nonSerializedProperties(): ExtensibleSet<string> {
        return this._nonSerializedProperties;
    }

    protected get scopedProperties(): ExtensibleSet<string> {
        return this._scopedProperties;
    }

    protected get codeProperties(): ExtensibleSet<string> {
        return this._codeProperties;
    }

    protected get arrayProperties(): ExtensibleSet<string> {
        return this._arrayProperties;
    }

    //#endregion

    //#region Public fields, getters and setters

    readonly id: string;
    ['@require']: unknown = null;
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

    *all(execContext: ActivityExecutionContext): Generator<Activity> {
        yield* this.childrenImpl(true, null, execContext, null);
    }

    *children(execContext: ActivityExecutionContext): Generator<Activity> {
        yield* this.childrenImpl(true, this, execContext, null);
    }

    *immediateChildren(execContext: ActivityExecutionContext): Generator<Activity> {
        yield* this.childrenImpl(false, this, execContext, null);
    }

    /* Structure */

    isArrayProperty(propName: string): boolean {
        return this._arrayProperties.has(propName);
    }

    initializeStructure(_execContext: ActivityExecutionContext): void {
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

    initializeExec(): void {
        // virtual
    }

    unInitializeExec(_reason: ActivityStateValue, _result?: unknown): void {
        // virtual
    }

    run(callContext: CallContext, args: unknown[]): void {
        callContext.activity.complete(callContext, args);
    }

    complete(callContext: CallContext, result?: unknown): void {
        this.end(callContext, AactivityStates.complete, result);
    }

    cancel(callContext: CallContext): void {
        this.end(callContext, AactivityStates.cancel);
    }

    idle(callContext: CallContext): void {
        this.end(callContext, AactivityStates.idle);
    }

    fail(callContext: CallContext, e: Error): void {
        this.end(callContext, AactivityStates.fail, e);
    }

    end(callContext: CallContext, reason: ActivityStateValue, result?: unknown): void {
        let finalReason: ActivityStateValue = reason;
        let finalResult = result;

        try {
            this.unInitializeExec(reason, result);
        } catch (e) {
            finalReason = AactivityStates.fail;
            finalResult = e;
        }

        const state = callContext.executionState;

        if (state.execState === AactivityStates.cancel || state.execState === AactivityStates.fail) {
            return;
        }

        state.execState = finalReason;

        const inIdle = finalReason === AactivityStates.idle;
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
                            state.emitState(finalResult, savedScope);
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

    schedule(callContext: CallContext, obj: ActivityOrScheduleItem | ActivityOrScheduleItem[], endCallback?: string): void {
        const scope = callContext.scope;
        const execContext = callContext.executionContext;
        const selfId = callContext.instanceId;

        if (endCallback) {
            const cb = (scope as Record<string, unknown>)[endCallback];
            if (typeof cb !== 'function') {
                callContext.fail(new W4NTypeError(`'${endCallback}' is not a function.`));
                return;
            }
        }

        if ((scope as Record<string, unknown>).__schedulingState) {
            this.logger.debug(
                '%s: Error, already existsing state: %j',
                selfId,
                (scope as Record<string, unknown>).__schedulingState as any,
            );
            callContext.fail(new ActivityStateExceptionError('There are already scheduled items exists.'));
            return;
        }

        this.logger.debug("%s: Scheduling object(s) by using end callback '%s': %j", selfId, endCallback, obj);

        const state: SchedulingState = {
            many: Array.isArray(obj),
            indices: new Map(),
            results: [],
            total: 0,
            idleCount: 0,
            cancelCount: 0,
            completedCount: 0,
            endBookmarkName: null,
            endCallbackName: endCallback ?? '',
        };

        const bookmarkNames: string[] = [];
        try {
            let startedAny = false;
            let index = 0;

            const processValue = (value: ActivityOrScheduleItem): void => {
                this.logger.debug('%s: Checking value: %j', selfId, value);
                let activity: Activity | null = null;
                let variables: Record<string, unknown> | null = null;

                if (value instanceof Activity) {
                    activity = value;
                } else if (typeof value === 'object' && value !== null && value.activity instanceof Activity) {
                    activity = value.activity;
                    variables = value.variables && typeof value.variables === 'object' ? value.variables : null;
                }

                if (activity) {
                    const instanceId = activity.instanceId;
                    this.logger.debug('%s: Value is an activity with instance id: %s', selfId, instanceId);
                    if (state.indices.has(instanceId)) {
                        throw new ActivityStateExceptionError(`Activity instance '${instanceId}' has been scheduled already.`);
                    }
                    this.logger.debug('%s: Creating end bookmark, and starting it.', selfId);
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
                    this.logger.debug('%s: Value is not an activity.', selfId);
                    state.results.push(value);
                }
            };

            if (state.many) {
                this.logger.debug('%s: There are many values, iterating.', selfId);
                for (const value of obj as ActivityOrScheduleItem[]) {
                    processValue(value);
                    index++;
                }
            } else {
                processValue(obj as ActivityOrScheduleItem);
            }

            if (!startedAny) {
                this.logger.debug('%s: No activity has been started, calling end callback with original object.', selfId);
                const result = state.many ? state.results : state.results[0];
                setImmediate(() => {
                    this.defaultEndCallback(callContext, AactivityStates.complete, result);
                });
            } else {
                this.logger.debug('%s: %d activities has been started. Registering end bookmark.', selfId, state.indices.size);
                if (endCallback) {
                    const endBM = specStrings.activities.createCollectingCompletedBMName(selfId!);
                    bookmarkNames.push(execContext.createBookmark(selfId!, endBM, endCallback));
                    state.endBookmarkName = endBM;
                }
                (scope as Record<string, unknown>).__schedulingState = state;
            }
        } catch (e) {
            this.logger.debug('%s: Runtime error happened: %s', selfId, e instanceof Error ? e.stack : String(e));
            if (bookmarkNames.length > 0) {
                this.logger.debug('%s: Set bookmarks to noop: %j', selfId, bookmarkNames);
                execContext.noopCallbacks(bookmarkNames);
            }
            scope.delete('__schedulingState');
            this.logger.debug('%s: Invoking end callback with the error.', selfId);
            setImmediate(() => {
                this.defaultEndCallback(callContext, AactivityStates.fail, e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            });
        } finally {
            this.logger.debug('%s: Final state indices count: %d, total: %d', selfId, state.indices.size, state.total);
        }
    }

    resultCollected(callContext: CallContext, reason: ActivityStateValue, result: unknown, bookmark: string): void {
        const selfId = callContext.instanceId;
        const execContext = callContext.executionContext;
        const childId = specStrings.getString(bookmark);
        const scope = callContext.scope;

        this.logger.debug(
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

            this.logger.debug('%s: Finished child activity id is: %s', selfId, childId);

            switch (reason) {
                case AactivityStates.complete:
                    this.logger.debug('%s: Setting %d. value to result: %j', selfId, index, result as any);
                    state.results[index] = result;
                    this.logger.debug('%s: Removing id from state.', selfId);
                    state.indices.delete(childId);
                    state.completedCount++;
                    break;
                case AactivityStates.fail:
                    this.logger.debug('%s: Failed with: %s', selfId, result instanceof Error ? result.stack : String(result));
                    failFlag = true;
                    state.indices.delete(childId);
                    break;
                case AactivityStates.cancel:
                    this.logger.debug('%s: Incrementing cancel counter.', selfId);
                    state.cancelCount++;
                    this.logger.debug('%s: Removing id from state.', selfId);
                    state.indices.delete(childId);
                    break;
                case AactivityStates.idle:
                    this.logger.debug('%s: Incrementing idle counter.', selfId);
                    state.idleCount++;
                    break;
                default:
                    throw new ActivityStateExceptionError(`Result collected with unknown reason '${reason}'.`);
            }

            this.logger.debug(
                '%s: State so far = total: %s, indices count: %d, completed count: %d, cancel count: %d, error count: %d, idle count: %d',
                selfId,
                state.total,
                state.indices.size,
                state.completedCount,
                state.cancelCount,
                failFlag ? 1 : 0,
                state.idleCount,
            );

            const endWithNoCollectAll = !callContext.activity.collectAll && reason !== AactivityStates.idle;

            if (endWithNoCollectAll || failFlag) {
                if (!failFlag) {
                    this.logger.debug("%s: ---- Collecting of values ended, because we're not collecting all values (eg.: Pick).", selfId);
                } else {
                    this.logger.debug('%s: ---- Collecting of values ended, because of an error.', selfId);
                }
                this.logger.debug('%s: Shutting down %d other, running activities.', selfId, state.indices.size);
                const ids: string[] = [];
                for (const id of state.indices.keys()) {
                    ids.push(id);
                    this.logger.debug('%s: Deleting scope of activity: %s', selfId, id);
                    execContext.deleteScopeOfActivity(callContext, id);
                    const ibmName = specStrings.activities.createValueCollectedBMName(id);
                    this.logger.debug('%s: Deleting value collected bookmark: %s', selfId, ibmName);
                    execContext.deleteBookmark(ibmName);
                }
                execContext.cancelExecution(callContext.scope, ids);
                this.logger.debug('%s: Activities cancelled: %j', selfId, ids);
                this.logger.debug('%s: Reporting the actual reason: %s and result: %j', selfId, reason, result as any);

                if (state.endBookmarkName) {
                    finished = () => {
                        void execContext.resumeBookmarkInScope(callContext, state.endBookmarkName!, reason, result);
                    };
                } else {
                    finished = () => {
                        this.defaultEndCallback(callContext, reason, result);
                    };
                }
            } else {
                const onEnd = state.indices.size - state.idleCount === 0;
                if (onEnd) {
                    this.logger.debug(
                        '%s: ---- Collecting of values ended (ended because of collect all is off: %s).',
                        selfId,
                        endWithNoCollectAll,
                    );
                    if (state.cancelCount > 0) {
                        this.logger.debug('%s: Collecting has been cancelled, resuming end bookmarks.', selfId);
                        if (state.endBookmarkName) {
                            finished = () => {
                                void execContext.resumeBookmarkInScope(
                                    callContext,
                                    state.endBookmarkName!,
                                    AactivityStates.cancel,
                                    undefined,
                                );
                            };
                        } else {
                            finished = () => {
                                this.defaultEndCallback(callContext, AactivityStates.cancel);
                            };
                        }
                    } else if (state.idleCount > 0) {
                        this.logger.debug('%s: This entry has been gone to idle, propagating counter.', selfId);
                        state.idleCount--;
                        if (state.endBookmarkName) {
                            void execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, AactivityStates.idle, undefined);
                        } else {
                            this.defaultEndCallback(callContext, AactivityStates.idle);
                        }
                    } else {
                        const finalResult = state.many ? state.results : state.results[0];
                        this.logger.debug(
                            '%s: This entry has been completed, resuming collect bookmark with the result(s): %j',
                            selfId,
                            finalResult as any,
                        );
                        if (state.endBookmarkName) {
                            finished = () => {
                                void execContext.resumeBookmarkInScope(
                                    callContext,
                                    state.endBookmarkName!,
                                    AactivityStates.complete,
                                    finalResult,
                                );
                            };
                        } else {
                            finished = () => {
                                this.defaultEndCallback(callContext, AactivityStates.complete, finalResult);
                            };
                        }
                    }
                }
            }
        } catch (e) {
            callContext.fail(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            scope.delete('__schedulingState');
        } finally {
            if (finished) {
                this.logger.debug('%s: Scheduling finished, removing state.', selfId);
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
                this.logger.debug('Invalid scope part function: %s', src);
                throw new ActivityRuntimeError('Invalid scope part function: ' + src, e instanceof Error ? e : undefined);
            }
        }

        return this._createScopePartImpl(this);
    }

    //#endregion

    //#region Protected methods

    protected defaultEndCallback(callContext: CallContext, reason: ActivityStateValue, result?: unknown): void {
        callContext.end(reason, result);
    }

    //#endregion

    //#region Private methods

    private *childrenImpl(
        deep: boolean,
        except: Activity | null,
        execContext: ActivityExecutionContext,
        visited: Set<Activity> | null,
    ): Generator<Activity> {
        const effectiveVisited = visited ?? new Set<Activity>();

        if (effectiveVisited.has(this)) {
            return;
        }
        effectiveVisited.add(this);

        this.ensureStructureInitialized(execContext);

        if (this !== except) {
            yield this;
        }

        for (const fieldName of Object.keys(this) as (keyof this)[]) {
            if (Object.prototype.hasOwnProperty.call(this, fieldName)) {
                const fieldValue = this[fieldName];
                if (fieldValue) {
                    if (Array.isArray(fieldValue)) {
                        for (const obj of fieldValue) {
                            if (obj instanceof Activity) {
                                if (deep) {
                                    yield* obj.childrenImpl(deep, except, execContext, effectiveVisited);
                                } else {
                                    yield obj;
                                }
                            }
                        }
                    } else if (fieldValue instanceof Activity) {
                        if (deep) {
                            yield* fieldValue.childrenImpl(deep, except, execContext, effectiveVisited);
                        } else {
                            yield fieldValue;
                        }
                    }
                }
            }
        }
    }

    private ensureStructureInitialized(execContext: ActivityExecutionContext): void {
        if (!this._structureInitialized) {
            this.initializeStructure(execContext);
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
            state.reportState(AactivityStates.run, null, myCallContext.scope);
            try {
                this.initializeExec.call(myCallContext.scope);
                this.run.call(myCallContext.scope, myCallContext, capturedArgs);
            } catch (e) {
                this.fail(myCallContext, e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            }
        });
    }

    private getScopeKeys(): string[] {
        if (!this._scopeKeys || !this._structureInitialized) {
            this._scopeKeys = [];
            for (const key of Object.keys(this)) {
                if (this._scopedProperties.has(key) && Object.prototype.hasOwnProperty.call(this, key)) {
                    this._scopeKeys.push(key);
                }
            }
        }
        return this._scopeKeys;
    }

    //#endregion

    static readonly states = AactivityStates;
}
