import { ActivityExecutionEngine, Func } from '../../src/index.js';
import assert from 'assert';

type Person = {
    name: string;
};

describe('Func', () => {
    it('should run with a synchronous code', async () => {
        const fop = new Func();
        fop.code = function (obj: Person) {
            assert(obj && typeof obj === 'object' && typeof obj.name === 'string', 'Input is not a Person object.');
            return obj.name;
        };

        const engine = new ActivityExecutionEngine(fop);
        const result = await engine.invoke({ name: 'Gabor' });
        assert.equal(result, 'Gabor');
    });
});
