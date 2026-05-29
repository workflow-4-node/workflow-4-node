import { ActivityExecutionEngine, activityMarkup, promiseHelpers } from '../../src/index.js';
import assert from 'assert';

describe('Exceptions', () => {
    describe('Throw', () => {
        it('should throw errors', async () => {
            const engine = new ActivityExecutionEngine({
                '@block': {
                    args: [
                        {
                            '@throw': {
                                error: function () {
                                    return new TypeError('foo');
                                },
                            },
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e: any) {
                assert(e instanceof TypeError);
                assert(e.message === 'foo');
            }
        });

        it('should throw strings as errors', async () => {
            const engine = new ActivityExecutionEngine({
                '@block': {
                    args: [
                        {
                            '@throw': {
                                error: 'foo',
                            },
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e: any) {
                assert(e instanceof Error);
                assert(e.message === 'foo');
            }
        });
    });

    describe('Try', () => {
        it('should catch code errors', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    r: null,
                    f: null,
                    tr: null,
                    args: [
                        {
                            '@try': {
                                '@to': 'tr',
                                args: [
                                    function () {
                                        throw new Error('foo');
                                    },
                                ],
                                catch: [
                                    {
                                        '@assign': {
                                            to: 'r',
                                            value: '= this.e',
                                        },
                                    },
                                    55,
                                ],
                                finally: {
                                    '@assign': {
                                        to: 'f',
                                        value: 'OK',
                                    },
                                },
                            },
                        },
                        '= {r: this.r, f: this.f, tr: this.tr }',
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(result !== null && typeof result === 'object');
            assert(result.r instanceof Error && result.r.message === 'foo');
            assert(result.tr === 55);
            assert(result.f === 'OK');
        });

        it('should catch Throw errors', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    r: null,
                    f: null,
                    tr: null,
                    OK: 'OK',
                    args: [
                        {
                            '@try': {
                                '@to': 'tr',
                                args: [
                                    {
                                        '@throw': {
                                            error: 'foo',
                                        },
                                    },
                                ],
                                catch: [
                                    {
                                        '@assign': {
                                            to: 'r',
                                            value: '= this.e',
                                        },
                                    },
                                    55,
                                ],
                                finally: [
                                    {
                                        '@assign': {
                                            to: 'f',
                                            value: '= this.OK',
                                        },
                                    },
                                ],
                            },
                        },
                        '= {r: this.r, f: this.f, tr: this.tr }',
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(result !== null && typeof result === 'object');
            assert(result.r instanceof Error && result.r.message === 'foo');
            assert(result.tr === 55);
            assert(result.f === 'OK');
        });

        it('should throw errors when there is finally only', async () => {
            let x: string | null = null;

            const engine = new ActivityExecutionEngine({
                '@block': {
                    args: [
                        {
                            '@try': {
                                args: [
                                    {
                                        '@throw': {
                                            error: 'foo',
                                        },
                                    },
                                ],
                                finally: function (this: any) {
                                    x = 'OK';
                                },
                            },
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e: any) {
                assert(e instanceof Error);
                assert(e.message === 'foo');
                assert(x === 'OK');
            }
        });

        it('should rethrow current error', async () => {
            let ge: unknown = null;
            let gf: string | null = null;

            const engine = new ActivityExecutionEngine({
                '@block': {
                    args: [
                        {
                            '@try': {
                                args: [
                                    {
                                        '@throw': {
                                            error: 'foo',
                                        },
                                    },
                                ],
                                catch: [
                                    function (this: any) {
                                        ge = this.e;
                                    },
                                    {
                                        '@throw': {},
                                    },
                                ],
                                finally: function (this: any) {
                                    gf = 'OK';
                                },
                            },
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e: any) {
                assert(e instanceof Error);
                assert(e.message === 'foo');
                assert(ge === e);
                assert(gf === 'OK');
            }
        });

        it('should rethrow a new error', async () => {
            let ge: unknown = null;
            let gf: string | null = null;

            const engine = new ActivityExecutionEngine({
                '@block': {
                    args: [
                        {
                            '@try': {
                                args: [
                                    {
                                        '@throw': {
                                            error: 'foo',
                                        },
                                    },
                                ],
                                catch: [
                                    function (this: any) {
                                        ge = this.e;
                                    },
                                    {
                                        '@throw': {
                                            error: "= this.e.message + 'pupu'",
                                        },
                                    },
                                ],
                                finally: function (this: any) {
                                    gf = 'OK';
                                },
                            },
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e: any) {
                assert(e instanceof Error);
                assert(e.message === 'foopupu');
                assert(ge instanceof Error && ge.message === 'foo');
                assert(gf === 'OK');
            }
        });

        it('should catch a rethrown error in a custom varname', async () => {
            let ge: unknown = null;
            let gf: string | null = null;

            const engine = new ActivityExecutionEngine({
                '@block': {
                    args: [
                        {
                            '@try': {
                                varName: 'err',
                                args: {
                                    '@try': {
                                        args: [
                                            {
                                                '@throw': {
                                                    error: 'foo',
                                                },
                                            },
                                        ],
                                        catch: [
                                            function (this: any) {
                                                ge = this.e;
                                            },
                                            {
                                                '@throw': {
                                                    error: "= this.e.message + 'pupu'",
                                                },
                                            },
                                        ],
                                        finally: function (this: any) {
                                            gf = 'OK';
                                        },
                                    },
                                },
                                catch: ['= this.err'],
                            },
                        },
                    ],
                },
            });

            const e: any = await engine.invoke();

            assert(e instanceof Error);
            assert(e.message === 'foopupu');
            assert(ge instanceof Error && ge.message === 'foo');
            assert(gf === 'OK');
        });
    });

    describe('behavior', () => {
        it('should cancel other branches', async () => {
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
                                {
                                    '@throw': {
                                        error: 'foo',
                                    },
                                },
                            ],
                        },
                        {
                            '@block': [
                                async function () {
                                    await promiseHelpers.delay(50);
                                },
                                {
                                    '@throw': {
                                        error: 'boo',
                                    },
                                },
                            ],
                        },
                    ],
                },
            });

            try {
                await engine.invoke();
                assert.fail('Should have thrown');
            } catch (e: any) {
                assert(e.message === 'boo');
                assert(!x);
            }
        });
    });
});
