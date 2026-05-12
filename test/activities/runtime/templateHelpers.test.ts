import { templateHelpers } from '../../../src/activities/runtime/templateHelpers.js';

describe('templateHelpers', () => {
    // ----- isFunctionString -----

    describe('isFunctionString', () => {
        it('should match traditional function expressions', () => {
            expect(templateHelpers.isFunctionString('function() {}')).toBe(true);
            expect(templateHelpers.isFunctionString('function name() {}')).toBe(true);
            expect(templateHelpers.isFunctionString('function  name  () {}')).toBe(true);
        });

        it('should match generator function expressions', () => {
            expect(templateHelpers.isFunctionString('function*() {}')).toBe(true);
            expect(templateHelpers.isFunctionString('function* name() {}')).toBe(true);
        });

        it('should match async function expressions', () => {
            expect(templateHelpers.isFunctionString('async function() {}')).toBe(true);
            expect(templateHelpers.isFunctionString('async function name() {}')).toBe(true);
            expect(templateHelpers.isFunctionString('async function* name() {}')).toBe(true);
        });

        it('should match arrow functions with parentheses', () => {
            expect(templateHelpers.isFunctionString('() => {}')).toBe(true);
            expect(templateHelpers.isFunctionString('(x) => {}')).toBe(true);
            expect(templateHelpers.isFunctionString('(x, y) => {}')).toBe(true);
            expect(templateHelpers.isFunctionString('async (x) => {}')).toBe(true);
            expect(templateHelpers.isFunctionString('async (x, y) => {}')).toBe(true);
        });

        it('should match arrow functions without parentheses', () => {
            expect(templateHelpers.isFunctionString('x => {}')).toBe(true);
            expect(templateHelpers.isFunctionString('x => x')).toBe(true);
            expect(templateHelpers.isFunctionString('async x => {}')).toBe(true);
        });

        it('should not match regular strings', () => {
            expect(templateHelpers.isFunctionString('hello')).toBe(false);
            expect(templateHelpers.isFunctionString('=expr')).toBe(false);
            expect(templateHelpers.isFunctionString('a + b')).toBe(false);
        });

        it('should not match empty or single-character strings', () => {
            expect(templateHelpers.isFunctionString('')).toBe(false);
            expect(templateHelpers.isFunctionString('f')).toBe(false);
        });
    });

    // ----- isTemplate -----

    describe('isTemplate', () => {
        it('should return true when an object contains activity markup', () => {
            const obj = { action: { '@someActivity': { prop: 'value' } } };
            expect(templateHelpers.isTemplate(obj)).toBe(true);
        });

        it('should return false when an object has no activity markup', () => {
            const obj = { a: 1, b: 'hello' };
            expect(templateHelpers.isTemplate(obj)).toBe(false);
        });

        it('should return false for an empty object', () => {
            expect(templateHelpers.isTemplate({})).toBe(false);
        });

        it('should return false for an empty array', () => {
            expect(templateHelpers.isTemplate([])).toBe(false);
        });
    });

    // ----- visitActivities: complex object covering all code paths -----

    describe('visitActivities', () => {
        it('should discover all markup patterns in a complex nested object', () => {
            const obj = {
                // 1. Plain string → no markup
                title: 'hello',

                // 2. String starting with = → @expression
                exprProp: '=a + b',

                // 3. String that looks like a function → @func (string form)
                fnString: 'function() { return 1; }',

                // 4. Actual function value → @func (function form)
                fnActual: () => 2,

                // 5. Single @-key object
                activityRef: { '@log': { message: 'test' } },

                // 6. @import + @-key object
                imported: { '@import': { from: './util' }, '@writeLine': { text: 'hi' } },

                // 7. @-key + @import (reversed order)
                importedReversed: { '@writeError': { text: 'err' }, '@import': { from: './err' } },

                // 8. Plain object with multiple keys but no @-prefix → no markup
                plainData: { x: 1, y: 2 },

                // 9. Nested array containing markup
                steps: [{ '@delay': { duration: 1000 } }],
            };

            const discovered: Array<{ markup: Record<string, any>; parent: any; key: string }> = [];
            templateHelpers.visitActivities(obj, (markup, parent, key) => {
                discovered.push({ markup, parent, key });
            });

            // 1. @expression from '=a + b'
            const exprMarkup = discovered.find((d) => d.key === 'exprProp');
            expect(exprMarkup).toBeDefined();
            expect(exprMarkup!.markup).toEqual({ '@expression': { expr: 'a + b' } });
            expect(exprMarkup!.parent).toBe(obj);

            // 2. @func (string form)
            const fnStrMarkup = discovered.find((d) => d.key === 'fnString');
            expect(fnStrMarkup).toBeDefined();
            expect(fnStrMarkup!.markup).toEqual({ '@func': { code: 'function() { return 1; }' } });
            expect(fnStrMarkup!.parent).toBe(obj);

            // 3. @func (function form)
            const fnActualMarkup = discovered.find((d) => d.key === 'fnActual');
            expect(fnActualMarkup).toBeDefined();
            expect(fnActualMarkup!.markup).toEqual({ '@func': { code: obj.fnActual } });
            expect(fnActualMarkup!.parent).toBe(obj);

            // 4. Single @-key object
            const activityMarkup = discovered.find((d) => d.key === 'activityRef');
            expect(activityMarkup).toBeDefined();
            expect(activityMarkup!.markup).toEqual({ '@log': { message: 'test' } });
            expect(activityMarkup!.parent).toBe(obj);

            // 5. @import + @-key (ordered @import first)
            const importedMarkup = discovered.find((d) => d.key === 'imported');
            expect(importedMarkup).toBeDefined();
            expect(importedMarkup!.markup).toEqual({
                '@import': { from: './util' },
                '@writeLine': { text: 'hi' },
            });
            expect(importedMarkup!.parent).toBe(obj);

            // 6. @-key + @import (reversed order — @import still comes first in markup)
            const reversedMarkup = discovered.find((d) => d.key === 'importedReversed');
            expect(reversedMarkup).toBeDefined();
            expect(reversedMarkup!.markup).toEqual({
                '@import': { from: './err' },
                '@writeError': { text: 'err' },
            });
            expect(reversedMarkup!.parent).toBe(obj);

            // 7. Nested array element
            const delayMarkup = discovered.find((d) => d.key === '0');
            expect(delayMarkup).toBeDefined();
            expect(delayMarkup!.markup).toEqual({ '@delay': { duration: 1000 } });
            expect(delayMarkup!.parent).toBe(obj.steps);

            // Total discoveries
            expect(discovered.length).toBe(7);
        });
    });
});
