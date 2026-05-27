import { ExtensibleSet } from '../common/ExtensibleSet.js';
import { ValidationError } from '../errors/ValidationError.js';
import { ActivityState } from '../index.js';
import { Activity } from './Activity.js';
import { type CallContext } from './runtime/CallContext.js';
import assert from 'assert';

export abstract class Declarator extends Activity {
    constructor() {
        super();

        this.hideFromScopeProperties.add('reservedProperties');
        this.hideFromScopeProperties.add('reserved');
        this.hideFromScopeProperties.add('promotedProperties');
        this.hideFromScopeProperties.add('promoted');
        this.hideFromScopeProperties.add('varsDeclared');
    }

    private activityVariableFieldNames?: string[];
    private savedArgs?: unknown[];

    private readonly _reservedProperties = new ExtensibleSet<string>();

    /** Properties those cannot be declared freely */
    protected get reservedProperties() {
        return this._reservedProperties;
    }

    private readonly _promotedProperties = new ExtensibleSet<string>();

    /** Properties those will be promoted during serialization */
    protected get promotedProperties() {
        return this._promotedProperties;
    }

    protected declareReservedProperty(name: string, value?: unknown) {
        if (this.promotedProperties.has(name)) {
            throw new ValidationError("Property '" + name + "' cannot be reserved because it's promoted.");
        }
        if (value !== undefined) {
            (this as any)[name] = value;
        }
        this.reservedProperties.add(name);
    }

    protected declarePromotedProperty(name: string, value?: unknown) {
        if (this.reservedProperties.has(name)) {
            throw new ValidationError("Property '" + name + "' cannot be promoted because it's reserved.");
        }
        if (value !== undefined) {
            (this as any)[name] = value;
        }
        this.promotedProperties.add(name);
    }

    protected abstract varsDeclared(callContext: CallContext, args: unknown[]): void;

    run(callContext: CallContext, args: unknown[]) {
        const activityVariables = [];
        const activityVariableFieldNames: string[] = [];
        this.activityVariableFieldNames = activityVariableFieldNames;
        const resProps = this.getReservedProperties(callContext);
        for (const fieldName of callContext.activity.getScopeKeys()) {
            if (!resProps?.has(fieldName)) {
                const fieldValue = (this as any)[fieldName];
                if (fieldValue instanceof Activity) {
                    activityVariables.push(fieldValue);
                    activityVariableFieldNames.push(fieldName);
                }
            }
        }

        if (activityVariables.length) {
            this.savedArgs = args;
            callContext.schedule(activityVariables, 'varsGot');
        } else {
            this.activityVariableFieldNames = undefined;
            // TODO: This 'call' is a workaround because of weird scoping. Remove this later.
            (callContext.activity as Declarator).varsDeclared.call(this, callContext, args);
        }
    }

    varsGot(callContext: CallContext, reason: ActivityState, result: unknown[]) {
        if (reason === ActivityState.complete) {
            assert(Array.isArray(result), 'Result from scheduled activity variables is expected to be an array.');

            let idx = 0;
            if (this.activityVariableFieldNames?.length) {
                assert(
                    result.length === this.activityVariableFieldNames.length,
                    'Result array length is expected to be same as the number of activity variable fields.',
                );

                for (const fieldName of this.activityVariableFieldNames) {
                    (this as any)[fieldName] = result[idx++];
                }
            }
            const args = this.savedArgs;
            this.savedArgs = undefined;
            this.activityVariableFieldNames = undefined;
            (callContext.activity as Declarator).varsDeclared.call(this, callContext, args || []);
        } else {
            callContext.end(reason, result);
        }
    }

    // TODO: This is a workaround because of weird scoping. Remove this later.
    private getReservedProperties(callContext: CallContext) {
        const declarator = callContext.activity instanceof Declarator ? callContext.activity : null;
        return declarator?.reservedProperties;
    }
}
