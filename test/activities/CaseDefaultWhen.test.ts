import { ActivityExecutionEngine, Case, Default, When, Func, Expression, constants } from '../../src/index.js';
import assert from 'assert';

describe('Case', () => {
    it('should run the body when value matches expression', async () => {
        const c = new Case();
        c.value = 42;
        c.expression = 42;
        const bodyFunc = new Func();
        bodyFunc.code = () => 'matched';
        c.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(c);
        const result = await engine.invoke();

        assert.equal(result, 'matched');
    });

    it('should complete with nope when value does not match expression', async () => {
        const c = new Case();
        c.value = 1;
        c.expression = 2;

        const engine = new ActivityExecutionEngine(c);
        const result = await engine.invoke();

        assert.equal(result, constants.markers.nope);
    });

    it('should work with activity as value', async () => {
        const c = new Case();
        c.value = new Func();
        (c.value as Func).code = () => 42;
        c.expression = 42;
        const bodyFunc = new Func();
        bodyFunc.code = () => 'matched';
        c.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(c);
        const result = await engine.invoke();

        assert.equal(result, 'matched');
    });
});

describe('Default', () => {
    it('should run body when args are present', async () => {
        const d = new Default();
        const bodyFunc = new Func();
        bodyFunc.code = () => 'default result';
        d.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(d);
        const result = await engine.invoke();

        assert.equal(result, 'default result');
    });

    it('should complete with undefined when no body', async () => {
        const d = new Default();

        const engine = new ActivityExecutionEngine(d);
        const result = await engine.invoke();

        assert.equal(result, undefined);
    });
});

describe('When', () => {
    it('should run the body when condition is truthy', async () => {
        const w = new When();
        w.condition = new Expression('true');
        const bodyFunc = new Func();
        bodyFunc.code = () => 'ran';
        w.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        assert.equal(result, 'ran');
    });

    it('should complete with nope when condition is falsy', async () => {
        const w = new When();
        w.condition = new Expression('false');

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        assert.equal(result, constants.markers.nope);
    });

    it('should work with activity as condition', async () => {
        const w = new When();
        w.condition = new Func();
        (w.condition as Func).code = () => true;
        const bodyFunc = new Func();
        bodyFunc.code = () => 'ran';
        w.args = [bodyFunc];

        const engine = new ActivityExecutionEngine(w);
        const result = await engine.invoke();

        assert.equal(result, 'ran');
    });
});
