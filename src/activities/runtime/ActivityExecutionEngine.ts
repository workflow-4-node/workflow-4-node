import { EventEmitter } from 'events';
import { Activity } from '../Activity.js';
import { ActivityExecutionContext } from './ActivityExecutionContext.js';
import { type ActivityExecutionState, type ActivityStateEvent } from './ActivityExecutionState.js';
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
import { promiseHelpers } from '../../common/promiseHelpers.js';

const idleSentinel = Symbol('idle');

export class ActivityExecutionEngine extends EventEmitter {
    constructor(activity: Activity);
    constructor(markup: string | Record<string, unknown>);
    constructor(private readonly activityOrMarkup: Activity | string | Record<string, unknown>) {
        super();
        this.context = new ActivityExecutionContext(this);
        this._trackers = [];
        this.hookContext();
        this.updatedOn = null;
        this.instance = null;
    }

    //#region Private fields

    private _rootState: ActivityExecutionState | null = null;
    private _trackers: ActivityStateTrackerWrapper[];
    private _initialized = false;
    private _rootActivity?: Activity;
    readonly context: ActivityExecutionContext;
    readonly instance: null;
    updatedOn: Date | null;

    get execState(): ActivityState | null {
        return this._rootState ? this._rootState.execState : null;
    }

    isIdle(result: unknown): boolean {
        return result === idleSentinel;
    }

    //#endregion

    //#region Public methods

    async start(...args: unknown[]) {
        this.verifyNotStarted();
        await this.initialize();

        const ctx = new CallContext(this.context);
        (await this.getRootActivity()).start(ctx, ...args);
    }

    async invoke(...args: unknown[]): Promise<unknown> {
        this.verifyNotStarted();
        await this.initialize();

        return new Promise<unknown>((resolve, reject) => {
            void promiseHelpers.try<void>(async () => {
                try {
                    const ctx = new CallContext(this.context);
                    this.setRootState(this.context.getExecutionState(await this.getRootActivity()));

                    this.once(ActivityState.end, (eArgs: { reason: ActivityState; result?: unknown }) => {
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
                            case ActivityState.fail:
                                if (result instanceof Error) {
                                    reject(result);
                                } else {
                                    reject(new ActivityRuntimeError(`Activity failed with result: ${JSON.stringify(result)}`));
                                }
                                break;
                        }
                    });

                    (await this.getRootActivity()).start(ctx, ...args);
                } catch (e) {
                    reject(e instanceof Error ? e : new ActivityRuntimeError(String(e)));
                }
            });
        });
    }

    async resumeBookmark(name: string, reason: ActivityState, result?: unknown): Promise<void> {
        await this.initialize();

        return new Promise<void>((resolve, reject) => {
            void promiseHelpers.try<void>(async () => {
                try {
                    this.setRootState(this.context.getExecutionState(await this.getRootActivity()));

                    if (this.execState !== ActivityState.idle) {
                        reject(new ActivityRuntimeError('Cannot resume bookmark, while the workflow is not in the idle state.'));
                        return;
                    }

                    const bmTimestamp = this.context.getBookmarkTimestamp(name);

                    this.once(ActivityState.end, (args: { reason: ActivityState; result?: unknown }) => {
                        const endReason = args.reason;
                        const endResult = args.result;

                        try {
                            if (endReason === ActivityState.complete || endReason === ActivityState.idle) {
                                const endBmTimestamp = this.context.getBookmarkTimestamp(name);
                                if (endBmTimestamp && endBmTimestamp === bmTimestamp) {
                                    if (endReason === ActivityState.complete) {
                                        reject(
                                            new ActivityRuntimeError("Workflow has been completed before bookmark '" + name + "' reached."),
                                        );
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

    async getStateAndPromotions(
        serializer?: Serializer,
        enablePromotions?: boolean,
    ): Promise<{ state: unknown; promotedProperties: Record<string, unknown> | null }> {
        if (serializer && typeof serializer.toJSON !== 'function') {
            throw new TypeError("Argument 'serializer' is not a serializer.");
        }
        await this.initialize();
        return this.context.getStateAndPromotions(serializer, enablePromotions);
    }

    async setState(serializer: Serializer, json: string): Promise<void>;
    async setState(serializer: undefined, json: Record<string, unknown>): Promise<void>;
    async setState(serializer: Serializer | undefined, json: string | Record<string, unknown>): Promise<void> {
        if (serializer && typeof serializer.toJSON !== 'function') {
            throw new TypeError("Argument 'serializer' is not a serializer.");
        }
        if (!serializer && (typeof json !== 'object' || json === null)) {
            throw new TypeError("Argument 'json' is not an object.");
        }
        await this.initialize();
        this.updatedOn = new Date();
        if (serializer) {
            this.context.setState(serializer, json as string);
        } else {
            this.context.setState(undefined, json as Record<string, unknown>);
        }
    }

    //#endregion

    //#region Private methods

    private async getRootActivity(): Promise<Activity> {
        if (this._rootActivity) {
            return this._rootActivity;
        }

        if (this.activityOrMarkup instanceof Activity) {
            this._rootActivity = this.activityOrMarkup;
        } else if (
            typeof this.activityOrMarkup === 'string' ||
            (typeof this.activityOrMarkup === 'object' && this.activityOrMarkup !== null)
        ) {
            this._rootActivity = await activityMarkup.parse(this.activityOrMarkup);
        } else {
            throw new TypeError("Argument 'activityOrMarkup' is not an Activity or a markup string/object.");
        }

        return this._rootActivity;
    }

    private async initialize() {
        if (!this._initialized) {
            await this.context.initialize(await this.getRootActivity());
            this._initialized = true;
        }
    }

    private setRootState(state: ActivityExecutionState): void {
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

    private hookContext(): void {
        this.context.on(ActivityState.run, (args: unknown) => {
            for (const t of this._trackers) {
                t.activityStateChanged(args as ActivityStateEvent);
            }
        });
        this.context.on(ActivityState.end, (args: unknown) => {
            for (const t of this._trackers) {
                t.activityStateChanged(args as ActivityStateEvent);
            }
        });
        this.context.on('workflowEvent', (args: unknown) => {
            this.emit('workflowEvent', args);
        });
    }

    private verifyNotStarted(): void {
        if (this.execState && this.execState !== ActivityState.complete) {
            throw new ActivityStateExceptionError('Workflow has been already started.');
        }
    }

    //#endregion
}
