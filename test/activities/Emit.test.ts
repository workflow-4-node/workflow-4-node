import { ActivityExecutionEngine, activityMarkup } from '../../src/index.js';
import assert from 'assert';

describe('Emit', () => {
    it('should emit a workflow event with the resolved args', async () => {
        const engine = new ActivityExecutionEngine(
            await activityMarkup.parse({
                '@emit': ['hello', 42],
            }),
        );

        const events: unknown[][] = [];
        engine.on('workflowEvent', (args: unknown[]) => {
            events.push(args);
        });

        const result = await engine.invoke();

        assert.strictEqual(result, undefined);
        assert.equal(events.length, 1);
        assert.deepEqual(events[0], ['hello', 42]);
    });

    it('should emit multiple events in sequence from a block', async () => {
        const engine = new ActivityExecutionEngine(
            await activityMarkup.parse({
                '@block': [{ '@emit': ['first'] }, { '@emit': ['second', 2] }, { '@emit': ['third', true, { n: 42 }] }],
            }),
        );

        const events: unknown[][] = [];
        engine.on('workflowEvent', (args: unknown[]) => {
            events.push(args);
        });

        const result = await engine.invoke();

        assert.strictEqual(result, undefined);
        assert.equal(events.length, 3);
        assert.deepEqual(events[0], ['first']);
        assert.deepEqual(events[1], ['second', 2]);
        assert.deepEqual(events[2], ['third', true, { n: 42 }]);
    });
});
