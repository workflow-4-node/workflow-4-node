export class InstanceIdParser {
    private readonly cache = new Map<string, (this: unknown) => string>();

    parse(path: string, obj: unknown): string {
        if (obj === null || obj === undefined) {
            throw new Error("Argument 'obj' expected.");
        }
        if (typeof path !== 'string') {
            throw new TypeError("Argument 'path' is not a string.");
        }

        let parser = this.cache.get(path);
        if (!parser) {
            parser = this.createParser(path);
            this.cache.set(path, parser);
        }

        return parser.call(obj);
    }

    private createParser(path: string): (this: unknown) => string {
        if (path.indexOf('this') !== 0) {
            if (path[0] === '[') {
                path = 'this' + path;
            } else {
                path = 'this.' + path;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function('return (' + path + ').toString();') as (this: unknown) => string;
    }
}
