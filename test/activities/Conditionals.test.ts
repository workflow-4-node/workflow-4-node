import { ActivityExecutionEngine, activityMarkup, promiseHelpers } from '../../src/index.js';
import assert from 'assert';

describe('Conditionals', () => {
    describe('If', () => {
        it('should call then', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    v: 5,
                    args: [
                        {
                            '@if': {
                                condition: '= this.v == 5',
                                then: {
                                    '@func': {
                                        args: [1],
                                        code: function (this: any, a: number) {
                                            return a + this.v;
                                        },
                                    },
                                },
                                else: {
                                    '@func': {
                                        args: [2],
                                        code: function (this: any, a: number) {
                                            return a + this.v;
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = await engine.invoke();

            assert.equal(result, 1 + 5);
        });

        it('should call else', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    v: 5,
                    r: 0,
                    args: [
                        {
                            '@if': {
                                condition: {
                                    '@func': {
                                        code: function () {
                                            return false;
                                        },
                                    },
                                },
                                then: {
                                    '@func': {
                                        args: [1],
                                        code: function (this: any, a: number) {
                                            this.r = a + this.v;
                                        },
                                    },
                                },
                                else: {
                                    '@func': {
                                        args: [2],
                                        code: function (this: any, a: number) {
                                            this.r = a + this.v;
                                        },
                                    },
                                },
                            },
                        },
                        '= this.r',
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = await engine.invoke();

            assert.equal(result, 2 + 5);
        });

        it('should run blocks', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    v: 5,
                    s: 1,
                    args: [
                        {
                            '@if': {
                                condition: {
                                    '@func': {
                                        code: function () {
                                            return false;
                                        },
                                    },
                                },
                                then: {
                                    '@func': {
                                        args: [1],
                                        code: function (this: any, a: number) {
                                            this.s = a + this.v;
                                        },
                                    },
                                },
                                else: {
                                    '@block': [
                                        {
                                            '@func': {
                                                args: [2],
                                                code: async function (this: any, a: number) {
                                                    await promiseHelpers.delay(100);
                                                    this.s = 40 + a;
                                                },
                                            },
                                        },
                                        function (this: any) {
                                            return this.s;
                                        },
                                    ],
                                },
                            },
                        },
                        '= this.s',
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = await engine.invoke();

            assert.equal(result, 42);
        });

        it('then should be a block', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    v: 5,
                    args: [
                        {
                            '@if': {
                                condition: '= this.v == 5',
                                then: [
                                    5,
                                    async function (this: any) {
                                        await promiseHelpers.delay(100);
                                        this.v = 7;
                                    },
                                    '= this.v',
                                ],
                            },
                        },
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = await engine.invoke();

            assert.equal(7, result);
        });

        it('else should be a block', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    v: 1,
                    args: [
                        {
                            '@if': {
                                condition: '= this.v == 5',
                                then: [1, 2],
                                else: [
                                    5,
                                    function (this: any) {
                                        this.v = 7;
                                    },
                                    '= this.v',
                                ],
                            },
                        },
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = await engine.invoke();

            assert.equal(7, result);
        });
    });

    describe('Switch', () => {
        describe('switch w/ case', () => {
            it('should work w/o default', async () => {
                const engine = new ActivityExecutionEngine(
                    await activityMarkup.parse({
                        '@switch': {
                            expression: '= 42',
                            args: [
                                {
                                    '@case': {
                                        value: 43,
                                        args: function () {
                                            return '55';
                                        },
                                    },
                                },
                                {
                                    '@case': {
                                        value: 42,
                                        args: function () {
                                            return 'hi';
                                        },
                                    },
                                },
                                {
                                    '@case': {
                                        value: '42',
                                        args: "= 'boo'",
                                    },
                                },
                            ],
                        },
                    }),
                );

                const result = await engine.invoke();

                assert.deepEqual(result, 'hi');
            });

            it('should work w default', async () => {
                const engine = new ActivityExecutionEngine(
                    await activityMarkup.parse({
                        '@switch': {
                            expression: '= 43',
                            args: [
                                {
                                    '@case': {
                                        value: 43,
                                        args: function () {
                                            return 55;
                                        },
                                    },
                                },
                                {
                                    '@case': {
                                        value: 42,
                                        args: function () {
                                            return 'hi';
                                        },
                                    },
                                },
                                {
                                    '@default': "= 'boo'",
                                },
                            ],
                        },
                    }),
                );

                const result = await engine.invoke();

                assert.deepEqual(result, 55);
            });

            it('should do its default', async () => {
                const engine = new ActivityExecutionEngine(
                    await activityMarkup.parse({
                        '@switch': {
                            expression: "= 'klow'",
                            args: [
                                {
                                    '@case': {
                                        value: 43,
                                        args: function () {
                                            return 55;
                                        },
                                    },
                                },
                                {
                                    '@case': {
                                        value: 42,
                                        args: function () {
                                            return 'hi';
                                        },
                                    },
                                },
                                {
                                    '@default': "= 'boo'",
                                },
                            ],
                        },
                    }),
                );

                const result = await engine.invoke();

                assert.deepEqual(result, 'boo');
            });
        });

        describe('switch w/ when', () => {
            it('should work w/o default', async () => {
                const engine = new ActivityExecutionEngine(
                    await activityMarkup.parse({
                        '@switch': {
                            args: [
                                {
                                    '@when': {
                                        condition: 0,
                                        args: function () {
                                            return '55';
                                        },
                                    },
                                },
                                {
                                    '@when': {
                                        condition: async function () {
                                            return 42;
                                        },
                                        args: function () {
                                            return 'hi';
                                        },
                                    },
                                },
                                {
                                    '@when': {
                                        condition: '42',
                                        args: "= 'boo'",
                                    },
                                },
                            ],
                        },
                    }),
                );

                const result = await engine.invoke();

                assert.deepEqual(result, 'hi');
            });

            it('should work w default', async () => {
                const engine = new ActivityExecutionEngine(
                    await activityMarkup.parse({
                        '@switch': {
                            args: [
                                {
                                    '@when': {
                                        condition: 43,
                                        args: function () {
                                            return 55;
                                        },
                                    },
                                },
                                {
                                    '@when': {
                                        condition: undefined,
                                        args: function () {
                                            return 'hi';
                                        },
                                    },
                                },
                                {
                                    '@default': "= 'boo'",
                                },
                            ],
                        },
                    }),
                );

                const result = await engine.invoke();

                assert.deepEqual(result, 55);
            });

            it('should do its default', async () => {
                const engine = new ActivityExecutionEngine(
                    await activityMarkup.parse({
                        '@switch': {
                            args: [
                                {
                                    '@when': {
                                        condition: '',
                                        args: function () {
                                            return 55;
                                        },
                                    },
                                },
                                {
                                    '@when': {
                                        condition: null,
                                        args: function () {
                                            return 'hi';
                                        },
                                    },
                                },
                                {
                                    '@default': "= 'boo'",
                                },
                            ],
                        },
                    }),
                );

                const result = await engine.invoke();

                assert.deepEqual(result, 'boo');
            });
        });
    });
});
