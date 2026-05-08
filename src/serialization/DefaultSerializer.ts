import superjson from 'superjson';
import { TypeError } from '../errors/TypeError.js';
import type { Serializer } from './Serializer.js';

export class DefaultSerializer implements Serializer {
    toJSON(obj: unknown): string {
        try {
            return superjson.stringify(obj);
        } catch (err) {
            throw new TypeError('Serialization failed.', err instanceof Error ? err : undefined);
        }
    }

    fromJSON<T>(json: string): T {
        try {
            return superjson.parse<T>(json);
        } catch (err) {
            throw new TypeError('Deserialization failed.', err instanceof Error ? err : undefined);
        }
    }
}
