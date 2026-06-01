import { Workflow } from '../../src/activities/Workflow.js';
import { WorkflowRegistry } from '../../src/hosting/WorkflowRegistry.js';
import { WorkflowNotFoundError } from '../../src/errors/WorkflowNotFoundError.js';
import { ValidationError } from '../../src/errors/ValidationError.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRegistry(): WorkflowRegistry {
    return new WorkflowRegistry();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WorkflowRegistry', () => {
    // ----- Construction -----

    it('should create an instance without throwing', () => {
        const registry = new WorkflowRegistry();
        expect(registry).toBeInstanceOf(WorkflowRegistry);
    });

    it('should accept a custom serializer', () => {
        const customSerializer = {
            toJSON: (obj: unknown) => JSON.stringify(obj),
            fromJSON: <T>(json: string) => JSON.parse(json) as T,
        };
        const registry = new WorkflowRegistry(customSerializer);
        expect(registry).toBeInstanceOf(WorkflowRegistry);
    });

    // ----- register -----

    it('should register a workflow and return a descriptor', async () => {
        const registry = createRegistry();
        const wf = new Workflow('testWorkflow');
        const desc = await registry.register(wf);

        expect(desc).toBeDefined();
        expect(desc.name).toBe('testWorkflow');
        expect(typeof desc.version).toBe('string');
        expect(desc.version).toHaveLength(64); // SHA-256 hex
        expect(desc.deprecated).toBe(false);
        expect(desc.execContext).toBeDefined();
        expect(desc.methods).toBeInstanceOf(Map);
    });

    it('should register a workflow with a default-deprecated flag of false', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        const desc = await registry.register(wf);
        expect(desc.deprecated).toBe(false);
    });

    it('should register a workflow as deprecated when flag is true', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        const desc = await registry.register(wf, true);
        expect(desc.deprecated).toBe(true);
    });

    it('should trim the workflow name', async () => {
        const registry = createRegistry();
        const wf = new Workflow('  spacedName  ');
        const desc = await registry.register(wf);
        expect(desc.name).toBe('spacedName');
    });

    it('should reject a workflow with an empty name', async () => {
        const registry = createRegistry();
        const wf = new Workflow('');
        await expect(registry.register(wf)).rejects.toThrow(ValidationError);
    });

    it('should reject a workflow with a whitespace-only name', async () => {
        const registry = createRegistry();
        const wf = new Workflow('   ');
        await expect(registry.register(wf)).rejects.toThrow(ValidationError);
    });

    it('should reject registering the same workflow twice', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        await registry.register(wf);
        await expect(registry.register(wf)).rejects.toThrow(ValidationError);
        await expect(registry.register(wf)).rejects.toThrow(/already registered/);
    });

    it('should reject a second undeprecated version when one already exists', async () => {
        const registry = createRegistry();
        const wf1 = new Workflow('test');
        await registry.register(wf1);

        // Same-name workflow with a non-excluded custom property produces a different version
        const wf2 = new Workflow('test');
        (wf2 as unknown as Record<string, unknown>).customProp = 'different';
        await expect(registry.register(wf2)).rejects.toThrow(ValidationError);
        await expect(registry.register(wf2)).rejects.toThrow(/undeprecated version/);
    });

    it('should allow a deprecated version after an undeprecated one', async () => {
        const registry = createRegistry();
        const wf1 = new Workflow('test');
        const desc1 = await registry.register(wf1);
        expect(desc1.deprecated).toBe(false);

        // Same name, structurally different via custom property → different version
        const wf2 = new Workflow('test');
        (wf2 as unknown as Record<string, unknown>).customProp = 'v2';
        const desc2 = await registry.register(wf2, true);
        expect(desc2.deprecated).toBe(true);
    });

    it('should allow multiple deprecated versions', async () => {
        const registry = createRegistry();
        await registry.register(new Workflow('test'));

        const wf2 = new Workflow('test');
        (wf2 as unknown as Record<string, unknown>).customProp = 'v2';
        const desc2 = await registry.register(wf2, true);
        expect(desc2.deprecated).toBe(true);

        const wf3 = new Workflow('test');
        (wf3 as unknown as Record<string, unknown>).customProp = 'v3';
        const desc3 = await registry.register(wf3, true);
        expect(desc3.deprecated).toBe(true);
    });

    it('should allow registering a new undeprecated version if all previous are deprecated', async () => {
        const registry = createRegistry();
        const wf1 = new Workflow('test');
        await registry.register(wf1, true); // deprecated

        const wf2 = new Workflow('test');
        (wf2 as unknown as Record<string, unknown>).customProp = 'v2';
        const desc2 = await registry.register(wf2); // undeprecated
        expect(desc2.deprecated).toBe(false);
    });

    it('should produce the same version for identical workflows', async () => {
        const registry = createRegistry();
        const wf1 = new Workflow('test');
        const desc1 = await registry.register(wf1, true);

        const registry2 = createRegistry();
        const wf2 = new Workflow('test');
        const desc2 = await registry2.register(wf2, true);

        expect(desc1.version).toBe(desc2.version);
    });

    it('should produce different versions for workflows with different custom properties', async () => {
        const registry = createRegistry();
        const wf1 = new Workflow('test');
        const desc1 = await registry.register(wf1, true);

        const wf2 = new Workflow('test');
        (wf2 as unknown as Record<string, unknown>).customProp = 'custom';
        const desc2 = await registry.register(wf2, true);

        expect(desc1.version).not.toBe(desc2.version);
    });

    // ----- getDesc -----

    it('should retrieve a descriptor by name (undeprecated)', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        const desc = await registry.register(wf);

        const retrieved = registry.getDesc('test');
        expect(retrieved).toBe(desc);
        expect(retrieved.name).toBe('test');
    });

    it('should retrieve a descriptor by name and version', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        const desc = await registry.register(wf);

        const retrieved = registry.getDesc('test', desc.version);
        expect(retrieved).toBe(desc);
    });

    it('should throw WorkflowNotFoundError for a non-existent workflow name', () => {
        const registry = createRegistry();
        expect(() => registry.getDesc('nonexistent')).toThrow(WorkflowNotFoundError);
    });

    it('should throw WorkflowNotFoundError for a non-existent version', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        await registry.register(wf);

        expect(() => registry.getDesc('test', '0000000000000000000000000000000000000000000000000000000000000000')).toThrow(
            WorkflowNotFoundError,
        );
    });

    it('should throw WorkflowNotFoundError when only deprecated versions exist and no version requested', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        await registry.register(wf, true);

        expect(() => registry.getDesc('test')).toThrow(WorkflowNotFoundError);
        expect(() => registry.getDesc('test')).toThrow(/undeprecated/);
    });

    it('should still find a deprecated descriptor by explicit version', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        const desc = await registry.register(wf, true);

        const retrieved = registry.getDesc('test', desc.version);
        expect(retrieved).toBe(desc);
        expect(retrieved.deprecated).toBe(true);
    });

    // ----- getCurrentVersion -----

    it('should return the version of the undeprecated workflow', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        const desc = await registry.register(wf);

        const version = registry.getCurrentVersion('test');
        expect(version).toBe(desc.version);
    });

    it('should return null if the workflow is not registered', () => {
        const registry = createRegistry();
        expect(registry.getCurrentVersion('nonexistent')).toBeNull();
    });

    it('should return null if all versions are deprecated', async () => {
        const registry = createRegistry();
        await registry.register(new Workflow('test'), true);
        expect(registry.getCurrentVersion('test')).toBeNull();
    });

    it('should return the undeprecated version when both deprecated and undeprecated exist', async () => {
        const registry = createRegistry();
        const desc1 = await registry.register(new Workflow('test'));
        const wf2 = new Workflow('test');
        (wf2 as unknown as Record<string, unknown>).customProp = 'v2';
        await registry.register(wf2, true);

        expect(registry.getCurrentVersion('test')).toBe(desc1.version);
    });

    // ----- methodInfos -----

    it('should yield nothing for a non-existent workflow name', () => {
        const registry = createRegistry();
        const results = [...registry.methodInfos('nonexistent', 'someMethod')];
        expect(results).toEqual([]);
    });

    it('should yield nothing for a non-existent method name', async () => {
        const registry = createRegistry();
        await registry.register(new Workflow('test'));
        const results = [...registry.methodInfos('test', 'nonexistentMethod')];
        expect(results).toEqual([]);
    });

    it('should yield nothing when no methods are collected (BeginMethod/EndMethod not yet ported)', async () => {
        const registry = createRegistry();
        await registry.register(new Workflow('test'));
        const results = [...registry.methodInfos('test', 'anyMethod')];
        expect(results).toEqual([]);
    });

    // ----- Edge cases -----

    it('should handle registering workflows with different names independently', async () => {
        const registry = createRegistry();
        const descA = await registry.register(new Workflow('workflowA'));
        const descB = await registry.register(new Workflow('workflowB'));

        expect(descA.name).toBe('workflowA');
        expect(descB.name).toBe('workflowB');
        expect(registry.getDesc('workflowA')).toBe(descA);
        expect(registry.getDesc('workflowB')).toBe(descB);
    });

    it('should handle a workflow name with special characters', async () => {
        const registry = createRegistry();
        const wf = new Workflow('my-workflow_2');
        const desc = await registry.register(wf);
        expect(desc.name).toBe('my-workflow_2');
    });

    it('should not mutate internal state when only reading descriptors', async () => {
        const registry = createRegistry();
        const wf = new Workflow('test');
        const desc = await registry.register(wf);

        // Multiple reads should return the same descriptor
        expect(registry.getDesc('test')).toBe(desc);
        expect(registry.getDesc('test', desc.version)).toBe(desc);
        expect(registry.getCurrentVersion('test')).toBe(desc.version);
    });
});
