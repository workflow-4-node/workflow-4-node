export const reflection = {
    /**
     * Enumerates all properties of a plain object or array recursively.
     * Calls the visitor first on the root object (with `key` and `parent` as `undefined`),
     * then on each property/element with `(key, value, parent)`.
     * Only visits plain objects (`{}`) and arrays — skips class instances, Date, Map, etc.
     * If the visitor returns `true`, continues the traversal (recursing into children).
     * If the visitor returns `false`, **breaks** the entire traversal immediately.
     */
    visitObject(obj: Record<string, any>, visitor: (key: string | undefined, value: any, parent: any) => boolean) {
        if (typeof obj !== 'object' || obj === null) {
            return;
        }

        // Only visit plain objects and arrays — skip class instances, Date, Map, etc.
        if (!Array.isArray(obj) && !isPlainObject(obj)) {
            return;
        }

        // Track visited objects to prevent infinite recursion on cyclic references
        const visited = new Set<object>();

        const visit = (target: Record<string, any>): boolean => {
            if (visited.has(target)) {
                return true;
            }
            visited.add(target);

            if (Array.isArray(target)) {
                for (let i = 0; i < target.length; i++) {
                    const value = target[i];
                    const key = String(i);
                    if (!visitor(key, value, target)) {
                        return false;
                    }
                    if ((Array.isArray(value) || isPlainObject(value)) && !visit(value)) {
                        return false;
                    }
                }
            } else {
                for (const key of Object.keys(target)) {
                    const value = target[key];
                    if (!visitor(key, value, target)) {
                        return false;
                    }
                    if ((Array.isArray(value) || isPlainObject(value)) && !visit(value)) {
                        return false;
                    }
                }
            }

            return true;
        };

        // Visit the root object first — this is the only time we call the visitor on the object itself
        if (!visitor(undefined, obj, undefined)) {
            return;
        }

        visit(obj);
    },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
    );
}
