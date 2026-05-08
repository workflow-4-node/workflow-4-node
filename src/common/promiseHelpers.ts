import assert from 'assert';
import { TimeoutError } from '../errors/index.js';

const dateNow = Date.now;

/**
 * A collection of async utility functions for controlling async flow.
 *
 * Import `promiseHelpers` and call methods on it rather than importing
 * individual functions directly.
 *
 * @example
 * import { promiseHelpers } from './promiseHelpers.js';
 * await promiseHelpers.retry(() => fetchData(), 5, 200);
 * await promiseHelpers.parallel(items, async item => process(item));
 * const result = await promiseHelpers.timeout(fetchData(), 5_000);
 */
export const promiseHelpers = {
    toPromise,
    tryAsync,
    try: tryAsync,
    delay,
    retry,
    retryFor,
    waitFor,
    defer,
    all,
    parallel,
    parallelAsync,
    timeout,
    runInParallel,
    map,
};

/** Normalises a value, promise, or zero-argument function into a `Promise`. */
async function toPromise<T>(arg: T | Promise<T> | (() => T) | (() => Promise<T>)): Promise<T> {
    if (typeof arg === 'function') {
        return await tryAsync<T>(async () => await (arg as () => Promise<any>)());
    }
    return await arg;
}

/**
 * Wraps a function in an immediately-invoked async IIFE whose rejection is
 * silently swallowed to avoid unhandled-rejection warnings. The returned
 * promise still rejects normally for awaiting callers.
 */
async function tryAsync<T = void>(fn: (() => T) | (() => Promise<T>)): Promise<T> {
    const promise = (async () => await fn())();
    promise.catch(() => {
        /*noop*/
    }); // Prevent unhandled rejection warning
    return promise;
}

/** Pauses execution for `ms` milliseconds. Pass `unref = true` to not block process exit. */
async function delay(ms: number, unref = false) {
    if (ms > 0) {
        await new Promise(function (resolve) {
            const to = setTimeout(resolve, ms);
            if (unref) {
                to.unref();
            }
        });
    }
}

/**
 * Retries `fn` up to `times` times with an exponentially increasing interval
 * (capped at 1 s). Stops retrying early if `shouldRetryOnErrorCallback`
 * returns `false` for the error.
 */
async function retry<T>(
    fn: (() => T) | (() => Promise<T>),
    times: number,
    interval: number,
    shouldRetryOnErrorCallback: ((err: Error) => boolean) | null = null,
    logFn: ((err: Error, count: number) => void) | null = null,
): Promise<T> {
    assert(times > 0, 'Argument "times" is invalid.');
    assert(interval > 0, 'Argument "interval" is invalid.');

    for (let i = 1; ; i++) {
        try {
            return await fn();
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (i >= times) {
                throw error;
            }
            if (shouldRetryOnErrorCallback && !shouldRetryOnErrorCallback(error)) {
                throw error;
            }
            if (logFn) {
                logFn(error, i);
            }
        }
        await delay(interval, true);
        interval = increaseInterval(interval, 1000);
    }
}

/** Like `retry` but retries for a total duration of `ms` instead of a fixed attempt count. */
async function retryFor<T>(
    fn: (() => T) | (() => Promise<T>),
    ms: number,
    interval: number,
    shouldRetryOnErrorCallback: ((err: Error) => boolean) | null = null,
    logFn: ((err: Error, count: number) => void) | null = null,
) {
    interval = interval || 500;
    assert(ms > 0, 'Argument "ms" is invalid.');
    assert(interval > 0, 'Argument "interval" is invalid.');

    const start = dateNow();
    for (let i = 1; ; i++) {
        try {
            return await fn();
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (dateNow() - start >= ms) {
                throw error;
            }
            if (shouldRetryOnErrorCallback && !shouldRetryOnErrorCallback(error)) {
                throw error;
            }
            if (logFn) {
                logFn(error, i);
            }
        }
        await delay(interval, true);
        interval = increaseInterval(interval, 1000);
    }
}

function increaseInterval(currentInterval: number, maxInterval = 1000) {
    if (currentInterval < maxInterval) {
        currentInterval *= 2;
        if (currentInterval > maxInterval) {
            currentInterval = maxInterval;
        }
    }
    return currentInterval;
}

export type Deferred<T> = {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (err: Error) => void;
};

/** Creates a manually resolvable/rejectable promise. */
function defer<T = void>(): Deferred<T> {
    const result: Partial<Deferred<T>> = {};
    let err: Error | null = null;
    result.promise = new Promise<T | undefined>(function (resolve) {
        result.resolve = resolve;
        result.reject = (error: Error) => {
            err = error;
            resolve(undefined);
        };
    }).then((r) => {
        if (err) {
            throw err;
        }
        return r;
    }) as Promise<T>;
    return result as Deferred<T>;
}

/** Awaits all promises in an array, collecting errors rather than short-circuiting. */
async function all<T>(items: Promise<Promise<T>[]> | Promise<T>[], logErrorFn: ((err: Error) => void) | null = null, logAllErrors = false) {
    let firstErr: Error | null = null;
    const results = await items;
    for (const promise of results) {
        try {
            await promise;
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (!firstErr && !logAllErrors) {
                firstErr = error;
            } else if (logErrorFn) {
                logErrorFn(error);
            }
        }
    }
    if (firstErr) {
        throw firstErr;
    }
}

async function map<T, R>(
    items: Promise<Promise<T>[]> | Promise<T>[],
    fn: (item: T) => R | Promise<R>,
    logErrorFn: ((err: Error) => void) | null = null,
    logAllErrors = false,
) {
    let firstErr: Error | null = null;
    const result: R[] = [];
    const resolvedItems = await items;
    for (const item of resolvedItems) {
        try {
            result.push(await fn(await item));
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (!firstErr && !logAllErrors) {
                firstErr = error;
            } else if (logErrorFn) {
                logErrorFn(error);
            }
        }
    }
    if (firstErr) {
        throw firstErr;
    }
    return result;
}

/**
 * Runs `fn` concurrently over all items using `tryAsync`, then waits for
 * all to complete. Errors are optionally logged rather than thrown immediately.
 */
async function parallel<T>(
    items: Iterable<T>,
    fn: (item: T) => Promise<void>,
    logErrorFn: ((err: Error) => void) | null = null,
    logAllErrors = false,
) {
    const promises: Promise<void>[] = [];
    for (const item of items) {
        promises.push(tryAsync<void>(async () => await fn(item)));
    }
    await all(promises, logErrorFn, logAllErrors);
}

/** Like `parallel` but accepts an `AsyncIterable` as the source. */
async function parallelAsync<T>(
    items: AsyncIterable<T>,
    fn: (item: T) => Promise<void>,
    logErrorFn: ((err: Error) => void) | null = null,
    logAllErrors = false,
) {
    const promises: Promise<void>[] = [];
    for await (const item of items) {
        promises.push(tryAsync<void>(async () => await fn(item)));
    }
    await all(promises, logErrorFn, logAllErrors);
}

async function runInParallel(
    functions: Iterable<() => Promise<unknown>>,
    logErrorFn: ((err: Error) => void) | null = null,
    logAllErrors = false,
) {
    const promises: Promise<void>[] = [];
    for (const fn of functions) {
        promises.push(tryAsync<void>(async () => await fn()));
    }
    await all(promises, logErrorFn, logAllErrors);
}

/**
 * Polls `func` every `delayTime` ms until it returns a truthy value or
 * throws `TimeoutError` after `timeout` ms.
 */
async function waitFor(func: (() => boolean | void) | (() => Promise<boolean | void>), timeout = 5000, delayTime = 100) {
    const startOn = dateNow();
    for (;;) {
        let lastErr: Error | null = null;
        try {
            if ((await func()) !== false) {
                return;
            }
        } catch (err: unknown) {
            lastErr = err instanceof Error ? err : new Error(String(err));
        }
        await delay(delayTime);
        if (dateNow() - startOn > timeout) {
            if (lastErr) {
                throw lastErr;
            }
            throw new TimeoutError('Wait timeout.');
        }
    }
}

async function timeout<T>(
    promiseOrFunction: Promise<T> | (() => Promise<T>),
    ms: number,
    logErrorFn: ((err: Error) => void) | null = null,
    cancelFn: (() => void) | null = null,
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const promise = toPromise(promiseOrFunction);
    const timeoutPromise =
        ms > 0
            ? new Promise<void>((resolve) => {
                  timeoutId = setTimeout(resolve, ms);
                  timeoutId?.unref();
              })
            : null;

    return new Promise<T>((resolve, reject) => {
        let done = false;

        promise
            .then((result) => {
                if (done) {
                    return;
                }
                done = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = undefined;
                }
                resolve(result);
            })
            .catch((err: unknown) => {
                if (done) {
                    if (logErrorFn) {
                        logErrorFn(err instanceof Error ? err : new Error(String(err)));
                    }
                    return;
                }
                done = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = undefined;
                }
                reject(err instanceof Error ? err : new Error(String(err)));
            });

        if (timeoutPromise) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            timeoutPromise.then(() => {
                if (done) {
                    return;
                }
                done = true;
                if (cancelFn) {
                    cancelFn();
                }
                reject(new TimeoutError('Operation timeout.'));
            });
        }
    });
}
