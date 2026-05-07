import { constants } from './constants.js';

const guidLength = constants.markers.activityInstance.length;

export const specStrings = {
    is(specString: unknown): specString is string {
        return (
            typeof specString === 'string' &&
            specString.length > guidLength + 1 &&
            specString[guidLength] === ':' &&
            specString.startsWith(constants.identity)
        );
    },

    getGuid(specString: unknown): string | null {
        if (!specStrings.is(specString)) return null;
        return specString.substring(0, guidLength);
    },

    getString(specString: unknown): string | null {
        if (!specStrings.is(specString)) return null;
        return specString.substring(guidLength + 1);
    },

    split(specString: unknown): { guid: string; str: string } | null {
        if (!specStrings.is(specString)) return null;
        return {
            guid: specString.substring(0, guidLength),
            str: specString.substring(guidLength + 1),
        };
    },

    activities: {
        createCollectingCompletedBMName(activityId: string): string {
            return makeSpecString(constants.markers.collectingCompletedBookmark, activityId);
        },
        createValueCollectedBMName(activityId: string): string {
            return makeSpecString(constants.markers.valueCollectedBookmark, activityId);
        },
    },

    hosting: {
        createBeginMethodBMName(methodName: string): string {
            return makeSpecString(constants.markers.beginMethodBookmark, methodName);
        },

        createDelayToMethodName(id: string): string {
            return makeSpecString(constants.markers.delayToMethodNamePrefix, id);
        },

        createActivityPropertyPart(methodName: string): string {
            return makeSpecString(constants.markers.activityProperty, methodName);
        },

        createActivityInstancePart(activityId: string): string {
            return constants.markers.activityInstance + ':' + activityId;
        },

        getActivityPropertyName(obj: unknown): string | null {
            const parts = specStrings.split(obj);
            if (parts && parts.guid === constants.markers.activityProperty) {
                return parts.str;
            }
            return null;
        },

        getInstanceId(obj: unknown): string | null {
            const parts = specStrings.split(obj);
            if (parts && parts.guid === constants.markers.activityInstance) {
                return parts.str;
            }
            return null;
        },

        isDelayToMethodName(obj: unknown): boolean {
            const parts = specStrings.split(obj);
            return parts !== null && parts.guid === constants.markers.delayToMethodNamePrefix;
        },

        doubleKeys(key1: string, key2: string): string {
            return key1 + constants.markers.keySeparator + key2;
        },
    },
};

function makeSpecString(guid: string, str: string): string {
    return guid + ':' + str;
}
