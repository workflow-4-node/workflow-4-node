export const converters = {
    mapToArray<T>(map: Map<string, T> | null | undefined): [string, T][] | null {
        if (!map) {
            return null;
        }
        return Array.from(map.entries());
    },

    arrayToMap<T>(json: [string, T][] | null | undefined): Map<string, T> | null {
        if (!json) {
            return null;
        }
        return new Map(json);
    },

    setToArray<T>(set: Set<T> | null | undefined): T[] | null {
        if (!set) {
            return null;
        }
        return Array.from(set.values());
    },

    arrayToSet<T>(json: T[] | null | undefined): Set<T> | null {
        if (!json) {
            return null;
        }
        return new Set(json);
    },
};
