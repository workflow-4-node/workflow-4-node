import { ActivityExecutionEngine, CancelledError, activityMarkup, promiseHelpers } from '../../src/index.js';
import assert from 'assert';

describe('Cancellation', () => {
    describe('Cancel', () => {
        it('when force is set then it should cancel other branches', async () => {
            let x = false;

            const engine = new ActivityExecutionEngine({
                '@parallel': {
                    args: [
                        async function () {
                            await promiseHelpers.delay(200);
                            throw new Error('b+');
                        },
                        {
                            '@block': [
                                async function () {
                                    await promiseHelpers.delay(200);
                                },
                                function (this: any) {
                                    x = true;
                                },
                            ],
                        },
                        {
                            '@block': [
                                async function () {
                                    await promiseHelpers.delay(100);
                                },
                                async function () {
                                    throw new Error('foo');
                                },
                            ],
                        },
                        {
                            '@block': [
                                async function () {
                                    await promiseHelpers.delay(50);
                                },
                                { '@cancel': { force: true } },
                            ],
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e) {
                assert(e instanceof CancelledError);
                assert(!x);
            }
        });

        it('when not force it should run other branches before terminating', async () => {
            let x = 0;
            let y = 0;

            const engine = new ActivityExecutionEngine({
                '@block': {
                    args: [
                        {
                            '@parallel': [
                                function () {
                                    x++;
                                },
                                { '@cancel': {} },
                            ],
                        },
                        function () {
                            y++;
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e) {
                assert(e instanceof CancelledError);
                assert(x === 1);
                assert(!y);
            }
        });
    });

    describe('CancellationScope', () => {
        it('when force is set then it should cancel other branches, and handled in scope', async () => {
            let x = false;
            let y = false;

            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@cancellationScope': {
                        args: {
                            '@parallel': {
                                args: [
                                    async function () {
                                        await promiseHelpers.delay(200);
                                        throw new Error('b+');
                                    },
                                    {
                                        '@block': [
                                            async function () {
                                                await promiseHelpers.delay(200);
                                            },
                                            function (this: any) {
                                                x = true;
                                            },
                                        ],
                                    },
                                    {
                                        '@block': [
                                            async function () {
                                                await promiseHelpers.delay(100);
                                            },
                                            async function () {
                                                throw new Error('foo');
                                            },
                                        ],
                                    },
                                    {
                                        '@block': [
                                            async function () {
                                                await promiseHelpers.delay(50);
                                            },
                                            { '@cancel': { force: true } },
                                        ],
                                    },
                                ],
                            },
                        },
                        cancelled: [
                            function (this: any) {
                                y = true;
                            },
                        ],
                    },
                }),
            );

            await engine.invoke();

            assert(!x);
            assert(y);
        });

        it('when not force it should run other branches before terminating', async () => {
            let x = 0;
            let y = 0;
            let z = false;

            const engine = new ActivityExecutionEngine(
                await activityMarkup.parse({
                    '@cancellationScope': {
                        args: {
                            '@block': {
                                args: [
                                    {
                                        '@parallel': [
                                            function () {
                                                x++;
                                            },
                                            { '@cancel': {} },
                                        ],
                                    },
                                    function () {
                                        y++;
                                    },
                                ],
                            },
                        },
                        cancelled: function (this: any) {
                            z = true;
                        },
                    },
                }),
            );

            await engine.invoke();

            assert(x === 1);
            assert(!y);
            assert(z);
        });
    });
});
