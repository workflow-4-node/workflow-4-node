import { ActivityExecutionEngine, activityMarkup, promiseHelpers } from '../../src/index.js';
import assert from 'assert';

describe('Logic Operators', () => {
    describe('Truthy', () => {
        it('should work', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@block': {
                        t1: {
                            '@truthy': {
                                value: 'a',
                            },
                        },
                        t2: {
                            '@truthy': {
                                value: null,
                            },
                        },
                        t3: {
                            '@truthy': {
                                value: true,
                                is: 'is',
                                isNot: 'isNot',
                            },
                        },
                        t4: {
                            '@truthy': {
                                value: null,
                                is: 'is',
                                isNot: {
                                    '@func': {
                                        code: () => 'isNot',
                                    },
                                },
                            },
                        },
                        args: [['= this.t1', '= this.t2', '= this.t3', '= this.t4']],
                    },
                }),
            );

            const result = await engine.invoke();

            assert.ok(Array.isArray(result));
            assert.equal(result[0], true);
            assert.equal(result[1], false);
            assert.equal(result[2], 'is');
            assert.equal(result[3], 'isNot');
        });
    });

    describe('Falsy', () => {
        it('should work', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@block': {
                        t1: {
                            '@falsy': {
                                value: 'a',
                            },
                        },
                        t2: {
                            '@falsy': {
                                value: null,
                            },
                        },
                        t3: {
                            '@falsy': {
                                value: true,
                                is: 'is',
                                isNot: 'isNot',
                            },
                        },
                        t4: {
                            '@falsy': {
                                value: null,
                                is: "= 'is'",
                                isNot: {
                                    '@func': {
                                        code: () => 'isNot',
                                    },
                                },
                            },
                        },
                        args: [['= this.t1', '= this.t2', '= this.t3', '= this.t4']],
                    },
                }),
            );

            const result = await engine.invoke();

            assert.ok(Array.isArray(result));
            assert.equal(result[0], false);
            assert.equal(result[1], true);
            assert.equal(result[2], 'isNot');
            assert.equal(result[3], 'is');
        });
    });

    describe('Equals', () => {
        it('should work', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@block': {
                        a: {
                            '@equals': {
                                value: () => 42,
                                to: '= 40 + 2',
                                is: () => '42',
                                isNot: 'aba',
                            },
                        },
                        b: {
                            '@equals': {
                                value: () => 42,
                                to: '= 40 + 1',
                                is: () => '42',
                                isNot: 'aba',
                            },
                        },
                        args: {
                            a: '= this.a',
                            b: '= this.b',
                        },
                    },
                }),
            );

            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(result && typeof result === 'object');
            assert.equal(result.a, '42');
            assert.equal(result.b, 'aba');
        });
    });

    describe('NotEquals', () => {
        it('should work', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@block': {
                        a: {
                            '@notEquals': {
                                value: () => 42,
                                to: '= 40 + 2',
                                is: () => '42',
                                isNot: 'aba',
                            },
                        },
                        b: {
                            '@notEquals': {
                                value: () => 42,
                                to: '= 40 + 1',
                                is: () => '42',
                                isNot: 'aba',
                            },
                        },
                        args: {
                            a: '= this.a',
                            b: '= this.b',
                        },
                    },
                }),
            );

            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(result && typeof result === 'object');
            assert.equal(result.a, 'aba');
            assert.equal(result.b, '42');
        });
    });

    describe('Not, And, Or', () => {
        it('should work', async () => {
            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@block': {
                        a: {
                            '@and': [
                                true,
                                'bubu',
                                {
                                    '@or': ['= true', false],
                                },
                                {
                                    '@not': [
                                        {
                                            '@and': [true, () => null],
                                        },
                                    ],
                                },
                            ],
                        },
                        b: {
                            '@and': {
                                args: [
                                    {
                                        '@or': ['= true', false],
                                    },
                                    {
                                        '@not': [
                                            {
                                                '@and': [true, '= [ 42 ]'],
                                            },
                                        ],
                                    },
                                ],
                                // isFalse returns a promise that resolves to 42
                                isFalse: async () => {
                                    await promiseHelpers.delay(100);
                                    return 42;
                                },
                            },
                        },
                        args: {
                            a: '= this.a',
                            b: '= this.b',
                        },
                    },
                }),
            );

            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(result && typeof result === 'object');
            assert.equal(result.a, true);
            assert.equal(result.b, 42);
        });
    });
});
