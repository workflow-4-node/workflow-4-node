import { EventEmitter } from 'events';
import { ActivityState } from '../../common/enums.js';
import { TypeError } from '../../errors/TypeError.js';

export interface ActivityStateEvent {
    reason: ActivityState | null;
    result?: unknown;
    scope?: unknown;
}

export class ActivityExecutionState extends EventEmitter {
    constructor(activityInstanceId: string) {
        super();
        this.instanceId = activityInstanceId;
    }

    private execStateValue: ActivityState | null = null;

    readonly instanceId: string;
    parentInstanceId: string | null = null;
    readonly childInstanceIds: Set<string> = new Set();

    get execState(): ActivityState | null {
        return this.execStateValue;
    }

    set execState(value: ActivityState | null) {
        this.execStateValue = value;
    }

    get isRunning(): boolean {
        return this.execStateValue === ActivityState.run;
    }

    reportState(reason: ActivityState | null, result?: unknown, scope?: unknown): void {
        if (this.execStateValue !== reason) {
            this.execStateValue = reason;
            this.emitState(result, scope);
        }
    }

    emitState(result?: unknown, scope?: unknown): void {
        this.emit(this.execStateValue!, {
            reason: this.execStateValue,
            result,
            scope,
        });
        if (this.execStateValue !== ActivityState.run) {
            this.emit(ActivityState.end, {
                reason: this.execStateValue,
                result,
                scope,
            });
        }
    }

    toJSON(): { execState: ActivityState | null } {
        return {
            execState: this.execStateValue,
        };
    }

    fromJSON(json: unknown): void {
        if (typeof json !== 'object' || json === null) {
            throw new TypeError('Object argument expected.');
        }

        const obj = json as Record<string, unknown>;

        if (obj.execState !== null && obj.execState !== undefined) {
            if (typeof obj.execState !== 'string') {
                throw new TypeError("Argument object's execState property value is not a string.");
            }
            const validStates = Object.values(ActivityState) as string[];
            if (!validStates.includes(obj.execState)) {
                throw new TypeError("Argument object's execState property value is not a valid Activity state value.");
            }
            this.execStateValue = obj.execState as ActivityState;
        } else {
            this.execStateValue = null;
        }
    }
}
