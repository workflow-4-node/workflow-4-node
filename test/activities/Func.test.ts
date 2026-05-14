import * as _ from 'es-toolkit';
import { ActivityExecutionEngine, Func, activityMarkup, ActivityRuntimeError } from '../../src/index.js';
import assert from 'assert';

type Person = {
    name: string;
};

describe('Func', () => {
    it('should run with a synchronous code', async () => {
        const fop = new Func();
        fop.code = function (obj: Person) {
            assert(obj && typeof obj === 'object' && typeof obj.name === 'string', 'Input is not a Person object.');
            return obj.name;
        };

        const engine = new ActivityExecutionEngine(fop);
        const result = await engine.invoke({ name: 'Gabor' });
        assert.equal(result, 'Gabor');
    });

    it('should run when created from markup', async () => {
        const fop = await activityMarkup.parse({
            '@func': {
                code: function (obj: Person) {
                    return obj.name;
                },
            },
        });

        const engine = new ActivityExecutionEngine(fop);
        const result = await engine.invoke({ name: 'Gabor' });
        assert.equal(result, 'Gabor');
    });

    it('should run twice', async () => {
        const fop = await activityMarkup.parse({
            '@func': {
                code: function (obj: Person) {
                    return obj.name;
                },
            },
        });

        const engine = new ActivityExecutionEngine(fop);
        const r1 = await engine.invoke({ name: 'Gabor' });
        assert.equal(r1, 'Gabor');
        const r2 = await engine.invoke({ name: 'Pisti' });
        assert.equal(r2, 'Pisti');
    });

    it('should run when code is asynchronous', async () => {
        const fop = new Func();
        fop.code = async function (obj: Person) {
            return Promise.resolve(obj.name);
        };

        const engine = new ActivityExecutionEngine(fop);
        const result = await engine.invoke({ name: 'Mezo' });
        assert.equal(result, 'Mezo');
    });

    it('should run asynchronously when code is a generator', async () => {
        const fop = new Func(async (a: Person) => {
            await new Promise<void>((r) => setTimeout(r, 100));
            return a.name;
        });

        const engine = new ActivityExecutionEngine(fop);
        const result = await engine.invoke({ name: 'Mezo' });
        assert.equal(result, 'Mezo');
    });

    it('should not accept activities as arguments', async () => {
        const expected = { name: 'Gabor' };
        const fop = new Func();
        fop.code = function (obj: Person) {
            return obj.name;
        };
        const fopin = new Func();
        fopin.code = () => expected;

        const engine = new ActivityExecutionEngine(fop);
        await assert.rejects(engine.invoke(fopin), (err: unknown) => {
            assert(err instanceof ActivityRuntimeError);
            return true;
        });
    });

    it('should use external functions', async () => {
        const expected = { name: 'gaborMezo' };

        const fop = await activityMarkup.parse({
            '@func': {
                args: {
                    '@func': {
                        code: () => expected,
                    },
                },
                code: function (obj: { name: string }) {
                    return _.camelCase(obj.name);
                },
            },
        });

        const engine = new ActivityExecutionEngine(fop);
        const result = await engine.invoke();
        assert.equal(result, _.camelCase(expected.name));
    });

    describe('from markup', () => {
        it('should run with a regular function as code', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: function (obj: Person) {
                        return obj.name;
                    },
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Gabor' });
            assert.equal(result, 'Gabor');
        });

        it('should run with an arrow function as code', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: (obj: Person) => obj.name,
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Archer' });
            assert.equal(result, 'Archer');
        });

        it('should run with a string function as code (lambda syntax)', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: '(obj) => obj.name',
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Lambda' });
            assert.equal(result, 'Lambda');
        });

        it('should run with a string async function as code', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: 'async (obj) => obj.name',
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'AsyncLambda' });
            assert.equal(result, 'AsyncLambda');
        });

        it('should run twice', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: (obj: Person) => obj.name,
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const r1 = await engine.invoke({ name: 'First' });
            assert.equal(r1, 'First');
            const r2 = await engine.invoke({ name: 'Second' });
            assert.equal(r2, 'Second');
        });
    });

    describe('async code', () => {
        it('should run with an async function (promise-based)', async () => {
            const fop = new Func();
            fop.code = async (obj: Person) => {
                return obj.name;
            };

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Async' });
            assert.equal(result, 'Async');
        });

        it('should run with a promise-returning function', async () => {
            const fop = new Func();
            fop.code = async function (obj: Person) {
                return Promise.resolve(obj.name);
            };

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Promised' });
            assert.equal(result, 'Promised');
        });

        it('should run an async arrow function from markup', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: async (obj: Person) => obj.name,
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'AsyncArrow' });
            assert.equal(result, 'AsyncArrow');
        });

        it('should run a promise-returning function from markup', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: async function (obj: Person) {
                        return Promise.resolve(obj.name);
                    },
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'PromisedMarkup' });
            assert.equal(result, 'PromisedMarkup');
        });

        it('should run with a synchronous function returning a Promise', async () => {
            const fop = new Func();
            fop.code = async function (obj: Person) {
                return Promise.resolve(obj.name);
            };

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'SyncPromise' });
            assert.equal(result, 'SyncPromise');
        });

        it('should run an async function with delay', async () => {
            const fop = new Func();
            fop.code = async (obj: Person) => {
                await new Promise((r) => setTimeout(r, 10));
                return obj.name;
            };

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Delayed' });
            assert.equal(result, 'Delayed');
        });
    });

    describe('error handling', () => {
        it('should propagate an error thrown from code', async () => {
            const fop = new Func();
            fop.code = function () {
                throw new Error('Boo.');
            };

            const engine = new ActivityExecutionEngine(fop);
            await assert.rejects(engine.invoke(), (err: unknown) => {
                assert(err instanceof Error);
                assert.match(err.message, /Boo/);
                return true;
            });
        });

        it('should propagate an error thrown from code in markup', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: () => {
                        throw new Error('Bang.');
                    },
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            await assert.rejects(engine.invoke(), (err: unknown) => {
                assert(err instanceof Error);
                assert.match(err.message, /Bang/);
                return true;
            });
        });
    });

    describe('with arguments', () => {
        it('should run with a nested @func as argument', async () => {
            const expected = { name: 'Nested' };

            const fop = await activityMarkup.parse({
                '@func': {
                    args: {
                        '@func': {
                            code: () => expected,
                        },
                    },
                    code: (obj: Person) => obj.name,
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke();
            assert.equal(result, expected.name);
        });

        it('should pass multiple arguments from args array', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    args: [
                        {
                            '@func': {
                                code: () => 'Hello',
                            },
                        },
                        {
                            '@func': {
                                code: () => 'World',
                            },
                        },
                    ],
                    code: (greeting: string, subject: string) => greeting + ' ' + subject,
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke();
            assert.equal(result, 'Hello World');
        });

        it('should include es-toolkit when used directly in the function', async () => {
            const expected = { name: 'gaborMezo' };

            const fop = await activityMarkup.parse({
                '@func': {
                    args: {
                        '@func': {
                            code: () => expected,
                        },
                    },
                    code: (obj: { name: string }) => _.camelCase(obj.name),
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke();
            assert.equal(result, _.camelCase(expected.name));
        });

        it('should accept an activity as an argument', async () => {
            const expected = { name: 'Gabor' };
            const fop = await activityMarkup.parse({
                '@func': {
                    args: {
                        '@func': {
                            code: () => expected,
                        },
                    },
                    code: (obj: Person) => obj.name,
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke();
            assert.equal(result, expected.name);
        });
    });

    describe('edge cases', () => {
        it('should run with no code (no-op)', async () => {
            const fop = new Func();
            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Noop' });
            assert.equal(result, undefined);
        });

        it('should run with no args when code expects none', async () => {
            const fop = await activityMarkup.parse({
                '@func': {
                    code: () => 42,
                },
            });

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke();
            assert.equal(result, 42);
        });

        it('should return null from code', async () => {
            const fop = new Func();
            fop.code = () => null;

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Null' });
            assert.equal(result, null);
        });

        it('should return a number from code', async () => {
            const fop = new Func();
            fop.code = () => 42;

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke();
            assert.equal(result, 42);
        });

        it('should return an object from code', async () => {
            const expected = { hello: 'world' };
            const fop = new Func();
            fop.code = () => expected;

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke();
            assert.deepEqual(result, expected);
        });

        it('should return undefined from code with no return', async () => {
            const fop = new Func();
            fop.code = () => {
                /* no return */
            };

            const engine = new ActivityExecutionEngine(fop);
            const result = await engine.invoke({ name: 'Void' });
            assert.equal(result, undefined);
        });
    });

    describe('calling other methods', () => {
        it('should run when created from markup', async () => {
            const markup = await activityMarkup.parse({
                '@block': {
                    id: 'block',
                    code: {
                        _: function (obj: Person) {
                            return obj.name;
                        },
                    },
                    args: {
                        '@func': {
                            code: '= this.block.code',
                            args: { name: 'Gabor' },
                        },
                    },
                },
            });

            const engine = new ActivityExecutionEngine(markup);
            const result = await engine.invoke();
            assert.equal(result, 'Gabor');
        });

        it('should run when code is asynchronous', async () => {
            const markup = await activityMarkup.parse({
                '@block': {
                    id: 'block',
                    code: {
                        _: async function (obj: Person) {
                            return new Promise<void>((r) => setTimeout(r, 10)).then(function () {
                                return obj.name;
                            });
                        },
                    },
                    args: {
                        '@func': {
                            code: '= this.block.code',
                            args: { name: 'Gabor' },
                        },
                    },
                },
            });

            const engine = new ActivityExecutionEngine(markup);
            const result = await engine.invoke();
            assert.equal(result, 'Gabor');
        });

        it('should include lodash as last argument', async () => {
            const markup = await activityMarkup.parse({
                '@block': {
                    id: 'block',
                    code: {
                        _: async function (obj: { name: string }, __: typeof _) {
                            return new Promise<void>((r) => setTimeout(r, 10)).then(function () {
                                return __.camelCase(obj.name);
                            });
                        },
                    },
                    args: {
                        '@func': {
                            code: '= this.block.code',
                            args: { name: 'gaborMezo' },
                        },
                    },
                },
            });

            const engine = new ActivityExecutionEngine(markup);
            const result = await engine.invoke();
            assert.equal(result, _.camelCase('gaborMezo'));
        });

        it('should fail with error', async () => {
            const markup = await activityMarkup.parse({
                '@block': [
                    function () {
                        throw new Error('Boo.');
                    },
                ],
            });

            const engine = new ActivityExecutionEngine(markup);
            await assert.rejects(engine.invoke(), (err: unknown) => {
                assert(err instanceof Error);
                assert.match(err.message, /Boo/);
                return true;
            });
        });
    });
});
