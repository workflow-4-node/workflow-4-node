# Workflow 4 Node — Conversion To-Do

> Inventory of old (`_old_/lib/es6/`) modules that have **not yet** been converted to TypeScript (`src/`).

---

## Activities — Not Converted

These files from `_old_/lib/es6/activities/` have no corresponding `.ts` file in `src/activities/`:

| # | Old file | Description |
|---|----------|-------------|
| 1 | `beginMethod.js` | Begin method activity |
| 2 | `console.js` | Console logging activity |
| 3 | `consoleTracker.js` | Console activity state tracker |
| 4 | `delay.js` | Delay activity (time-based) |
| 5 | `delayTo.js` | Delay to specific time |
| 6 | `emit.js` | Emit event activity |
| 7 | `endMethod.js` | End method activity |
| 8 | `instanceData.js` | Instance data helper |
| 9 | `merge.js` | Merge activity |
| 10 | `method.js` | Method activity |
| 11 | `obj.js` | Object activity |
| 12 | `repeat.js` | Repeat activity |
| 13 | `resumeBookmark.js` | Resume bookmark activity |
| 14 | `waitForBookmark.js` | Wait for external event / bookmark |
| 15 | `workflow.js` | Workflow root activity |

### Activities — Already Converted ✅

`Activity`, `And`, `Assign`, `Block`, `Cancel`, `CancellationScope`, `Case`, `CustomActivity` (= old `Composite`), `Declarator`, `Default`, `Equals`, `Expression`, `Falsy`, `For`, `ForEach`, `Func`, `If`, `Not`, `NotEquals`, `Or`, `Parallel`, `Pick`, `Switch`, `Template`, `Throw`, `Truthy`, `Try`, `When`, `While`, `WithBody`.

Runtime infrastructure (`runtime/`): `ActivityExecutionContext`, `ActivityExecutionEngine`, `ActivityExecutionState`, `activityMarkup`, `ActivityStateTracker`, `ActivityStateTrackerWrapper` (new), `CallContext`, `ResumeBookmarkQueue`, `scope`, `ScopeNode`, `scopeSerializer`, `ScopeTree`, `templateHelpers` — all converted ✅

---

## Common Modules — Not Converted

| # | Old file | Description |
|---|----------|-------------|
| 1 | `asyncHelpers.js` | Bluebird coroutine helper + `aggressiveRetry` (partially covered by `promiseHelpers.ts` but missing `aggressiveRetry`) |
| 2 | `is.js` | Type check helpers (`is.activity()`, `is.template()`) using `instanceof` |

### Common Modules — Already Converted ✅

`constants`, `converters`, `enums`, `specStrings`, `simpleProxy` → `proxy.ts`, `errors.js` → `src/errors/*`.

---

## Hosting — Not Converted (Entire Module)

The old `hosting/` module has **no** corresponding `src/hosting/` directory:

| # | Old file | Description |
|---|----------|-------------|
| 1 | `index.js` | Hosting module exports |
| 2 | `instanceIdParser.js` | Instance ID parsing utilities |
| 3 | `instIdPaths.js` | Instance ID path helpers |
| 4 | `keepAlive.js` | Keep-alive mechanism |
| 5 | `keepLockAlive.js` | Keep-lock-alive mechanism |
| 6 | `knownInstaStore.js` | Known instance store |
| 7 | `memoryPersistence.js` | In-memory persistence |
| 8 | `wakeUp.js` | Wake-up mechanism |
| 9 | `workflowHost.js` | Workflow host |
| 10 | `workflowInstance.js` | Workflow instance |
| 11 | `workflowPersistence.js` | Workflow persistence interface |
| 12 | `workflowRegistry.js` | Workflow registry |

---

## Summary

| Category | Total old files | Not converted |
|----------|----------------|---------------|
| Activities | 40 files (incl. runtime) | **15 activities** |
| Common | 9 files | **2 modules** |
| Hosting | 12 files | **12 files (entire module)** |
