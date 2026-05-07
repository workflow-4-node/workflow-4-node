import { specStrings } from '../../src/common/specStrings.js';
import { constants } from '../../src/common/constants.js';

const markerLen = constants.markers.activityInstance.length;

function makeValidSpecString(str: string): string {
    return constants.markers.activityInstance + ':' + str;
}

describe('specStrings', () => {
    describe('is', () => {
        it('should return true for a valid spec string', () => {
            expect(specStrings.is(makeValidSpecString('test'))).toBe(true);
        });

        it('should return false for a plain string', () => {
            expect(specStrings.is('hello')).toBe(false);
        });

        it('should return false for a string without colon separator', () => {
            const noColon = constants.markers.activityInstance + 'test';
            expect(specStrings.is(noColon)).toBe(false);
        });

        it('should return false for a string that is too short', () => {
            expect(specStrings.is('short')).toBe(false);
        });

        it('should return false for a string with wrong identity prefix', () => {
            const wrongPrefix = 'x' + makeValidSpecString('test').slice(1);
            expect(specStrings.is(wrongPrefix)).toBe(false);
        });

        it('should return false for non-string values', () => {
            expect(specStrings.is(123)).toBe(false);
            expect(specStrings.is(null)).toBe(false);
            expect(specStrings.is(undefined)).toBe(false);
            expect(specStrings.is({})).toBe(false);
        });

        it('should return true for a valid spec string at the minimum length', () => {
            const minLen = markerLen + 2;
            const s = makeValidSpecString('x');
            expect(s.length).toBeGreaterThanOrEqual(minLen);
            expect(specStrings.is(s)).toBe(true);
        });
    });

    describe('getGuid', () => {
        it('should extract the guid from a valid spec string', () => {
            const result = specStrings.getGuid(makeValidSpecString('foo'));
            expect(result).toBe(constants.markers.activityInstance);
        });

        it('should return null for an invalid spec string', () => {
            expect(specStrings.getGuid('hello')).toBeNull();
        });

        it('should return null for non-string input', () => {
            expect(specStrings.getGuid(42)).toBeNull();
        });
    });

    describe('getString', () => {
        it('should extract the string part after the colon', () => {
            const result = specStrings.getString(makeValidSpecString('myId'));
            expect(result).toBe('myId');
        });

        it('should return null for an invalid spec string', () => {
            expect(specStrings.getString('hello')).toBeNull();
        });

        it('should handle strings with colons in the value part', () => {
            const result = specStrings.getString(makeValidSpecString('a:b:c'));
            expect(result).toBe('a:b:c');
        });
    });

    describe('split', () => {
        it('should return guid and str from a valid spec string', () => {
            const result = specStrings.split(makeValidSpecString('hello'));
            expect(result).toEqual({
                guid: constants.markers.activityInstance,
                str: 'hello',
            });
        });

        it('should return null for an invalid spec string', () => {
            expect(specStrings.split('hello')).toBeNull();
        });

        it('should return null for non-string input', () => {
            expect(specStrings.split(undefined)).toBeNull();
        });
    });

    describe('activities', () => {
        describe('createCollectingCompletedBMName', () => {
            it('should create a valid spec string with collectingCompletedBookmark marker', () => {
                const result = specStrings.activities.createCollectingCompletedBMName('act1');
                expect(specStrings.is(result)).toBe(true);
                expect(specStrings.getGuid(result)).toBe(constants.markers.collectingCompletedBookmark);
                expect(specStrings.getString(result)).toBe('act1');
            });
        });

        describe('createValueCollectedBMName', () => {
            it('should create a valid spec string with valueCollectedBookmark marker', () => {
                const result = specStrings.activities.createValueCollectedBMName('act2');
                expect(specStrings.is(result)).toBe(true);
                expect(specStrings.getGuid(result)).toBe(constants.markers.valueCollectedBookmark);
                expect(specStrings.getString(result)).toBe('act2');
            });
        });
    });

    describe('hosting', () => {
        describe('createBeginMethodBMName', () => {
            it('should create a valid spec string with beginMethodBookmark marker', () => {
                const result = specStrings.hosting.createBeginMethodBMName('myMethod');
                expect(specStrings.is(result)).toBe(true);
                expect(specStrings.getGuid(result)).toBe(constants.markers.beginMethodBookmark);
                expect(specStrings.getString(result)).toBe('myMethod');
            });
        });

        describe('createDelayToMethodName', () => {
            it('should create a valid spec string with delayToMethodNamePrefix marker', () => {
                const result = specStrings.hosting.createDelayToMethodName('id123');
                expect(specStrings.is(result)).toBe(true);
                expect(specStrings.getGuid(result)).toBe(constants.markers.delayToMethodNamePrefix);
                expect(specStrings.getString(result)).toBe('id123');
            });
        });

        describe('createActivityPropertyPart', () => {
            it('should create a valid spec string with activityProperty marker', () => {
                const result = specStrings.hosting.createActivityPropertyPart('propName');
                expect(specStrings.is(result)).toBe(true);
                expect(specStrings.getGuid(result)).toBe(constants.markers.activityProperty);
                expect(specStrings.getString(result)).toBe('propName');
            });
        });

        describe('createActivityInstancePart', () => {
            it('should create a spec string with activityInstance marker', () => {
                const result = specStrings.hosting.createActivityInstancePart('inst1');
                expect(specStrings.is(result)).toBe(true);
                expect(specStrings.getGuid(result)).toBe(constants.markers.activityInstance);
                expect(specStrings.getString(result)).toBe('inst1');
            });
        });

        describe('getActivityPropertyName', () => {
            it('should extract the property name from an activityProperty spec string', () => {
                const spec = specStrings.hosting.createActivityPropertyPart('myProp');
                expect(specStrings.hosting.getActivityPropertyName(spec)).toBe('myProp');
            });

            it('should return null for a non-activityProperty spec string', () => {
                const spec = specStrings.hosting.createBeginMethodBMName('method');
                expect(specStrings.hosting.getActivityPropertyName(spec)).toBeNull();
            });

            it('should return null for a plain string', () => {
                expect(specStrings.hosting.getActivityPropertyName('hello')).toBeNull();
            });
        });

        describe('getInstanceId', () => {
            it('should extract the instance id from an activityInstance spec string', () => {
                const spec = specStrings.hosting.createActivityInstancePart('inst42');
                expect(specStrings.hosting.getInstanceId(spec)).toBe('inst42');
            });

            it('should return null for a non-activityInstance spec string', () => {
                const spec = specStrings.hosting.createBeginMethodBMName('method');
                expect(specStrings.hosting.getInstanceId(spec)).toBeNull();
            });
        });

        describe('isDelayToMethodName', () => {
            it('should return true for a delayToMethodName spec string', () => {
                const spec = specStrings.hosting.createDelayToMethodName('timer1');
                expect(specStrings.hosting.isDelayToMethodName(spec)).toBe(true);
            });

            it('should return false for other spec strings', () => {
                const spec = specStrings.hosting.createBeginMethodBMName('method');
                expect(specStrings.hosting.isDelayToMethodName(spec)).toBe(false);
            });

            it('should return false for a plain string', () => {
                expect(specStrings.hosting.isDelayToMethodName('hello')).toBe(false);
            });
        });

        describe('doubleKeys', () => {
            it('should join two keys with the keySeparator', () => {
                const result = specStrings.hosting.doubleKeys('part1', 'part2');
                expect(result).toBe('part1' + constants.markers.keySeparator + 'part2');
            });
        });
    });

    describe('integration', () => {
        it('should round-trip through create and split', () => {
            const bm = specStrings.activities.createCollectingCompletedBMName('activityX');
            const parts = specStrings.split(bm);
            expect(parts).not.toBeNull();
            expect(parts!.guid).toBe(constants.markers.collectingCompletedBookmark);
            expect(parts!.str).toBe('activityX');
        });

        it('should round-trip through createActivityInstancePart and getInstanceId', () => {
            const id = 'instance-001';
            const part = specStrings.hosting.createActivityInstancePart(id);
            expect(specStrings.hosting.getInstanceId(part)).toBe(id);
        });

        it('should round-trip through createActivityPropertyPart and getActivityPropertyName', () => {
            const name = 'someProperty';
            const part = specStrings.hosting.createActivityPropertyPart(name);
            expect(specStrings.hosting.getActivityPropertyName(part)).toBe(name);
        });

        it('should compose and decompose doubleKeys', () => {
            const key = specStrings.hosting.doubleKeys('workflow1', 'activity2');
            // doubleKeys result is not a spec string, just concatenated
            expect(key).toBe('workflow1' + constants.markers.keySeparator + 'activity2');
        });
    });
});
