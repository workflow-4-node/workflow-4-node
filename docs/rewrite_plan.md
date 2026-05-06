# Rewrite Plan — Workflow 4 Node (v2)

## Goal

Port the old ES6 JavaScript implementation (`_old_/lib/es6/`) to modern strict TypeScript (`src/`), improving the design while preserving the core architecture.

## Dependency Graph Analysis

Based on a thorough read of the old ES6 codebase, here is the dependency chain from bottom (fewest dependencies) to top (most dependent). This informs the order in which modules should be ported.

### Legend

- **`→`** means "depends on"
- Files in **bold** are recommended first candidates
- `(common)` files are utilities/helpers

---

### Layer 0 — Common Utilities (no internal project deps)

These are pure utility modules. They are leaf nodes — no dependencies on activities or other project modules.

| File | Depends on | Notes |
|------|-----------|-------|
| `common/enums` | none | Activity states, workflow events — pure constants object |
| `common/constants` | none | String constants, markers |
| `common/errors` | `constants`, `util` | Custom Error subclasses: `Cancelled`, `Idle`, `ActivityRuntimeError`, `BookmarkNotFoundError`, `AggregateError`, `ValidationError`, `TimeoutError`, `WorkflowError` |
| `common/specStrings` | none (likely) | String spec patterns |
| `common/converters` | none (likely) | Type converters |
| `common/asyncHelpers` | none (likely) | Async utilities |
| `common/is` | `lodash`, circular ref to `activities/activity` | Type-checking helpers |
| `common/simpleProxy` | `lodash`, `better-assert` | Dynamic proxy emulation for scope access |

**Recommendation:** Port these first as a group — they have zero or near-zero inter-dependencies and are needed by everything else.

---

### Layer 1 — Standalone Classes (bottom of activity chain)

These are real classes with minimal dependencies. They don't depend on other activities.

| File | Depends on | Lines | Why port here |
|------|-----------|-------|---------------|
| **`ActivityStateTracker`** | none | ~20 | Zero-dependency wrapper class. Dead simple. |
| **`ActivityExecutionState`** | `events`, `util`, `enums`, `is`, `lodash` | ~80 | Real class with clear responsibility (tracks activity execution state). Has serialization (`asJSON`/`fromJSON`). Needed by `ActivityExecutionContext` and `ActivityExecutionEngine`. |
| **`ScopeNode`** | `util`, `lodash`, `is`, `assert` | ~100 | Self-contained tree node class. Manages parent/child relationships in the scope tree. No activity dependency. |
| `CallContext` | `common/is`, `lodash` | ~150+ | Heavily used by every activity. Bridges activities to the execution context. |
| `scope` (factory) | `lodash`, `simpleProxy` | ~80 | Scope proxy factory. No activity dependency. |
| `ResumeBookmarkQueue` | ? | ? | Bookmark queue for resuming activities. |
| `scopeSerializer` | ? | ? | Serialization of scope tree nodes. |

---

### Layer 2 — Base Activity Classes

| File | Depends on | Notes |
|------|-----------|-------|
| **`Activity`** | `constants`, `errors`, `enums`, `lodash`, `specStrings`, `is`, `CallContext`, `uuid`, `asyncHelpers`, `SimpleProxy` | **The foundation.** Every activity inherits from this. Large file (~300+ lines). Complex but fundamental. |
| `Expression` | `Activity`, `lodash`, `errors` | Evaluates JS expressions strings. Small extension of Activity. |
| `Declarator` | `Activity`, `is`, `lodash` | Adds variable declaration support on top of Activity. |
| `Block` | `Declarator`, `Activity` | Sequential execution of child activities. |
| `WithBody` | `Activity`, `Block`, `lodash` | Base for activities with a body (loops, etc.). |
| `Composite` | ? | Base for composite activities that build implementations from markup. |

---

### Layer 3 — Execution Infrastructure

| File | Depends on | Notes |
|------|-----------|-------|
| `ActivityExecutionContext` | Many | The core execution context. Manages states, bookmarks, scope tree. |
| `ScopeTree` | `ScopeNode`, many | Tree of scopes for variable resolution. |
| `ActivityExecutionEngine` | Almost everything | The top-level engine that drives execution. |

---

### Layer 4 — Simple Leaf Activities

These extend `Activity` (or a subclass) with minimal additional logic. They are good candidates to port once `Activity` is done.

| File | Extends | Depends on (beyond Activity) |
|------|---------|------------------------------|
| `Cancel` | `Activity` | `errors` |
| `Emit` | `Activity` | `lodash` |
| `Equals` | `Activity` | none extra |
| `Truthy` | `Activity` | none extra |
| `Falsy` | `Activity` | none extra |
| `InstanceData` | `Activity` | none extra |
| `Obj` | `Activity` | `lodash` |
| `Not` | `Activity` | `lodash` |
| `Throw` | `Activity` | `errors`, `lodash` |
| `NotEquals` | ? (likely `Equals`) | — |

---

### Layer 5 — Composite / Complex Activities

| File | Extends | Notes |
|------|---------|-------|
| `If` | Activity or WithBody | Conditional |
| `While` | WithBody | Loop |
| `For` | WithBody | Numeric for-loop |
| `ForEach` | WithBody | Array iteration |
| `Switch` | Activity | Switch/case |
| `Parallel` | Activity | Parallel execution |
| `Pick` | Activity | Race/select |
| `Try` / `Throw` / `CancellationScope` | Activity | Error handling |
| `Delay` / `DelayTo` | Activity | Timer/sleep |
| `Repeat` | WithBody | Repeat-until |
| `Method` | Composite | Wraps begin/end method pattern |
| `BeginMethod` / `EndMethod` | Activity | Async method invocation |
| `Func` | Activity | Function invocation |
| `Merge` | Activity | Merge results |
| `Assign` | Activity | Variable assignment |
| `Template` | Activity | Markup template |
| `Workflow` | ? | Root workflow definition |

---

## Recommended Porting Order

```
Phase 0 — Common utilities
  └─ common/enums, constants, errors, specStrings, converters, asyncHelpers, is, simpleProxy

Phase 1 — Standalone infrastructure classes
  └─ ActivityStateTracker  (zero deps)
  └─ ActivityExecutionState  (only common deps)
  └─ ScopeNode  (only common deps)
  └─ scopeSerializer
  └─ ResumeBookmarkQueue
  └─ scope (factory)
  └─ CallContext

Phase 2 — Base activity class
  └─ Activity  (the big one — everything depends on it)

Phase 3 — Activity subclasses & Declarator hierarchy
  └─ Expression
  └─ Declarator → Block → WithBody → Composite

Phase 4 — Execution engine
  └─ ScopeTree
  └─ ActivityExecutionContext
  └─ ActivityExecutionEngine

Phase 5 — Simple leaf activities
  └─ Cancel, Emit, Equals, Truthy, Falsy, InstanceData, Obj, Not, Throw, NotEquals

Phase 6 — Composite / complex activities
  └─ If, While, For, ForEach, Switch, Parallel, Pick, Try, CancellationScope,
     Delay, DelayTo, Repeat, Method, BeginMethod, EndMethod, Func, Merge,
     Assign, Template, Workflow, etc.

Phase 7 — Hosting layer
  └─ WorkflowHost, WorkflowInstance, WorkflowRegistry, etc.
```

---

## First Candidate Recommendation

**`ActivityExecutionState`** is the best candidate to port first:

1. **Real class** — not a utility. Has a clear responsibility: tracking an activity's execution state (`run`, `complete`, `cancel`, `fail`, `idle`).
2. **Minimal dependencies** — only `events` (Node built-in), `util`, `enums`, `is`, `lodash`. All are either Node built-ins or simple common modules that can be ported first.
3. **Bottom of the dependency chain** — `ActivityExecutionContext` and `ActivityExecutionEngine` both depend on it. Nothing depends on activities.
4. **Small and focused** — ~80 lines, manageable first port.
5. **Has real functionality** — state tracking, event emission, serialization (`asJSON`/`fromJSON`).

**If starting even simpler:** `ActivityStateTracker` has zero dependencies and is only ~20 lines.
