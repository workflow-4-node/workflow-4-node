import { ActivityExecutionEngine, promiseHelpers, activityMarkup } from '../../src/index.js';
import assert from 'assert';

describe('Loops', () => {
    describe('While', () => {
        it('should run a basic cycle', async () => {
            const block = await activityMarkup.parse({
                '@block': {
                    i: 10,
                    j: 0,
                    z: 0,
                    args: [
                        {
                            '@while': {
                                condition: '= this.j < this.i',
                                args: '= this.j++',
                                '@to': 'z',
                            },
                        },
                        '= { j: this.j, z: this.z }',
                    ],
                },
            });

            const engine = new ActivityExecutionEngine(block);
            const result = (await engine.invoke()) as Record<string, number>;

            assert.ok(typeof result === 'object' && result !== null);
            assert.equal(result.j, 10);
            assert.equal(result.z, 9);
        });
    });

    describe('For', () => {
        it('should work between range 0 and 10 by step 1', async () => {
            const engine = new ActivityExecutionEngine({
                '@block': {
                    seq: '',
                    args: [
                        {
                            '@for': {
                                from: 0,
                                to: {
                                    '@func': {
                                        code: async function () {
                                            return promiseHelpers.delay(100).then(function () {
                                                return 10;
                                            });
                                        },
                                    },
                                },
                                args: '= this.seq = this.seq + this.i',
                            },
                        },
                        '= this.seq',
                    ],
                },
            });

            const result = await engine.invoke();

            assert.equal(typeof result, 'string');
            assert.equal(result, '0123456789');
        });

        it('should work between range 10 downto 4 by step -2', async () => {
            const engine = new ActivityExecutionEngine({
                '@block': {
                    seq: '',
                    r: null,
                    args: [
                        {
                            '@for': {
                                from: 10,
                                to: {
                                    '@func': {
                                        code: async function () {
                                            return promiseHelpers.delay(100).then(function () {
                                                return 4;
                                            });
                                        },
                                    },
                                },
                                step: -2,
                                varName: 'klow',
                                args: '= this.seq += this.klow',
                                '@to': 'r',
                            },
                        },
                        '= { v: this.seq, r: this.r }',
                    ],
                },
            });

            const result = (await engine.invoke()) as Record<string, unknown>;

            assert.ok(typeof result === 'object' && result !== null);
            assert.equal(result.v, '1086');
            assert.equal(result.r, '1086');
        });
    });

    describe('ForEach', () => {
        it('should work non parallel', async () => {
            const engine = new ActivityExecutionEngine({
                '@block': {
                    seq: {
                        '@func': {
                            code: function () {
                                return [1, 2, 3, 4, 5, 6];
                            },
                        },
                    },
                    result: '',
                    args: [
                        {
                            '@forEach': {
                                items: '= this.seq',
                                args: '= this.result += this.item',
                            },
                        },
                        '= this.result',
                    ],
                },
            });

            const result = await engine.invoke();

            assert.equal(typeof result, 'string');
            assert.equal(result, '123456');
        });

        it('should work with generators non-parallel', async () => {
            const engine = new ActivityExecutionEngine({
                '@block': {
                    result: [],
                    stuff: {
                        val: -1,
                    },
                    args: [
                        {
                            '@forEach': {
                                items: {
                                    '@func': {
                                        args: '= this.stuff',
                                        code: function* (stuff: { val: number }) {
                                            yield -1 * stuff.val;
                                            yield 2;
                                            yield 3;
                                            yield stuff.val;
                                        },
                                    },
                                },
                                args: function (this: any) {
                                    if (this.stuff.val === -1) {
                                        this.stuff.val = 4;
                                    }
                                    this.result.push(this.item);
                                },
                            },
                        },
                        '= this.result',
                    ],
                },
            });

            const result = (await engine.invoke()) as number[];

            assert.ok(Array.isArray(result));
            assert.equal(result.length, 4);
            assert.equal(result[0], 1);
            assert.equal(result[1], 2);
            assert.equal(result[2], 3);
            assert.equal(result[3], 4);
        });
    });
});
