import { ActivityExecutionEngine, activityMarkup } from '../../src/index.js';
import { TestTracker } from './runtime/TestTracker.js';
import assert from 'assert';

describe('Tracker', () => {
    it('should collect state changes from a complex workflow', async () => {
        const engine = new ActivityExecutionEngine(
            await activityMarkup.parse({
                '@block': {
                    items: [],
                    args: [
                        {
                            '@emit': ['start'],
                        },
                        {
                            '@parallel': {
                                args: [
                                    {
                                        '@func': {
                                            code: function () {
                                                (this as any).items.push('a');
                                                return 'a';
                                            },
                                        },
                                    },
                                    {
                                        '@func': {
                                            code: function () {
                                                (this as any).items.push('b');
                                                return 'b';
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            '@if': {
                                value: '= 1 + 1',
                                is: 2,
                                then: {
                                    '@block': [{ '@emit': ['then-branch'] }],
                                },
                                else: {
                                    '@emit': ['else-branch'],
                                },
                            },
                        },
                        {
                            '@emit': ['done', '= 40 + 2'],
                        },
                        '= this.items',
                    ],
                },
            }),
        );

        const tracker = new TestTracker();
        engine.addTracker(tracker);

        const result = await engine.invoke();

        assert.deepEqual(result, ['a', 'b']);

        assert.equal(tracker.entries.length, 18);
        assert.deepStrictEqual(tracker.entries, [
            { name: tracker.entries[0].name, reason: 'run', result: '' },
            { name: tracker.entries[1].name, reason: 'run', result: '' },
            { name: tracker.entries[2].name, reason: 'complete', result: '' },
            { name: tracker.entries[3].name, reason: 'run', result: '' },
            { name: tracker.entries[4].name, reason: 'run', result: '' },
            { name: tracker.entries[5].name, reason: 'run', result: '' },
            { name: tracker.entries[6].name, reason: 'complete', result: 'a' },
            { name: tracker.entries[7].name, reason: 'complete', result: 'b' },
            { name: tracker.entries[8].name, reason: 'complete', result: "[ 'a', 'b' ]" },
            { name: tracker.entries[9].name, reason: 'run', result: '' },
            { name: tracker.entries[10].name, reason: 'complete', result: '' },
            { name: tracker.entries[11].name, reason: 'run', result: '' },
            { name: tracker.entries[12].name, reason: 'run', result: '' },
            { name: tracker.entries[13].name, reason: 'complete', result: '42' },
            { name: tracker.entries[14].name, reason: 'complete', result: '' },
            { name: tracker.entries[15].name, reason: 'run', result: '' },
            { name: tracker.entries[16].name, reason: 'complete', result: "[ 'a', 'b' ]" },
            { name: tracker.entries[17].name, reason: 'complete', result: "[ 'a', 'b' ]" },
        ]);

        // Verify activity type order by parsing the "(TypeName:...)" pattern
        const typeNames = tracker.entries.map((e) => /^\(([^:]+):/.exec(e.name)?.[1]);
        assert.deepEqual(typeNames, [
            'Block',
            'Emit',
            'Emit',
            'Parallel',
            'Func',
            'Func',
            'Func',
            'Func',
            'Parallel',
            'If',
            'If',
            'Emit',
            'Expression',
            'Expression',
            'Emit',
            'Expression',
            'Expression',
            'Block',
        ]);
    });
});
