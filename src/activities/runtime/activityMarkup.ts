import { type Activity } from '../Activity.js';

class ActivityMarkup {
    async parse(_str: string | Record<string, any>): Promise<Activity> {
        throw new Error('TODO');
    }
}

const markup = new ActivityMarkup();

export const activityMarkup = {
    async parse(str: string | Record<string, any>) {
        return await markup.parse(str);
    },

    // TODO
};
