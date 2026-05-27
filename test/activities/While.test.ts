import { ActivityExecutionEngine, While, Func } from '../../src/index.js';
import assert from 'assert';

describe('While', () => {
    it('should loop until condition is false', async () => {
        let counter = 0;
        const w = new While();
        w.condition = new Func();
        (w.condition as Func).code = () => {
            counter++;
            return counter <= 3;
        };
        const bodyFunc = new Func();
        bodyFunc.code = () => counter;
        w.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        // Body ran 3 times, last body result = 3
        assert.equal(result, 3);
    });

    it('should complete when condition is falsy initially', async () => {
        let callCount = 0;
        const w = new While();
        w.condition = new Func();
        (w.condition as Func).code = () => {
            callCount++;
            return false;
        };
        const bodyFunc = new Func();
        bodyFunc.code = () => 'body';

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        assert.equal(callCount, 1);
        assert.equal(result, undefined);
    });

    it('should complete when condition is null', async () => {
        const w = new While();

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        assert.equal(result, undefined);
    });

    it('should not throw when there is no body', async () => {
        let callCount = 0;
        const w = new While();
        w.condition = new Func();
        (w.condition as Func).code = () => {
            callCount++;
            return callCount <= 3;
        };

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        assert.equal(callCount, 4);
        assert.equal(result, undefined);
    });

    it('should preserve the last body result', async () => {
        let callCount = 0;
        const w = new While();
        w.condition = new Func();
        (w.condition as Func).code = () => {
            callCount++;
            return callCount <= 3;
        };
        const bodyFunc = new Func();
        bodyFunc.code = () => callCount;
        w.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        // Body ran 3 times with callCount 1, 2, 3. Last result = 3
        assert.equal(result, 3);
    });

    it('should run twice', async () => {
        let callCount = 0;
        const w = new While();
        w.condition = new Func();
        (w.condition as Func).code = () => {
            callCount++;
            return callCount <= 5;
        };
        const bodyFunc = new Func();
        let value = 0;
        bodyFunc.code = () => {
            value++;
            return value;
        };
        w.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(w);
        const r1 = await engine.invoke();
        assert.equal(r1, 5);

        // Second run should restart
        callCount = 0;
        value = 0;
        const r2 = await engine.invoke();
        assert.equal(r2, 5);
    });
});
