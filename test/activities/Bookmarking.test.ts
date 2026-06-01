import { ActivityExecutionEngine, activityMarkup } from '../../src/index.js';
import assert from 'assert';

describe('bookmarking', () => {
    it('should handle parallel activities', async () => {
        const activity = await activityMarkup.parse({
            '@parallel': {
                var1: '',
                displayName: 'Root',
                args: [
                    {
                        '@block': {
                            displayName: 'Wait Block 1',
                            args: [
                                {
                                    '@waitForBookmark': {
                                        displayName: 'Wait 1',
                                        bookmarkName: 'bm1',
                                    },
                                },
                                {
                                    '@func': {
                                        displayName: 'Func 1',
                                        code: function (this: any) {
                                            return (this.var1 += 'a');
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        '@block': {
                            displayName: 'Wait Block 2',
                            args: [
                                {
                                    '@waitForBookmark': {
                                        displayName: 'Wait 2',
                                        bookmarkName: 'bm2',
                                    },
                                },
                                {
                                    '@func': {
                                        displayName: 'Func 2',
                                        code: function (this: any) {
                                            return (this.var1 += 'b');
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        '@block': {
                            displayName: 'Resume Block',
                            args: [
                                {
                                    '@resumeBookmark': {
                                        displayName: 'Resume 1',
                                        bookmarkName: 'bm1',
                                    },
                                },
                                {
                                    '@resumeBookmark': {
                                        displayName: 'Resume 2',
                                        bookmarkName: 'bm2',
                                    },
                                },
                                'bubu',
                            ],
                        },
                    },
                ],
            },
        });

        const engine = new ActivityExecutionEngine(activity);

        const result = (await engine.invoke()) as unknown[];

        assert.ok(Array.isArray(result));
        assert.equal(result.length, 3);
        assert.equal(result[0], 'a');
        assert.equal(result[1], 'ab');
        assert.equal(result[2], 'bubu');
    });

    it('should handle of picking activities', async () => {
        const activity = await activityMarkup.parse({
            '@block': {
                var1: 0,
                args: [
                    {
                        '@parallel': [
                            {
                                '@pick': [
                                    {
                                        '@block': [
                                            {
                                                '@waitForBookmark': {
                                                    bookmarkName: 'foo',
                                                },
                                            },
                                            {
                                                '@func': {
                                                    displayName: 'Do Not Do This Func',
                                                    code: function (this: any) {
                                                        this.var1 = -1;
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        '@block': [
                                            {
                                                '@waitForBookmark': {
                                                    bookmarkName: 'bm',
                                                },
                                            },
                                            {
                                                '@func': {
                                                    displayName: 'Do This Func',
                                                    code: function (this: any) {
                                                        this.var1 = 1;
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                '@resumeBookmark': {
                                    bookmarkName: 'bm',
                                },
                            },
                        ],
                    },
                    {
                        '@func': {
                            displayName: 'Final Func',
                            code: function (this: any) {
                                return this.var1;
                            },
                        },
                    },
                ],
            },
        });

        const engine = new ActivityExecutionEngine(activity);

        const result = await engine.invoke();

        assert.equal(result, 1);
    });
});
