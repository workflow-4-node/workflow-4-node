import { ActivityExecutionEngine, For, Func } from '../../src/index.js';
import assert from 'assert';

describe('For', () => {
    it('should work between range 0 and 10 by step 1', async () => {
        const f = new For();
        f.from = 0;
        f.to = new Func();
        (f.to as Func).code = async () => 10;
        const bodyFunc = new Func();
        const values: string[] = [];
        bodyFunc.code = function () {
            values.push(String((this as any).i));
        };
        f.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(f);
        await engine.invoke();

        assert.equal(values.join(''), '0123456789');
    });

    it('should work between range 10 downto 4 by step -2', async () => {
        const f = new For();
        f.from = 10;
        f.to = new Func();
        (f.to as Func).code = async () => 4;
        f.step = -2;
        f.varName = 'klow';
        const values: number[] = [];
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            values.push((this as any).klow);
        };
        f.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(f);
        await engine.invoke();

        assert.equal(values.join(''), '1086');
    });

    it('should complete when values are null', async () => {
        const f = new For();

        const engine = new ActivityExecutionEngine(f);
        const result = await engine.invoke();

        assert.equal(result, undefined);
    });

    it('should fail when from is not a number', async () => {
        const f = new For();
        f.from = 'not-a-number';
        f.to = 10;
        f.step = 1;
        const bodyFunc = new Func();
        bodyFunc.code = () => {};
        f.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(f);
        await assert.rejects(engine.invoke(), (err: unknown) => {
            assert(err instanceof Error);
            assert.match(err.message, /not a number/);
            return true;
        });
    });

    it('should fail when to is not a number', async () => {
        const f = new For();
        f.from = 0;
        f.to = 'not-a-number';
        f.step = 1;
        const bodyFunc = new Func();
        bodyFunc.code = () => {};
        f.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(f);
        await assert.rejects(engine.invoke(), (err: unknown) => {
            assert(err instanceof Error);
            assert.match(err.message, /not a number/);
            return true;
        });
    });

    it('should fail when step is not a number', async () => {
        const f = new For();
        f.from = 0;
        f.to = 10;
        f.step = 'not-a-number';
        const bodyFunc = new Func();
        bodyFunc.code = () => {};
        f.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(f);
        await assert.rejects(engine.invoke(), (err: unknown) => {
            assert(err instanceof Error);
            assert.match(err.message, /not a number/);
            return true;
        });
    });

    it('should run twice', async () => {
        const f = new For();
        f.from = 0;
        f.to = 3;
        f.step = 1;
        const values: string[] = [];
        const bodyFunc = new Func();
        bodyFunc.code = function () {
            values.push(String((this as any).i));
        };
        f.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(f);
        await engine.invoke();
        assert.equal(values.join(''), '012');

        // Second run with same engine should restart
        values.length = 0;
        await engine.invoke();
        assert.equal(values.join(''), '012');
    });
});
