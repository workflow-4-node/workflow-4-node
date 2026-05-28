import { ActivityExecutionEngine } from '../../src/index.js';
import assert from 'assert';

describe('Template', () => {
    it('should parse object correctly', async () => {
        const dec = {
            a: 'foo',
            b: [
                'zoo',
                {
                    c: {
                        '@func': {
                            code: function () {
                                return 6;
                            },
                        },
                    },
                },
                '= 42',
            ],
        };
        const engine = new ActivityExecutionEngine({
            '@template': {
                declare: dec,
            },
        });

        const result = (await engine.invoke()) as Record<string, any>;

        assert.ok(typeof result === 'object' && result !== null && !Array.isArray(result));
        assert.notEqual(result, dec);
        assert.equal(result.a, 'foo');
        assert.ok(Array.isArray(result.b));
        assert.equal(result.b.length, 3);
        assert.equal(result.b[0], 'zoo');
        assert.ok(typeof result.b[1] === 'object' && result.b[1] !== null && !Array.isArray(result.b[1]));
        assert.equal(result.b[1].c, 6);
        assert.equal(result.b[2], 42);
    });

    it('should work when specialized', async () => {
        const engine = new ActivityExecutionEngine({
            '@block': [
                {
                    a: 'foo',
                    b: [
                        'zoo',
                        {
                            c: {
                                '@func': {
                                    code: function () {
                                        return 6;
                                    },
                                },
                            },
                        },
                        '= 42',
                    ],
                },
            ],
        });

        const result = (await engine.invoke()) as Record<string, any>;

        assert.ok(typeof result === 'object' && result !== null && !Array.isArray(result));
        assert.equal(result.a, 'foo');
        assert.ok(Array.isArray(result.b));
        assert.equal(result.b.length, 3);
        assert.equal(result.b[0], 'zoo');
        assert.ok(typeof result.b[1] === 'object' && result.b[1] !== null && !Array.isArray(result.b[1]));
        assert.equal(result.b[1].c, 6);
        assert.equal(result.b[2], 42);
    });

    it('should work on arrays', async () => {
        const arr = [
            {
                $project: {
                    $literal: '= this.rule.value',
                },
            },
        ];
        const engine = new ActivityExecutionEngine({
            '@block': {
                rule: {
                    value: 22,
                },
                args: [
                    {
                        '@block': {
                            a: arr,
                            args: ['= this.a'],
                        },
                    },
                ],
            },
        });

        const result = (await engine.invoke()) as any[];

        assert.ok(Array.isArray(result));
        assert.notEqual(result, arr);
        assert.ok(typeof result[0].$project === 'object');
        assert.equal(result[0].$project.$literal, 22);
    });

    it('should ignore escaped markup', async () => {
        const engine = new ActivityExecutionEngine({
            '@block': {
                id: 'poo',
                stuff: {
                    _: {
                        sayHello: function (name: string) {
                            return 'Hello, ' + name + '!';
                        },
                    },
                },
                args: [
                    {
                        '@func': {
                            args: ' = this.poo.stuff.sayHello',
                            code: function (this: any, f: (...args: unknown[]) => unknown) {
                                return f('Gabor');
                            },
                        },
                    },
                ],
            },
        });

        const result = await engine.invoke();

        assert.equal(result, 'Hello, Gabor!');
    });

    it('should create cloned objects', async () => {
        const obj2 = { foo: 'bar' };
        const obj = { baz: obj2 };
        const engine = new ActivityExecutionEngine({
            '@block': {
                obj: obj,
                args: ['= this.obj'],
            },
        });

        const result = (await engine.invoke()) as Record<string, any>;

        assert.ok(typeof result === 'object');
        assert.notEqual(result, obj);
        assert.equal(result.baz.foo, 'bar');
    });

    it('should create cloned arrays', async () => {
        const obj2 = { foo: 'bar' };
        const obj = { baz: obj2 };
        const arr = [obj];
        const engine = new ActivityExecutionEngine({
            '@block': {
                arr: arr,
                args: ['= this.arr'],
            },
        });

        const result = (await engine.invoke()) as any[];

        assert.ok(Array.isArray(result));
        assert.equal(result.length, 1);
        assert.notEqual(result, arr);
        assert.notEqual(result[0], obj);
        assert.equal(result[0].baz.foo, 'bar');
    });
});
