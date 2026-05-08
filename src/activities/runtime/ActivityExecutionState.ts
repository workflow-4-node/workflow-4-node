import { EventEmitter } from 'events';
import { AactivityStates } from '../../common/enums.js';
import { TypeError } from '../../errors/TypeError.js';

type ActivityStateValue = `${AactivityStates}`;

export interface ActivityStateEvent {
    reason: ActivityStateValue | null;
    result?: unknown;
    scope?: unknown;
}

export class ActivityExecutionState extends EventEmitter {
    constructor(activityInstanceId: string) {
        super();
        this.instanceId = activityInstanceId;
    }

    private execStateValue: ActivityStateValue | null = null;

    readonly instanceId: string;
    parentInstanceId: string | null = null;
    readonly childInstanceIds: Set<string> = new Set();

    get execState(): ActivityStateValue | null {
        return this.execStateValue;
    }

    get isRunning(): boolean {
        return this.execStateValue === AactivityStates.run;
    }

    reportState(reason: ActivityStateValue | null, result?: unknown, scope?: unknown): void {
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
        if (this.execStateValue !== AactivityStates.run) {
            this.emit(AactivityStates.end, {
                reason: this.execStateValue,
                result,
                scope,
            });
        }
    }

    toJSON(): { execState: ActivityStateValue | null } {
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
            const validStates = Object.values(AactivityStates) as string[];
            if (!validStates.includes(obj.execState)) {
                throw new TypeError("Argument object's execState property value is not a valid Activity state value.");
            }
            this.execStateValue = obj.execState as ActivityStateValue;
        } else {
            this.execStateValue = null;
        }
    }
}
