export interface Serializer {
    toJSON(obj: unknown): string;
    fromJSON<T>(json: string): T;
}
