import { ActivityExecutionEngine, CustomActivity, Func, Block, Expression, activityMarkup } from '../../src/index.js';
import type { Activity } from '../../src/activities/Activity.js';
import type { ActivityExecutionContext } from '../../src/activities/runtime/ActivityExecutionContext.js';
import assert from 'assert';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('CustomActivity', () => {
    it('should run a custom activity created programmatically', async () => {
        class Doubler extends CustomActivity {
            value: number | null = null;

            protected async createImplementation(_execContext: ActivityExecutionContext): Promise<Activity | Record<string, unknown>> {
                const f = new Func();
                f.code = function (this: any) {
                    const v = this.value;
                    return v !== null ? v * 2 : undefined;
                };
                return f;
            }
        }

        const d = new Doubler();
        d.value = 21;

        const engine = new ActivityExecutionEngine(d);
        const result = await engine.invoke();

        assert.equal(result, 42);
    });

    it('should inherit scope variables from the parent', async () => {
        class Greeter extends CustomActivity {
            protected async createImplementation(_execContext: ActivityExecutionContext): Promise<Activity | Record<string, unknown>> {
                const block = new Block();
                (block as any).greeting = new Expression('this.name');
                const bodyFunc = new Func();
                bodyFunc.code = function (this: any) {
                    return `Hi ${this.greeting}!`;
                };
                block.args = [bodyFunc];
                return block;
            }
        }

        const g = new Greeter();
        (g as any).name = 'World';

        const engine = new ActivityExecutionEngine(g);
        const result = await engine.invoke();

        assert.equal(result, 'Hi World!');
    });

    it('should take arguments with same name as in outer scope', async () => {
        const activity = await activityMarkup.parse({
            '@import': path.join(__dirname, 'customActivities', 'Hello.ts'),
            '@block': {
                to: 'unbornchikken',
                args: {
                    '@hello': {
                        to: '= this.to',
                    },
                },
            },
        });

        const engine = new ActivityExecutionEngine(activity);
        const result = await engine.invoke();

        assert.equal(result, 'Hello unbornchikken!');
    });
});
