import { type Activity } from '../Activity.js';

class ActivityMarkup {
    parse(_str: string | Record<string, any>): Activity {
        throw new Error('TODO');
    }
}

const markup = new ActivityMarkup();

export const activityMarkup = {
    parse(str: string | Record<string, any>) {
        return markup.parse(str);
    },

    // TODO
};
