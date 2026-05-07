export enum AactivityStates {
    run = 'run',
    end = 'end',
    complete = 'complete',
    cancel = 'cancel',
    idle = 'idle',
    fail = 'fail',
}

export enum WorkflowEvents {
    start = 'start',
    invoke = 'invoke',
    end = 'end',
    warn = 'warn',
    workflowEvent = 'workflowEvent',
}

export enum Events {
    workflowEvent = 'workflowEvent',
}
