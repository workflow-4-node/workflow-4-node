import { ActivityExecutionEngine, Func, Pick, activityMarkup, promiseHelpers } from '../../src/index.js';
import assert from 'assert';

describe('Pick', () => {
    it('should work as expected with sync activities', async () => {
        const activity = await activityMarkup.parse({
            '@pick': {
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
        const result = await engine.invoke();

        assert.equal(result, 'a');
    });

    it('should work as expected with async activities', async () => {
        const activity = await activityMarkup.parse({
            '@pick': [
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
        });

        const engine = new ActivityExecutionEngine(activity);
        const result = await engine.invoke();

        assert.equal(result, 0);
    });

    it('should return undefined when no args are given', async () => {
        const pick = new Pick();

        const engine = new ActivityExecutionEngine(pick);
        const result = await engine.invoke();

        assert.equal(result, undefined);
    });

    it('should work when created programmatically', async () => {
        const pick = new Pick();
        const f1 = new Func();
        f1.code = async () => {
            await promiseHelpers.delay(50);
            return 'slow';
        };
        const f2 = new Func();
        f2.code = () => 'fast';
        pick.args = [f1, f2];

        const engine = new ActivityExecutionEngine(pick);
        const result = await engine.invoke();

        assert.equal(result, 'fast');
    });

    it('should pick the first completing activity when all sync', async () => {
        const pick = new Pick();
        const f1 = new Func();
        f1.code = () => 'first';
        const f2 = new Func();
        f2.code = () => 'second';
        pick.args = [f1, f2];

        const engine = new ActivityExecutionEngine(pick);
        const result = await engine.invoke();

        // Either 'first' or 'second' — whichever completes first
        assert.ok(result === 'first' || result === 'second');
    });

    it('should run twice', async () => {
        const activity = await activityMarkup.parse({
            '@pick': [
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
        });

        const engine = new ActivityExecutionEngine(activity);
        const r1 = await engine.invoke();
        assert.ok(r1 === 'a' || r1 === 'b');

        const r2 = await engine.invoke();
        assert.ok(r2 === 'a' || r2 === 'b');
    });

    it('should propagate an error when the first completing branch throws', async () => {
        const pick = new Pick();
        const f1 = new Func();
        f1.code = () => {
            throw new Error('Boo.');
        };
        const f2 = new Func();
        f2.code = async () => {
            await promiseHelpers.delay(100);
            return 'slow';
        };
        pick.args = [f1, f2];

        const engine = new ActivityExecutionEngine(pick);
        await assert.rejects(engine.invoke(), (err: unknown) => {
            assert(err instanceof Error);
            assert.match(err.message, /Boo/);
            return true;
        });
    });

    it('should not propagate an error when a later branch throws after the first completes', async () => {
        const pick = new Pick();
        const f1 = new Func();
        f1.code = () => 'fast';
        const f2 = new Func();
        f2.code = async () => {
            await promiseHelpers.delay(100);
            throw new Error('Boo.');
        };
        pick.args = [f1, f2];

        const engine = new ActivityExecutionEngine(pick);
        const result = await engine.invoke();

        assert.equal(result, 'fast');
    });

    it('should work with more than 2 branches', async () => {
        const activity = await activityMarkup.parse({
            '@pick': [
                {
                    '@func': {
                        code: async function () {
                            await promiseHelpers.delay(100);
                            return 'third';
                        },
                    },
                },
                {
                    '@func': {
                        code: async function () {
                            await promiseHelpers.delay(50);
                            return 'second';
                        },
                    },
                },
                {
                    '@func': {
                        code: async function () {
                            await promiseHelpers.delay(10);
                            return 'first';
                        },
                    },
                },
            ],
        });

        const engine = new ActivityExecutionEngine(activity);
        const result = await engine.invoke();

        assert.equal(result, 'first');
    });

    it('should propagate an error with more than 2 branches when the fastest throws', async () => {
        const pick = new Pick();
        const f1 = new Func();
        f1.code = async () => {
            await promiseHelpers.delay(100);
            return 'slow';
        };
        const f2 = new Func();
        f2.code = () => {
            throw new Error('Boo.');
        };
        const f3 = new Func();
        f3.code = async () => {
            await promiseHelpers.delay(200);
            return 'slowest';
        };
        pick.args = [f1, f2, f3];

        const engine = new ActivityExecutionEngine(pick);
        await assert.rejects(engine.invoke(), (err: unknown) => {
            assert(err instanceof Error);
            assert.match(err.message, /Boo/);
            return true;
        });
    });
});
