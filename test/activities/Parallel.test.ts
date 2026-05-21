import { ActivityExecutionEngine, Func, Parallel, activityMarkup, promiseHelpers } from '../../src/index.js';
import assert from 'assert';

describe('Parallel', () => {
    it('should work as expected with sync activities', async () => {
        const activity = await activityMarkup.parse({
            '@parallel': {
                let1: '',
                args: [
                    {
                        '@func': {
                            code: function () {
                                return ((this as any).let1 += 'a');
                            },
                        },
                    },
                    {
                        '@func': {
                            code: 'function() { return this.let1 += "b"; }',
                        },
                    },
                ],
            },
        });

        const engine = new ActivityExecutionEngine(activity);
        const result = (await engine.invoke()) as string[];

        assert.equal(result.length, 2);
        assert.equal(result[0], 'a');
        assert.equal(result[1], 'ab');
    });

    it('should work as expected with async activities', async () => {
        const activity = await activityMarkup.parse({
            '@parallel': {
                let1: '',
                args: [
                    {
                        '@func': {
                            code: function () {
                                return ((this as any).let1 += 'a');
                            },
                        },
                    },
                    {
                        '@func': {
                            code: 'function() { return this.let1 += "b"; }',
                        },
                    },
                    {
                        '@func': {
                            code: async function () {
                                await promiseHelpers.delay(100);
                                return 42;
                            },
                        },
                    },
                    {
                        '@func': {
                            code: async function () {
                                await promiseHelpers.immediate();
                                return 0;
                            },
                        },
                    },
                ],
            },
        });

        const engine = new ActivityExecutionEngine(activity);
        const result = (await engine.invoke()) as unknown[];

        assert.equal(result.length, 4);
        assert.equal(result[0], 'a');
        assert.equal(result[1], 'ab');
        assert.equal(result[2], 42);
        assert.equal(result[3], 0);
    });

    it('should return an empty array when no args are given', async () => {
        const parallel = new Parallel();

        const engine = new ActivityExecutionEngine(parallel);
        const result = await engine.invoke();

        assert.ok(Array.isArray(result));
        assert.equal(result.length, 0);
    });

    it('should work when created programmatically', async () => {
        const parallel = new Parallel();
        const f1 = new Func();
        f1.code = () => 1;
        const f2 = new Func();
        f2.code = () => 2;
        parallel.args = [f1, f2];

        const engine = new ActivityExecutionEngine(parallel);
        const result = (await engine.invoke()) as number[];

        assert.equal(result.length, 2);
        assert.equal(result[0], 1);
        assert.equal(result[1], 2);
    });

    it('should propagate an error from a child activity', async () => {
        const activity = await activityMarkup.parse({
            '@parallel': {
                args: [
                    {
                        '@func': {
                            code: () => 1,
                        },
                    },
                    {
                        '@func': {
                            code: () => {
                                throw new Error('Boo.');
                            },
                        },
                    },
                    {
                        '@func': {
                            code: () => 3,
                        },
                    },
                ],
            },
        });

        const engine = new ActivityExecutionEngine(activity);
        await assert.rejects(engine.invoke(), (err: unknown) => {
            assert(err instanceof Error);
            assert.match(err.message, /Boo/);
            return true;
        });
    });

    it('should run twice', async () => {
        const activity = await activityMarkup.parse({
            '@parallel': {
                args: [
                    {
                        '@func': {
                            code: () => 'a',
                        },
                    },
                    {
                        '@func': {
                            code: () => 'b',
                        },
                    },
                ],
            },
        });

        const engine = new ActivityExecutionEngine(activity);
        const r1 = (await engine.invoke()) as string[];
        assert.equal(r1.length, 2);
        assert.equal(r1[0], 'a');
        assert.equal(r1[1], 'b');

        const r2 = (await engine.invoke()) as string[];
        assert.equal(r2.length, 2);
        assert.equal(r2[0], 'a');
        assert.equal(r2[1], 'b');
    });

    it('should run with variable declarations', async () => {
        const parallel = new Parallel();
        (parallel as any).x = 10;
        const f1 = new Func();
        f1.code = function () {
            return (this as any).x;
        };
        const f2 = new Func();
        f2.code = function () {
            return (this as any).x * 2;
        };
        parallel.args = [f1, f2];

        const engine = new ActivityExecutionEngine(parallel);
        const result = (await engine.invoke()) as number[];

        assert.equal(result.length, 2);
        assert.equal(result[0], 10);
        assert.equal(result[1], 20);
    });
});
