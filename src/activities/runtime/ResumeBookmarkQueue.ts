import { ActivityRuntimeError } from '../../errors/ActivityRuntimeError.js';

export type ResumeBookmarkCommand = {
    name: string;
    reason: string;
    result: unknown;
};

export class ResumeBookmarkQueue {
    private names: Set<string> = new Set();
    private commands: ResumeBookmarkCommand[] = [];

    get isEmpty(): boolean {
        return this.commands.length === 0;
    }

    enqueue(bookmarkName: string, reason: string, result: unknown): void {
        if (this.names.has(bookmarkName)) {
            throw new ActivityRuntimeError(`The '${bookmarkName}' bookmark continuation already enqueued.`);
        }
        this.names.add(bookmarkName);
        this.commands.push({ name: bookmarkName, reason, result });
    }

    dequeue(): ResumeBookmarkCommand | null {
        if (this.commands.length === 0) {
            return null;
        }
        const command = this.commands[0];
        this.commands.splice(0, 1);
        this.names.delete(command.name);
        return command;
    }

    remove(bookmarkName: string): void {
        if (this.names.has(bookmarkName)) {
            const idx = this.commands.findIndex((c) => c.name === bookmarkName);
            if (idx !== -1) {
                this.commands.splice(idx, 1);
            }
            this.names.delete(bookmarkName);
        }
    }
}
