import { InstIdPaths } from '../../src/hosting/InstIdPaths.js';

function createPaths(): InstIdPaths {
    return new InstIdPaths();
}

describe('InstIdPaths', () => {
    // ----- Construction -----

    it('should create an instance without throwing', () => {
        const paths = new InstIdPaths();
        expect(paths).toBeInstanceOf(InstIdPaths);
    });

    // ----- add -----

    it('should add a path for a workflow and method', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        const items = [...paths.items('wf1', 'methodA')];
        expect(items).toEqual(['id1']);
    });

    it('should add multiple distinct paths for the same workflow and method', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodA', 'id2');
        const items = [...paths.items('wf1', 'methodA')];
        expect(items).toEqual(['id1', 'id2']);
    });

    it('should add the same path multiple times (counting)', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodA', 'id1');
        const items = [...paths.items('wf1', 'methodA')];
        expect(items).toEqual(['id1']);
    });

    it('should keep paths separate for different workflow names', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.add('wf2', 'methodA', 'id2');

        expect([...paths.items('wf1', 'methodA')]).toEqual(['id1']);
        expect([...paths.items('wf2', 'methodA')]).toEqual(['id2']);
    });

    it('should keep paths separate for different method names', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodB', 'id2');

        expect([...paths.items('wf1', 'methodA')]).toEqual(['id1']);
        expect([...paths.items('wf1', 'methodB')]).toEqual(['id2']);
    });

    // ----- remove -----

    it('should remove a path when count drops to 1', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodA', 'id1');
        paths.remove('wf1', 'methodA', 'id1');
        // Second add incremented count to 2, remove decrements to 1 → still exists
        expect([...paths.items('wf1', 'methodA')]).toEqual(['id1']);
    });

    it('should delete the entry when the last reference is removed', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.remove('wf1', 'methodA', 'id1');
        expect([...paths.items('wf1', 'methodA')]).toEqual([]);
    });

    it('should delete all paths for a combo when one path count drops to 1', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodA', 'id2');
        paths.remove('wf1', 'methodA', 'id1');
        // When count === 1, the entire entry is removed — including other paths
        expect([...paths.items('wf1', 'methodA')]).toEqual([]);
    });

    it('should return false when removing a non-existent path', () => {
        const paths = createPaths();
        const result = paths.remove('wf1', 'methodA', 'nonexistent');
        expect(result).toBe(false);
    });

    it('should return false when removing from a non-existent workflow', () => {
        const paths = createPaths();
        const result = paths.remove('nonexistent', 'methodA', 'id1');
        expect(result).toBe(false);
    });

    it('should return false when removing a path that was already removed', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.remove('wf1', 'methodA', 'id1');
        const result = paths.remove('wf1', 'methodA', 'id1');
        expect(result).toBe(false);
    });

    it('should allow re-adding after removal', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.remove('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodA', 'id1');
        expect([...paths.items('wf1', 'methodA')]).toEqual(['id1']);
    });

    it('should handle add → remove → add cycling', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.remove('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodA', 'id1');
        paths.remove('wf1', 'methodA', 'id1');
        expect([...paths.items('wf1', 'methodA')]).toEqual([]);
    });

    // ----- items -----

    it('should yield nothing for a non-existent workflow and method', () => {
        const paths = createPaths();
        const items = [...paths.items('nonexistent', 'methodA')];
        expect(items).toEqual([]);
    });

    it('should yield all paths for a workflow and method', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'id1');
        paths.add('wf1', 'methodA', 'id2');
        paths.add('wf1', 'methodA', 'id3');

        const items = [...paths.items('wf1', 'methodA')];
        expect(items).toEqual(['id1', 'id2', 'id3']);
    });

    it('should yield paths in insertion order', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'first');
        paths.add('wf1', 'methodA', 'second');
        paths.add('wf1', 'methodA', 'third');

        const items = [...paths.items('wf1', 'methodA')];
        expect(items).toEqual(['first', 'second', 'third']);
    });

    it('should yield no duplicates when the same path is added multiple times', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'dup');
        paths.add('wf1', 'methodA', 'dup');
        paths.add('wf1', 'methodA', 'dup');

        const items = [...paths.items('wf1', 'methodA')];
        expect(items).toEqual(['dup']);
    });

    // ----- Isolation between entries -----

    it('should isolate entries for different workflow + method combinations', () => {
        const paths = createPaths();
        paths.add('wf1', 'methodA', 'path1');
        paths.add('wf1', 'methodB', 'path2');
        paths.add('wf2', 'methodA', 'path3');

        expect([...paths.items('wf1', 'methodA')]).toEqual(['path1']);
        expect([...paths.items('wf1', 'methodB')]).toEqual(['path2']);
        expect([...paths.items('wf2', 'methodA')]).toEqual(['path3']);
    });

    it('should not leak paths across separate instances', () => {
        const paths1 = createPaths();
        const paths2 = createPaths();
        paths1.add('wf1', 'methodA', 'id1');
        expect([...paths2.items('wf1', 'methodA')]).toEqual([]);
    });
});
