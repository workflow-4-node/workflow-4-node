import { ActivityState } from '../common/enums.js';
import { reflection } from '../common/reflection.js';
import { Activity } from './Activity.js';
import { activityMarkup } from './runtime/activityMarkup.js';
import { templateHelpers } from './runtime/templateHelpers.js';
import { type ActivityExecutionContext } from './runtime/ActivityExecutionContext.js';
import { type CallContext } from './runtime/CallContext.js';

export class Template extends Activity {
    constructor() {
        super();
        this.hideFromScopeProperties.add('declare');
    }

    declare: Record<string, any> | null = null;

    async initializeStructure(_execContext: ActivityExecutionContext): Promise<void> {
        const decl = this.declare;
        if (!decl) {
            return;
        }

        const parsePromises: Promise<Activity>[] = [];
        templateHelpers.visitActivities(decl, (markup: Record<string, any>) => {
            parsePromises.push(activityMarkup.parse(markup));
            return true;
        });

        this.args = await Promise.all(parsePromises);
    }

    run(callContext: CallContext, args: unknown[]) {
        if (Array.isArray(args) && args.length) {
            callContext.schedule(args, 'activitiesGot');
        } else {
            callContext.complete(undefined);
        }
    }

    activitiesGot(callContext: CallContext, reason: ActivityState, result: unknown) {
        if (reason === ActivityState.complete) {
            if (Array.isArray(result) && result.length) {
                let idx = 0;
                const activity = callContext.activity as Template;
                const decl = reflection.deepClone(activity.declare) as Record<string, any> | null;
                if (!decl) {
                    callContext.complete(undefined);
                    return;
                }
                const setupTasks: Array<() => void> = [];
                templateHelpers.visitActivities(decl, (_markup: Record<string, any>, parent: any, key: string) => {
                    setupTasks.push(() => {
                        parent[key] = result[idx++];
                    });
                    return true;
                });
                for (const task of setupTasks) {
                    task();
                }
                callContext.complete(decl);
                return;
            }
        }
        callContext.end(reason, result);
    }
}
