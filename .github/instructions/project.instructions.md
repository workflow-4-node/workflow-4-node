---
description: Workflow 4 Node
applyTo: '**/*.*'
---

Node.js version of the old .NET Workflow Foundation 4.

The main idea is to have a workflow engine that can execute a workflow defined in JSON or by code. The workflow can be defined using a visual designer or by writing JSON / code directly. The workflow engine will execute the workflow and provide the necessary context for each step.

A workflow execution engine will be stateless and will be able to execute multiple workflows concurrently and by horizontal scaling. A workflow can be suspended by waiting-for-event activities like Timer, WaitForExternalEvent. A workflow can be seen as a stateless, horizontally scaled state machine.

# TypeScript

- Project is written in strict TypeScript.
- We use eslint with the recommended rules and some very small additional rules.
- We use prettier for code formatting, integrated with eslint.
- File layout: one main export per file, file name should be the same as the main export with the same casing. Additional types can be exported from the same file if they are closely related to the main export.
- Class layout:
  - constructor
  - private, protected fields, getters and setters
  - public fields, getters and setters
  - public methods
  - protected methods
  - private methods
- Utility functions are exported as a part of an exported object, the file name should be the same as the object name. For example, if we have a file `utils.ts` that exports an object: `export const utils = { fn1, fn2 }`.
- File structure: we put exported stuff at the top of the file, and move utility functions to the bottom in order of importance.

# _old_

We have an old version in place. It's from an 11-year-old project written in JS. We will keep it as a reference and we will rewrite it in TypeScript. The old version is not maintained and it's not used in production, so we can take our time to rewrite it and improve it.