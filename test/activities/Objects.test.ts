import { ActivityExecutionEngine, activityMarkup } from '../../src/index.js';
import assert from 'assert';

describe('Objects', () => {
    describe('Merge', () => {
        it('should merge arrays', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@merge': [[1, 2, 3], '= [4, 5, 6]'],
                }),
            );

            const result = await engine.invoke();

            assert.ok(Array.isArray(result));
            assert.equal(result.length, 6);
            assert.equal(
                (result as number[]).reduce((a, b) => a + b, 0),
                21,
            );
        });

        it('should merge objects', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@merge': [{ a: 2 }, '= {b: 2}', { c: 42 }],
                }),
            );

            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(typeof result === 'object' && result !== null && !Array.isArray(result));
            assert.equal(Object.keys(result).length, 3);
            assert.equal(result.a, 2);
            assert.equal(result.b, 2);
            assert.equal(result.c, 42);
        });
    });

    describe('Obj', () => {
        it('should create an object from key and value args', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@obj': ['key', 'value'],
                }),
            );

            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(typeof result === 'object' && result !== null && !Array.isArray(result));
            assert.equal(Object.keys(result).length, 1);
            assert.equal(result.key, 'value');
        });
    });
});
