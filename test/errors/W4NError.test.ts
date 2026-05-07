import { W4NError } from '../../src/errors/W4NError.js';

describe('W4NError', () => {
    it('should create an error without inner error', () => {
        const err = new W4NError('Something went wrong');
        expect(err.message).toBe('Something went wrong');
        expect(err.name).toBe('W4NError');
        expect(err.stack).toBeDefined();
    });

    it('should include inner error in stack when provided', () => {
        const innerErr = new Error('Inner failure');
        const err = new W4NError('Outer failure', innerErr);

        expect(err.message).toBe('Outer failure');
        expect(err.stack).toContain('Caused by:');
        expect(err.stack).toContain('Inner failure');
    });

    it('should include nested inner errors recursively in stack', () => {
        const deepestErr = new Error('Deepest failure');
        const middleErr = new W4NError('Middle failure', deepestErr);
        const err = new W4NError('Top failure', middleErr);

        expect(err.stack).toContain('Caused by:');
        expect(err.stack).toContain('Middle failure');
        expect(err.stack).toContain('Deepest failure');
    });

    it('should include inner error info in toString()', () => {
        const innerErr = new Error('Inner failure');
        const err = new W4NError('Outer failure', innerErr);

        const str = err.toString();
        expect(str).toContain('W4NError');
        expect(str).toContain('Outer failure');
    });
});
