import { ActivityExecutionEngine, ForEach, Func } from '../../src/index.js';
import assert from 'assert';

describe('ForEach', () => {
    it('should work non parallel', async () => {
        const fe = new ForEach();
        fe.items = [1, 2, 3];
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            return (this as any).item * 10;
        };
        fe.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(fe);
        const result = await engine.invoke();

        // Returns the last iteration's result
        assert.equal(result, 30);
    });

    it('should work with a single item', async () => {
        const fe = new ForEach();
        fe.items = [42];
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            return (this as any).item;
        };
        fe.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(fe);
        const result = await engine.invoke();

        assert.equal(result, 42);
    });

    it('should work with a single non-array item', async () => {
        const fe = new ForEach();
        fe.items = 42;
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            return (this as any).item;
        };
        fe.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(fe);
        const result = await engine.invoke();

        assert.equal(result, 42);
    });

    it('should work with custom varName', async () => {
        const fe = new ForEach();
        fe.items = [10, 20, 30];
        fe.varName = 'klow';
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            return (this as any).klow;
        };
        fe.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(fe);
        const result = await engine.invoke();

        assert.equal(result, 30);
    });

    it('should complete when items is null', async () => {
        const fe = new ForEach();

        const engine = new ActivityExecutionEngine(fe);
        const result = await engine.invoke();

        assert.equal(result, undefined);
    });

    it('should work with an empty array', async () => {
        const fe = new ForEach();
        fe.items = [];
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            return (this as any).item;
        };
        fe.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(fe);
        const result = await engine.invoke();

        assert.equal(result, undefined);
    });

    it('should run twice', async () => {
        const fe = new ForEach();
        fe.items = ['a', 'b'];
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            return (this as any).item;
        };
        fe.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(fe);
        const r1 = await engine.invoke();
        assert.equal(r1, 'b');

        const r2 = await engine.invoke();
        assert.equal(r2, 'b');
    });
});
