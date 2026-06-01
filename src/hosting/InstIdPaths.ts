import { specStrings } from '../common/specStrings.js';

export class InstIdPaths {
    private readonly map = new Map<string, Map<string, number>>();

    add(workflowName: string, methodName: string, instanceIdPath: string): void {
        const key = specStrings.hosting.doubleKeys(workflowName, methodName);
        let inner = this.map.get(key);
        if (!inner) {
            inner = new Map();
            this.map.set(key, inner);
        }
        const count = inner.get(instanceIdPath) || 0;
        inner.set(instanceIdPath, count + 1);
    }

    remove(workflowName: string, methodName: string, instanceIdPath: string): boolean {
        const key = specStrings.hosting.doubleKeys(workflowName, methodName);
        const inner = this.map.get(key);
        if (inner) {
            const count = inner.get(instanceIdPath);
            if (count !== undefined) {
                if (count === 1) {
                    this.map.delete(key);
                } else {
                    inner.set(instanceIdPath, count - 1);
                }
            }
        }
        return false;
    }

    *items(workflowName: string, methodName: string): IterableIterator<string> {
        const key = specStrings.hosting.doubleKeys(workflowName, methodName);
        const inner = this.map.get(key);
        if (inner) {
            for (const ik of inner.keys()) {
                yield ik;
            }
        }
    }
}
