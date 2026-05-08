// TODO: Many types here are `any` (Activity, ExecutionContext, etc.) because
// the proper interfaces don't exist yet. Once those are defined, come back
// and replace all `any` with the correct types.

import { constants } from '../../common/constants.js';
import { specStrings } from '../../common/specStrings.js';
import { ScopeNode } from './ScopeNode.js';
import { ActivityRuntimeError } from '../../errors/ActivityRuntimeError.js';
import { DefaultSerializer } from '../../serialization/DefaultSerializer.js';
import type { Serializer } from '../../serialization/Serializer.js';

type ScopePartResult = {
    name: string | null;
    value: any;
};

interface SerializeHandler {
    serialize(
        serializer: Serializer | undefined,
        activity: any,
        execContext: any,
        getActivityById: (id: string) => any,
        propName: string,
        propValue: any,
        result: ScopePartResult,
    ): boolean;

    deserialize(
        serializer: Serializer | undefined,
        activity: any,
        getActivityById: (id: string) => any,
        part: { name: string; value: any },
        result: ScopePartResult,
    ): boolean;
}

export const scopeSerializer = {
    handlers: [] as SerializeHandler[],

    installHandler(handler: SerializeHandler): void {
        this.handlers.push(handler);
    },

    serialize(
        execContext: any,
        getActivityById: (id: string) => any,
        enablePromotions: boolean | undefined,
        nodes: ScopeNode[],
        serializer?: Serializer,
    ): { state: any[]; promotedProperties: Record<string, any> | null } {
        const state: any[] = [];
        const promotedProperties = enablePromotions ? new Map<string, { level: string; value: any }>() : null;

        for (const node of nodes) {
            if (node.instanceId === constants.ids.initialScope) {
                continue;
            }

            const item: any = {
                instanceId: node.instanceId,
                userId: node.userId,
                parentId: node.parent ? node.parent.instanceId : null,
                parts: [],
            };

            const activity = getActivityById(node.instanceId);

            for (const prop of node.properties()) {
                if (!activity.nonSerializedProperties.has(prop.name)) {
                    let done = false;
                    for (const handler of this.handlers) {
                        const result: ScopePartResult = { name: null, value: null };
                        if (handler.serialize(serializer, activity, execContext, getActivityById, prop.name, prop.value, result)) {
                            if (result.name) {
                                item.parts.push({ name: prop.name, value: result.value });
                            } else {
                                item.parts.push(result.value);
                            }
                            done = true;
                            break;
                        }
                    }
                    if (!done) {
                        item.parts.push({ name: prop.name, value: prop.value });
                    }
                }
            }

            state.push(item);

            if (promotedProperties && activity.promotedProperties) {
                for (const promotedPropName of activity.promotedProperties as string[]) {
                    const pv = node.getPropertyValue(promotedPropName, true);
                    if (pv !== undefined && !isActivity(pv)) {
                        const promotedEntry = promotedProperties.get(promotedPropName);
                        if (promotedEntry === undefined || node.instanceId > promotedEntry.level) {
                            promotedProperties.set(promotedPropName, { level: node.instanceId, value: pv });
                        }
                    }
                }
            }
        }

        let actualPromotions: Record<string, any> | null = null;
        if (promotedProperties) {
            actualPromotions = {};
            for (const [key, entry] of promotedProperties) {
                actualPromotions[key] = entry.value;
            }
        }

        return { state, promotedProperties: actualPromotions };
    },

    *deserializeNodes(getActivityById: (id: string) => any, json: any[], serializer?: Serializer): Generator<ScopeNode> {
        for (const item of json) {
            const scopePart: Record<string, any> = {};
            const activity = getActivityById(item.instanceId as string);

            for (const part of item.parts as Array<{ name: string; value: any }>) {
                let done = false;
                for (const handler of this.handlers) {
                    const result: ScopePartResult = { name: null, value: null };
                    if (handler.deserialize(serializer, activity, getActivityById, part, result)) {
                        scopePart[result.name || part.name] = result.value;
                        done = true;
                        break;
                    }
                }
                if (!done) {
                    scopePart[part.name] = part.value;
                }
            }

            yield new ScopeNode(item.instanceId as string, scopePart, item.userId as string | undefined, activity);
        }
    },
};

function isActivity(value: any): boolean {
    return value && typeof value.instanceId === 'string' && typeof value.id === 'string';
}

function getSerializer(serializer?: Serializer): Serializer {
    return serializer ?? new DefaultSerializer();
}

const arrayHandler: SerializeHandler = {
    serialize(
        serializer: Serializer | undefined,
        _activity: any,
        _execContext: any,
        _getActivityById: (id: string) => any,
        propName: string,
        propValue: any,
        result: ScopePartResult,
    ): boolean {
        if (!Array.isArray(propValue)) {
            return false;
        }

        const stuff: any[] = [];
        const ser = getSerializer(serializer);

        for (const pv of propValue) {
            if (isActivity(pv)) {
                stuff.push(specStrings.hosting.createActivityInstancePart(pv.instanceId as string));
            } else {
                stuff.push(serializer ? pv : ser.toJSON(pv));
            }
        }
        result.name = propName;
        result.value = stuff;
        return true;
    },

    deserialize(
        serializer: Serializer | undefined,
        _activity: any,
        getActivityById: (id: string) => any,
        part: { name: string; value: any },
        result: ScopePartResult,
    ): boolean {
        if (!Array.isArray(part.value)) {
            return false;
        }

        const scopePartValue: any[] = [];
        const ser = getSerializer(serializer);

        for (const pv of part.value as string[]) {
            const activityId = specStrings.hosting.getInstanceId(pv);
            if (activityId) {
                scopePartValue.push(getActivityById(activityId));
            } else {
                scopePartValue.push(serializer ? pv : ser.fromJSON(pv));
            }
        }
        result.value = scopePartValue;
        return true;
    },
};

const activityHandler: SerializeHandler = {
    serialize(
        _serializer: Serializer | undefined,
        _activity: any,
        _execContext: any,
        _getActivityById: (id: string) => any,
        propName: string,
        propValue: any,
        result: ScopePartResult,
    ): boolean {
        if (!isActivity(propValue)) {
            return false;
        }
        result.name = propName;
        result.value = specStrings.hosting.createActivityInstancePart(propValue.instanceId as string);
        return true;
    },

    deserialize(
        _serializer: Serializer | undefined,
        _activity: any,
        getActivityById: (id: string) => any,
        part: { name: string; value: any },
        result: ScopePartResult,
    ): boolean {
        const activityId = specStrings.hosting.getInstanceId(part.value);
        if (!activityId) {
            return false;
        }
        result.value = getActivityById(activityId);
        return true;
    },
};

const parentHandler: SerializeHandler = {
    serialize(
        _serializer: Serializer | undefined,
        _activity: any,
        _execContext: any,
        _getActivityById: (id: string) => any,
        propName: string,
        propValue: any,
        result: ScopePartResult,
    ): boolean {
        if (propValue && propValue.__marker === constants.markers.$parent) {
            result.name = propName;
            result.value = { $type: constants.markers.$parent, id: propValue.$activity.instanceId };
            return true;
        }
        return false;
    },

    deserialize(
        _serializer: Serializer | undefined,
        _activity: any,
        _getActivityById: (id: string) => any,
        _part: { name: string; value: any },
        _result: ScopePartResult,
    ): boolean {
        return false;
    },
};

const activityPropHandler: SerializeHandler = {
    serialize(
        _serializer: Serializer | undefined,
        activity: any,
        _execContext: any,
        _getActivityById: (id: string) => any,
        propName: string,
        propValue: any,
        result: ScopePartResult,
    ): boolean {
        if (
            typeof propValue === 'function' &&
            !Object.prototype.hasOwnProperty.call(activity, propName) &&
            typeof activity[propName] === 'function'
        ) {
            result.value = specStrings.hosting.createActivityPropertyPart(propName);
            return true;
        }
        if (typeof propValue === 'object' && propValue !== null && propValue === activity[propName]) {
            result.value = specStrings.hosting.createActivityPropertyPart(propName);
            return true;
        }
        return false;
    },

    deserialize(
        _serializer: Serializer | undefined,
        activity: any,
        _getActivityById: (id: string) => any,
        part: { name: string; value: any },
        result: ScopePartResult,
    ): boolean {
        const activityProperty = specStrings.hosting.getActivityPropertyName(part.value);
        if (!activityProperty) {
            return false;
        }
        if (activity[activityProperty] === undefined) {
            throw new ActivityRuntimeError(`Activity has no property '${part.value}'.`);
        }
        result.name = activityProperty;
        result.value = activity[activityProperty];
        return true;
    },
};

scopeSerializer.installHandler(arrayHandler);
scopeSerializer.installHandler(activityHandler);
scopeSerializer.installHandler(parentHandler);
scopeSerializer.installHandler(activityPropHandler);
