import { EventEmitter } from 'events';
import { Activity } from '../Activity.js';
import { ActivityExecutionContext } from './ActivityExecutionContext.js';
import { type ActivityStateValue, type ActivityExecutionState } from './ActivityExecutionState.js';
import { CallContext } from './CallContext.js';
import { activityMarkup } from './activityMarkup.js';
import { ActivityState } from '../../common/enums.js';
import { ActivityRuntimeError } from '../../errors/ActivityRuntimeError.js';
import { ActivityStateExceptionError } from '../../errors/ActivityStateExceptionError.js';
import { CancelledError } from '../../errors/CancelledError.js';
import { IdleError } from '../../errors/IdleError.js';
import { TypeError } from '../../errors/TypeError.js';
import type { ActivityStateTracker } from './ActivityStateTracker.js';
import { ActivityStateTrackerWrapper } from './ActivityStateTrackerWrapper.js';
import type { Serializer } from '../../serialization/Serializer.js';

const idleSentinel = Symbol('idle');

export class ActivityExecutionEngine extends EventEmitter {
    constructor(activity: Activity);
    constructor(markup: string | Record<string, unknown>);
    constructor(activityOrMarkup: Activity | string | Record<string, unknown>) {
        super();

        if (activityOrMarkup instanceof Activity) {
            this.rootActivity = activityOrMarkup;
        } else if (typeof activityOrMarkup === 'string' || (typeof activityOrMarkup === 'object' && activityOrMarkup !== null)) {
            this.rootActivity = activityMarkup.parse(activityOrMarkup);
        } else {
            throw new TypeError("Argument 'activityOrMarkup' is not an Activity or a markup string/object.");
        }

        this.context = new ActivityExecutionContext(this);
        this._trackers = [];
        this._hookContext();
        this.updatedOn = null;
        this.instance = null;
    }

    //#region Private fields

    private _rootState: ActivityExecutionState | null = null;
    private _trackers: ActivityStateTrackerWrapper[];
    private _initialized = false;

    //#endregion

    //#region Public fields, getters and setters

    readonly rootActivity: Activity;
    readonly context: ActivityExecutionContext;
    readonly instance: null;
    updatedOn: Date | null;

    get execState(): ActivityStateValue | null {
        return this._rootState ? this._rootState.execState : null;
    }

    isIdle(result: unknown): boolean {
        return result === idleSentinel;
    }

    //#endregion

    //#region Public methods

    start(...args: unknown[]): void {
        this._verifyNotStarted();
        this._initialize();

        const ctx = new CallContext(this.context);
        this.rootActivity.start(ctx, ...args);
    }

    async invoke(...args: unknown[]): Promise<unknown> {
        this._verifyNotStarted();
        this._initialize();

        return new Promise<unknown>((resolve, reject) => {
            const ctx = new CallContext(this.context);
            this._setRootState(this.context.getExecutionState(this.rootActivity));

            this.once(ActivityState.end, (eArgs: { reason: ActivityStateValue; result?: unknown }) => {
                const { reason, result } = eArgs;
                switch (reason) {
                    case ActivityState.complete:
                        resolve(result);
                        break;
                    case ActivityState.cancel:
                        reject(new CancelledError());
                        break;
                    case ActivityState.idle:
                        resolve(idleSentinel);
                        break;
                    default:
                        reject(result instanceof Error ? result : new ActivityRuntimeError((result as string) ?? 'Unknown error.'));
                        break;
                }
            });

            try {
                this.rootActivity.start(ctx, ...args);
            } catch (e) {
                reject(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            }
        });
    }

    async resumeBookmark(name: string, reason: ActivityStateValue, result?: unknown): Promise<void> {
        this._initialize();

        return new Promise<void>((resolve, reject) => {
            try {
                this._setRootState(this.context.getExecutionState(this.rootActivity));

                if (this.execState !== ActivityState.idle) {
                    reject(new ActivityRuntimeError('Cannot resume bookmark, while the workflow is not in the idle state.'));
                    return;
                }

                const bmTimestamp = this.context.getBookmarkTimestamp(name);

                this.once(ActivityState.end, (args: { reason: ActivityStateValue; result?: unknown }) => {
                    const endReason = args.reason;
                    const endResult = args.result;

                    try {
                        if (endReason === ActivityState.complete || endReason === ActivityState.idle) {
                            const endBmTimestamp = this.context.getBookmarkTimestamp(name);
                            if (endBmTimestamp && endBmTimestamp === bmTimestamp) {
                                if (endReason === ActivityState.complete) {
                                    reject(new ActivityRuntimeError("Workflow has been completed before bookmark '" + name + "' reached."));
                                } else {
                                    reject(new IdleError("Workflow has been gone to idle before bookmark '" + name + "' reached."));
                                }
                            } else {
                                resolve();
                            }
                        } else if (endReason === ActivityState.cancel) {
                            reject(new ActivityRuntimeError("Workflow has been cancelled before bookmark '" + name + "' reached."));
                        } else if (endReason === ActivityState.fail) {
                            reject(endResult instanceof Error ? endResult : new ActivityRuntimeError(String(endResult)));
                        }
                    } catch (e) {
                        reject(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
                    }
                });

                this.context.resumeBookmarkExternal(name, reason, result);
            } catch (e) {
                reject(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
            }
        });
    }

    addTracker(tracker: ActivityStateTracker): void {
        if (typeof tracker !== 'object' || tracker === null) {
            throw new TypeError('Parameter is not an object.');
        }
        this._trackers.push(new ActivityStateTrackerWrapper(tracker));
    }

    removeTracker(tracker: ActivityStateTracker): void {
        const idx = this._trackers.findIndex((t) => t.tracker === tracker);
        if (idx !== -1) {
            this._trackers.splice(idx, 1);
        }
    }

    getStateAndPromotions(
        serializer?: Serializer,
        enablePromotions?: boolean,
    ): { state: unknown; promotedProperties: Record<string, unknown> | null } {
        if (serializer && typeof serializer.toJSON !== 'function') {
            throw new TypeError("Argument 'serializer' is not a serializer.");
        }
        this._initialize();
        return this.context.getStateAndPromotions(serializer, enablePromotions);
    }

    setState(serializer: Serializer, json: string): void;
    setState(serializer: undefined, json: Record<string, unknown>): void;
    setState(serializer: Serializer | undefined, json: string | Record<string, unknown>): void {
        if (serializer && typeof serializer.toJSON !== 'function') {
            throw new TypeError("Argument 'serializer' is not a serializer.");
        }
        if (!serializer && (typeof json !== 'object' || json === null)) {
            throw new TypeError("Argument 'json' is not an object.");
        }
        this._initialize();
        this.updatedOn = new Date();
        if (serializer) {
            this.context.setState(serializer, json as string);
        } else {
            this.context.setState(undefined, json as Record<string, unknown>);
        }
    }

    //#endregion

    //#region Private methods

    private _initialize(): void {
        if (!this._initialized) {
            this.context.initialize(this.rootActivity);
            this._initialized = true;
        }
    }

    private _setRootState(state: ActivityExecutionState): void {
        if (!this._rootState) {
            this._rootState = state;
            this._rootState.on(ActivityState.cancel, (args: unknown) => {
                this.emit(ActivityState.cancel, args);
            });
            this._rootState.on(ActivityState.complete, (args: unknown) => {
                this.emit(ActivityState.complete, args);
            });
            this._rootState.on(ActivityState.end, (args: unknown) => {
                this.updatedOn = new Date();
                this.emit(ActivityState.end, args);
            });
            this._rootState.on(ActivityState.fail, (args: unknown) => {
                this.emit(ActivityState.fail, args);
            });
            this._rootState.on(ActivityState.run, (args: unknown) => {
                this.emit(ActivityState.run, args);
            });
            this._rootState.on(ActivityState.idle, (args: unknown) => {
                this.emit(ActivityState.idle, args);
            });
        }
    }

    private _hookContext(): void {
        this.context.on(ActivityState.run, (args: unknown) => {
            for (const t of this._trackers) {
                t.activityStateChanged(args as any[]);
            }
        });
        this.context.on(ActivityState.end, (args: unknown) => {
            for (const t of this._trackers) {
                t.activityStateChanged(args as any[]);
            }
        });
        this.context.on('workflowEvent', (args: unknown) => {
            this.emit('workflowEvent', args);
        });
    }

    private _verifyNotStarted(): void {
        if (this.execState && this.execState !== ActivityState.complete) {
            throw new ActivityStateExceptionError('Workflow has been already started.');
        }
    }

    //#endregion
}
