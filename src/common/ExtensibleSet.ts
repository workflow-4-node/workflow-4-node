export class ExtensibleSet<T> {
    constructor(private readonly baseSet?: Set<T> | ExtensibleSet<T>) {}

    private readonly ownSet = new Set<T>();

    get size(): number {
        return this.ownSet.size + (this.baseSet?.size ?? 0);
    }

    add(value: T) {
        if (!this.baseSet?.has(value)) {
            this.ownSet.add(value);
        }
        return this;
    }

    has(value: T): boolean {
        return this.ownSet.has(value) || this.baseSet?.has(value) === true;
    }

    *values(): Iterable<T> {
        if (this.baseSet) {
            for (const value of this.baseSet.values()) {
                yield value;
            }
        }
        for (const value of this.ownSet.values()) {
            yield value;
        }
    }
}
