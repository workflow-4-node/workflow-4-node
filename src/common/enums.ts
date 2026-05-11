export enum ActivityState {
    run = 'run',
    end = 'end',
    complete = 'complete',
    cancel = 'cancel',
    idle = 'idle',
    fail = 'fail',
}

export enum WorkflowEvent {
    start = 'start',
    invoke = 'invoke',
    end = 'end',
    warn = 'warn',
    workflowEvent = 'workflowEvent',
}

export enum Events {
    workflowEvent = 'workflowEvent',
}
