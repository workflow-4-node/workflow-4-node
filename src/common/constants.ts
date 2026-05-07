const maxLen = 'collectingCompletedBookmark'.length;
export const identity = '-:\\|$WF4N$|/:-';

export const constants = {
    identity,
    markers: {
        valueCollectedBookmark: make('mValueCollectedBookmark'),
        collectingCompletedBookmark: make('mCollectingCompletedBookmark'),
        beginMethodBookmark: make('mBeginMethodBookmark'),
        activityProperty: make('mActivityProperty'),
        activityInstance: make('mActivityInstance'),
        keySeparator: make('mKeySeparator'),
        nope: make('mNope'),
        delayToMethodNamePrefix: make('mDelayToMethodNamePrefix'),
        $parent: make('mParent'),
    },
    ids: {
        initialScope: make('mInitialScope'),
    },
    types: {
        error: make('mError'),
        schedulingState: make('mSchedulingState'),
        date: make('mDate'),
        set: make('mSet'),
        map: make('mMap'),
        rex: make('mRex'),
        object: make('mObject'),
    },
} as const;

function snakeCase(name: string): string {
    return name
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()
        .replace(/^_/, '');
}

function make(name: string): string {
    let inner = snakeCase(name);
    if (inner.length > maxLen) {
        inner = inner.substring(0, maxLen);
    } else {
        while (inner.length < maxLen) {
            inner += '_';
        }
    }
    return identity + inner;
}
