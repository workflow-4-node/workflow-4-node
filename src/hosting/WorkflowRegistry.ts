import assert from 'assert';
import { createHash } from 'node:crypto';
import { Activity } from '../activities/Activity.js';
import { BeginMethod } from '../activities/BeginMethod.js';
import { EndMethod } from '../activities/EndMethod.js';
import type { Workflow } from '../activities/Workflow.js';
import { ValidationError } from '../errors/ValidationError.js';
import { WorkflowNotFoundError } from '../errors/WorkflowNotFoundError.js';
import { DefaultSerializer } from '../serialization/DefaultSerializer.js';
import type { Serializer } from '../serialization/Serializer.js';
import { ActivityExecutionContext } from '../activities/runtime/ActivityExecutionContext.js';
import { activityMarkup } from '../activities/runtime/activityMarkup.js';

export type MethodInfo = {
    name: string;
    version: string;
    canCreateInstance: boolean;
    instanceIdPath: string | null;
    execContext: ActivityExecutionContext;
};

export type WorkflowDescriptor = {
    name: string;
    version: string;
    deprecated: boolean;
    execContext: ActivityExecutionContext;
    methods: Map<string, MethodInfo>;
};

export class WorkflowRegistry {
    constructor(serializer?: Serializer) {
        this.serializer = serializer ?? new DefaultSerializer();
    }

    private readonly workflows = new Map<string, Map<string, WorkflowDescriptor>>();
    private readonly serializer: Serializer;

    async register(workflow: Workflow, deprecated = false): Promise<WorkflowDescriptor> {
        const name = workflow.name?.trim();
        if (!name) {
            throw new ValidationError('Workflow name is required and must be a non-empty string.');
        }

        const execContext = new ActivityExecutionContext();
        await execContext.initialize(workflow);

        const version = await this.computeVersion(execContext);
        let entry = this.workflows.get(name);

        if (entry) {
            const existing = entry.get(version);
            if (existing) {
                throw new ValidationError(`Workflow ${name} (${version}) already registered.`);
            }

            if (!deprecated) {
                for (const desc of entry.values()) {
                    if (!desc.deprecated) {
                        throw new ValidationError(`Workflow ${name} (${version}) has an already registered undeprecated version.`);
                    }
                }
            }

            const desc = await this.createDescriptor(execContext, name, version, deprecated);
            entry.set(version, desc);
            return desc;
        }

        entry = new Map();
        const desc = await this.createDescriptor(execContext, name, version, deprecated);
        entry.set(version, desc);
        this.workflows.set(name, entry);
        return desc;
    }

    getDesc(name: string, version?: string): WorkflowDescriptor {
        const entry = this.workflows.get(name);
        if (!entry) {
            throw new WorkflowNotFoundError(`Workflow ${name} has not been registered.`);
        }

        if (version !== undefined) {
            const desc = entry.get(version);
            if (desc) {
                return desc;
            }
            throw new WorkflowNotFoundError(`Workflow ${name} of version ${version} has not been registered.`);
        }

        for (const desc of entry.values()) {
            if (!desc.deprecated) {
                return desc;
            }
        }

        throw new WorkflowNotFoundError(`Workflow ${name} hasn't got an undeprecated version registered.`);
    }

    getCurrentVersion(workflowName: string): string | null {
        const entry = this.workflows.get(workflowName);
        if (!entry) {
            return null;
        }

        for (const desc of entry.values()) {
            if (!desc.deprecated) {
                return desc.version;
            }
        }

        return null;
    }

    *methodInfos(workflowName: string, methodName: string): Generator<MethodInfo> {
        const entry = this.workflows.get(workflowName);
        if (entry) {
            for (const desc of entry.values()) {
                const info = desc.methods.get(methodName);
                if (info) {
                    yield info;
                }
            }
        }
    }

    private async createDescriptor(
        execContext: ActivityExecutionContext,
        name: string,
        version: string,
        deprecated: boolean,
    ): Promise<WorkflowDescriptor> {
        return {
            name,
            version,
            deprecated,
            execContext,
            methods: await this.collectMethodInfos(execContext, version),
        };
    }

    private async collectMethodInfos(execContext: ActivityExecutionContext, version: string): Promise<Map<string, MethodInfo>> {
        const infos = new Map<string, MethodInfo>();
        const workflow = execContext.rootActivity;
        const children = await workflow.children(execContext);

        for (const child of children) {
            const isBM = child instanceof BeginMethod;
            const isEM = child instanceof EndMethod;
            if (isBM || isEM) {
                const methodName = typeof child.methodName === 'string' ? child.methodName.trim() : null;
                const instanceIdPath = typeof child.instanceIdPath === 'string' ? child.instanceIdPath.trim() : null;
                if (methodName) {
                    let info = infos.get(methodName);
                    if (!info) {
                        info = {
                            name: methodName,
                            version,
                            canCreateInstance: false,
                            instanceIdPath: null,
                            execContext,
                        };
                        infos.set(methodName, info);
                    }
                    if (isBM && child.canCreateInstance) {
                        info.canCreateInstance = true;
                    }
                    if (instanceIdPath) {
                        if (info.instanceIdPath) {
                            if (info.instanceIdPath !== instanceIdPath) {
                                throw new ValidationError(
                                    `Method '${methodName}' in workflow '${(workflow as Workflow).name}' has multiple different instanceIdPath value which is not supported.`,
                                );
                            }
                        } else {
                            info.instanceIdPath = instanceIdPath;
                        }
                    }
                }
            }
        }

        const result = new Map<string, MethodInfo>();
        for (const [key, info] of infos.entries()) {
            if (info.instanceIdPath) {
                result.set(key, info);
            }
        }
        return result;
    }

    private async computeVersion(execContext: ActivityExecutionContext): Promise<string> {
        const sha = createHash('sha256');
        const workflow = execContext.rootActivity;
        const add = (value: unknown): void => {
            if (value !== null) {
                sha.update(this.serializer.toJSON(value));
            }
        };
        for (const activity of await workflow.all(execContext)) {
            const alias = activityMarkup.getAlias(activity);
            assert(alias);
            add(alias);
            for (const key of Object.keys(activity)) {
                if (!activity.hideFromScopeProperties.has(key) && !activity.nonSerializedProperties.has(key)) {
                    const value = (activity as unknown as Record<string, unknown>)[key];
                    if (!(value instanceof Activity)) {
                        if (Array.isArray(value)) {
                            for (const item of value) {
                                if (!(item instanceof Activity)) {
                                    add(value);
                                }
                            }
                        } else {
                            add(value);
                        }
                    }
                }
            }
        }
        return sha.digest('hex');
    }
}
