import assert from 'node:assert';
import { w4fLogger } from '../common/w4nLogger.js';
import { TypeError } from '../errors/index.js';

export class KeepAlive {
    constructor(repeatFunc: () => void | Promise<void>, repeatPeriod: number) {
        if (typeof repeatFunc !== 'function') {
            throw new TypeError('Function argument expected.');
        }
        this.repeatFunc = repeatFunc;
        this.repeatPeriod = repeatPeriod;
    }

    private readonly repeatFunc: () => void | Promise<void>;
    private readonly repeatPeriod: number;
    private isRunning = false;
    private toId: ReturnType<typeof setTimeout> | null = null;

    start(): void {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.scheduleNext();
    }

    end(): void {
        assert(this.isRunning, 'Keep alive has already ended.');
        this.isRunning = false;
        if (this.toId !== null) {
            clearTimeout(this.toId);
            this.toId = null;
        }
    }

    private scheduleNext(): void {
        this.toId = setTimeout(() => {
            if (!this.isRunning) {
                return;
            }
            Promise.resolve(this.repeatFunc())
                .catch((e: unknown) => {
                    w4fLogger.error(e instanceof Error ? e : new Error(String(e)), 'Keep alive failed.');
                })
                .finally(() => {
                    if (this.isRunning) {
                        this.scheduleNext();
                    }
                });
        }, this.repeatPeriod);
    }
}
