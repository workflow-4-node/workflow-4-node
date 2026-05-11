export const reflection = {
    /**
     * Enumerates all properties of an object recursively, including array elements.
     * Calls the visitor first on the root object (with `key` and `parent` as `undefined`),
     * then on each property/element with `(key, value, parent)`.
     * If the visitor returns `true`, continues recursing into that value (if it's an object/array).
     * If the visitor returns `false`, skips recursion into that value.
     */
    visitObject(obj: Record<string, any>, visitor: (key: string | undefined, value: any, parent: any) => boolean) {
        if (typeof obj !== 'object' || obj === null) {
            return;
        }

        // Track visited objects to prevent infinite recursion on cyclic references
        const visited = new Set<object>();

        const visit = (target: Record<string, any>) => {
            if (visited.has(target)) {
                return;
            }
            visited.add(target);

            if (Array.isArray(target)) {
                for (let i = 0; i < target.length; i++) {
                    const value = target[i];
                    const key = String(i);
                    if (visitor(key, value, target) && typeof value === 'object' && value !== null) {
                        visit(value);
                    }
                }
            } else {
                for (const key of Object.keys(target)) {
                    const value = target[key];
                    if (visitor(key, value, target) && typeof value === 'object' && value !== null) {
                        visit(value);
                    }
                }
            }
        };

        // Visit the root object first — this is the only time we call the visitor on the object itself
        if (!visitor(undefined, obj, undefined)) {
            return;
        }

        visit(obj);
    },
};
