import { templateHelpers } from './templateHelpers.js';
import { reflection } from '../../common/reflection.js';
import { Activity } from '../Activity.js';
import { ActivityMarkupError } from '../../errors/ActivityMarkupError.js';
import { TypeError } from '../../errors/TypeError.js';

const activityTypeNameRex = /^@([a-zA-Z_]+[0-9a-zA-Z_]*)$/;

class ActivityMarkup {
    private readonly systemTypes = new Map<string, new () => Activity>();
    private systemTypesLoaded = false;

    async parse(markup: string | Record<string, any>): Promise<Activity> {
        if (!markup) {
            throw new TypeError("Parameter 'markup' expected.");
        }

        await this.ensureSystemTypesLoaded();

        let obj: Record<string, any>;
        if (typeof markup === 'string') {
            obj = JSON.parse(markup);
        } else {
            obj = markup;
        }

        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            throw new TypeError("Parameter 'markup' is not a plain object.");
        }

        const types = new Map<string, new () => Activity>();
        for (const [k, v] of this.systemTypes.entries()) {
            types.set(k, v);
        }

        const imp = obj['@import'];
        if (imp) {
            await this.importModule(types, imp);
        }

        return this.createActivity(types, obj);
    }

    stringify(obj: unknown): string {
        if (typeof obj === 'string') {
            return obj;
        }

        const cloned = reflection.deepClone(obj);
        this.functionsToString(cloned);
        return JSON.stringify(cloned);
    }

    private async ensureSystemTypesLoaded(): Promise<void> {
        if (this.systemTypesLoaded) {
            return;
        }
        const mod = (await import('../../activities/index.js')) as Record<string, unknown>;
        this.registerTypesFromModule(this.systemTypes, mod);
        this.systemTypesLoaded = true;
    }

    private async importModule(types: Map<string, new () => Activity>, markup: unknown): Promise<void> {
        if (Array.isArray(markup)) {
            for (const item of markup) {
                await this.importModule(types, item);
            }
        } else if (typeof markup === 'string') {
            const mod = (await import(markup)) as Record<string, unknown>;
            this.registerTypesFromModule(types, mod);
        } else {
            throw new ActivityMarkupError(`Cannot import '${JSON.stringify(markup)}'.`);
        }
    }

    private registerTypesFromModule(types: Map<string, new () => Activity>, mod: Record<string, unknown>): void {
        // Register all exports that are Activity constructors
        for (const key of Object.keys(mod)) {
            const exp = mod[key];
            if (this.isActivityConstructor(exp)) {
                const alias = this.getAlias(exp);
                if (alias && !types.has(alias)) {
                    types.set(alias, exp);
                }
            }
        }
    }

    private createActivity(types: Map<string, new () => Activity>, markup: Record<string, any>): Activity {
        const fieldNames = Object.keys(markup).filter((k) => k !== '@import');
        if (fieldNames.length !== 1) {
            throw new ActivityMarkupError('There should be one field.' + this.errorHint(markup));
        }

        const activityAlias = this.getActivityTypeName(fieldNames[0]);
        if (activityAlias) {
            return this.createAndInitActivityInstance(types, activityAlias, markup);
        }

        throw new ActivityMarkupError("Root entry is not an activity type name '" + fieldNames[0] + "'." + this.errorHint(markup));
    }

    private createAndInitActivityInstance(types: Map<string, new () => Activity>, typeName: string, markup: Record<string, any>): Activity {
        const activity = this.createActivityInstance(types, typeName);
        if (!activity) {
            throw new ActivityMarkupError("Unknown activity type name '" + typeName + "'." + this.errorHint(markup));
        }

        const activityRef = { name: typeName, value: activity };
        const pars = markup['@' + typeName];
        if (pars !== undefined) {
            this.setupActivity(types, activityRef, pars);
        }
        return activityRef.value;
    }

    private createActivityInstance(types: Map<string, new () => Activity>, alias: string): Activity | null {
        const Ctor = types.get(alias);
        if (!Ctor) {
            return null;
        }
        return new Ctor();
    }

    private setupActivity(types: Map<string, new () => Activity>, activityRef: { name: string; value: Activity }, pars: unknown): void {
        const activity = activityRef.value;
        const noTemplate = activityRef.name === 'template';

        if (Array.isArray(pars)) {
            activity.args = [];
            for (const obj of pars) {
                activity.args.push(this.createValue(types, obj, false, activity, undefined, noTemplate));
            }
        } else if (typeof pars === 'object' && pars !== null) {
            const parObj = pars as Record<string, unknown>;

            for (const fieldName of Object.keys(parObj)) {
                const fieldValue = parObj[fieldName];

                if (activity.isArrayProperty(fieldName)) {
                    let v = this.createValue(types, fieldValue, true, activity, undefined, noTemplate);
                    if (!Array.isArray(v)) {
                        v = [v];
                    }
                    (activity as any)[fieldName] = v;
                } else if (fieldName === '@import') {
                    // Already handled at the parse level — skip
                } else {
                    (activity as any)[fieldName] = this.createValue(types, fieldValue, false, activity, fieldName, noTemplate);
                }
            }
        } else {
            activity.args = [this.createValue(types, pars, false, activity, undefined, noTemplate)];
        }
    }

    private createValue(
        types: Map<string, new () => Activity>,
        markup: unknown,
        canBeArray: boolean,
        parent?: Activity,
        fieldName?: string,
        noTemplate?: boolean,
    ): unknown {
        const noFunction = parent && fieldName ? parent.isCodeProperty(fieldName) : undefined;

        if (Array.isArray(markup)) {
            if (canBeArray) {
                return markup.map((v) => this.createValue(types, v, false, parent));
            }
            if (!noTemplate && templateHelpers.isTemplate(markup as Record<string, any>)) {
                return this.toTemplate(types, markup as Record<string, any>);
            }
            return reflection.deepClone(markup);
        }

        if (typeof markup === 'object' && markup !== null) {
            const obj = markup as Record<string, unknown>;
            const fieldNames = Object.keys(obj);
            if (fieldNames.length === 1) {
                const name = fieldNames[0];
                const fv = obj[name];

                if (name === '_') {
                    return fv;
                }

                const activityTypeName = this.getActivityTypeName(name);
                if (activityTypeName) {
                    return this.createAndInitActivityInstance(types, activityTypeName, obj as Record<string, any>);
                }
            }

            if (!noTemplate && templateHelpers.isTemplate(obj as Record<string, any>)) {
                return this.toTemplate(types, obj as Record<string, any>);
            }

            return reflection.deepClone(markup);
        }

        if (typeof markup === 'string') {
            const str = markup.trim();
            if (templateHelpers.isFunctionString(str)) {
                const f = this.evalFunctionString(str);
                if (!noFunction) {
                    return this.toFunc(types, f);
                }
                return f;
            }

            if (str.length > 1 && str[0] === '=') {
                return this.toExpression(types, str.slice(1));
            }
        }

        if (typeof markup === 'function') {
            const fn = markup as (...args: unknown[]) => unknown;
            if (!noFunction) {
                return this.toFunc(types, fn);
            }
            return fn;
        }

        return reflection.deepClone(markup);
    }

    private getActivityTypeName(str: string): string | null {
        const result = activityTypeNameRex.exec(str);
        if (result && result.length === 2) {
            return result[1];
        }
        return null;
    }

    private getAlias(Ctor: new () => Activity): string | null {
        if (!this.isActivityConstructor(Ctor)) {
            return null;
        }
        const name = Ctor.name;
        return name[0].toLowerCase() + name.slice(1);
    }

    private isActivityConstructor(value: unknown): value is new () => Activity {
        return typeof value === 'function' && typeof value.prototype === 'object' && value.prototype instanceof Activity;
    }

    private evalFunctionString(str: string): (...args: unknown[]) => unknown {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function('return (' + str + ');')() as (...args: unknown[]) => unknown;
    }

    private toTemplate(types: Map<string, new () => Activity>, markup: Record<string, any>): Activity {
        const template = this.createActivityInstance(types, 'template');
        if (template) {
            (template as any).declare = markup;
        }
        return template!;
    }

    private toFunc(types: Map<string, new () => Activity>, f: (...args: unknown[]) => unknown): Activity {
        const func = this.createActivityInstance(types, 'func');
        if (func) {
            (func as any).code = f;
        }
        return func!;
    }

    private toExpression(types: Map<string, new () => Activity>, expr: string): Activity {
        const exprActivity = this.createActivityInstance(types, 'expression');
        if (exprActivity) {
            (exprActivity as any).expr = expr;
        }
        return exprActivity!;
    }

    private functionsToString(obj: unknown): void {
        if (typeof obj !== 'object' || obj === null) {
            return;
        }

        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                if (typeof obj[i] === 'function') {
                    obj[i] = obj[i].toString();
                } else {
                    this.functionsToString(obj[i]);
                }
            }
            return;
        }

        const rec = obj as Record<string, unknown>;
        for (const fieldName of Object.keys(rec)) {
            const fieldValue = rec[fieldName];
            if (typeof fieldValue === 'function') {
                rec[fieldName] = fieldValue.toString();
            } else if (Array.isArray(fieldValue)) {
                for (let i = 0; i < fieldValue.length; i++) {
                    if (typeof fieldValue[i] === 'function') {
                        fieldValue[i] = fieldValue[i].toString();
                    } else {
                        this.functionsToString(fieldValue[i]);
                    }
                }
            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                this.functionsToString(fieldValue);
            }
        }
    }

    private errorHint(markup: Record<string, any>): string {
        const len = 20;
        let json = JSON.stringify(markup);
        if (json.length > len) {
            json = json.slice(0, len) + ' ...';
        }
        return '\nSee error near:\n' + json;
    }
}

const instance = new ActivityMarkup();

export const activityMarkup = {
    async parse(markup: string | Record<string, any>): Promise<Activity> {
        return await instance.parse(markup);
    },

    stringify(obj: unknown): string {
        return instance.stringify(obj);
    },
};
