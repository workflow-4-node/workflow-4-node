import { ActivityExecutionEngine, Func, activityMarkup } from '../../src/index.js';
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
    });
});
