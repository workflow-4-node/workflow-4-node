import { reflection } from '../../common/reflection.js';

export const templateHelpers = {
    /**
     * Checks whether a string looks like a function expression.
     * Matches traditional, generator, async, and arrow functions.
     */
    isFunctionString(str: string): boolean {
        const s = str.trim();
        if (s.length < 2) {
            return false;
        }

        // Traditional/generator/async functions: function, function*, async function
        if (/^(?:async\s+)?function\s*\*?\s*\w*\s*\(/.test(s)) {
            return true;
        }

        // Arrow functions with parens: (params) => ..., async (params) => ...
        if (/^(?:async\s+)?\([^)]*\)\s*=>/.test(s)) {
            return true;
        }

        // Arrow functions without parens (single param): param => ..., async param => ...
        if (/^(?:async\s+)?\w+\s*=>/.test(s)) {
            return true;
        }

        return false;
    },

    /**
     * Returns true if the object contains at least one activity markup node.
     * Stops traversal at the first discovery for efficiency.
     */
    isTemplate(obj: Record<string, any>): boolean {
        let found = false;
        this.visitActivities(obj, () => {
            found = true;
            return false; // stop traversal immediately
        });
        return found;
    },

    /**
     * Visits all activity markup nodes in an object tree.
     * Calls `f(markup, parent, key)` for each discovered markup pattern:
     *   - Strings starting with `=` → `{ "@expression": { expr: ... } }`
     *   - Strings that look like function expressions → `{ "@func": { code: ... } }`
     *   - Actual Function values → `{ "@func": { code: ... } }`
     *   - Objects with a single `@key` → `{ "@key": value }`
     *   - Objects with `@import` + another `@key` → `{ "@import": ..., "@key": ... }`
     */
    visitActivities(obj: Record<string, any>, f: (markup: Record<string, any>, parent: any, key: string) => boolean | void): void {
        reflection.visitObject(obj, (key, value, parent) => {
            // Skip the root visit — we only care about properties with actual keys
            if (key === undefined) {
                return true;
            }

            if (typeof value === 'string') {
                const str = value.trim();
                if (str.length > 1) {
                    if (str[0] === '=') {
                        return f({ '@expression': { expr: str.slice(1) } }, parent, key) !== false;
                    }

                    if (this.isFunctionString(str)) {
                        return f({ '@func': { code: str } }, parent, key) !== false;
                    }
                }
            } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Since visitObject only visits plain objects and arrays,
                // this is a plain object. Check for @-prefixed keys.
                const keys = Object.keys(value);

                if (keys.length === 1) {
                    const k = keys[0];
                    if (k.startsWith('@') && k.length > 1) {
                        return f({ [k]: value[k] }, parent, key) !== false;
                    }
                } else if (keys.length === 2) {
                    const k1 = keys[0];
                    const k2 = keys[1];
                    if (k1 === '@import' && k2.startsWith('@') && k2.length > 1) {
                        return f({ [k1]: value[k1], [k2]: value[k2] }, parent, key) !== false;
                    }
                    if (k2 === '@import' && k1.startsWith('@') && k1.length > 1) {
                        return f({ [k2]: value[k2], [k1]: value[k1] }, parent, key) !== false;
                    }
                }
            } else if (typeof value === 'function') {
                return f({ '@func': { code: value } }, parent, key) !== false;
            }

            return true;
        });
    },
};
