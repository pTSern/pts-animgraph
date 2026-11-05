# `pts-animgraph` — Runtime Animation Graph Inspector for Cocos Creator

> **Author**: `pTSern`  
> **Version**: `1.0.0`  
> **Target Engine**: Cocos Creator `>= 3.8.8`  
> **Category**: Editor Extension & Animation Tooling  
> **Hard Dependency**: `pts-core`

---

## 1. Overview

`pts-animgraph` extends Cocos Creator's property inspector with a **live runtime diagnostics console** for `.animgraph` assets. In native Cocos Creator, inspecting an `.animgraph` asset shows only an authoring header and an **[Edit]** button.

`pts-animgraph` activates during gameplay preview, enabling:

**Runtime instances:** The Controller dropdown lists every controller referencing the selected graph. Labels and hover tooltips contain the owning node's full hierarchy path. Selection identity is the controller component UUID, not its path or the graph asset UUID. Inspector and dock selections are independent.

The first available controller is selected initially. If the selected controller disappears or has not initialized its evaluator, the view waits without silently selecting another controller. Changes affect preview memory only; they do not save the graph asset.

1. **Live Variables (R/W)**: Inspection and live editing for `Float`, `Integer`, `Boolean`, and `Trigger` variables. Edits target only the selected `AnimationController`. Vector and quaternion variables are read-only.
2. **Layers & Interactive Graph Canvas**:
   - Layer selector dropdown (`Enum`-style) driving active layer view.
   - Editable weight for the selected instance's layer, limited to `[0, 1]`.
   - Separate root and nested state-machine graph cards with breadcrumb paths. Each card contains only its own states and transitions, addressed by reference identity rather than repeated display names.
   - Compact, automatically centered overviews fit the panel width. Large unused coordinate gaps are compressed in display copies; the graph asset's authored positions are not changed. No zooming or panning is required to see the whole machine.
   - Active states use a steady green outline; active ancestor submachines use a dashed outline. Selection uses a distinct cyan outline.
   - Click a transition arrow to highlight it and open its read-only conditions panel below the graph cards. The panel shows endpoints, timing/exit configuration, all conditions, nested variable bindings, and known operator enum labels.
   - Transition properties use the State panel's aligned property rows and read-only typed controls: number fields, checkboxes, enum selections, and text inputs. Nested bindings remain grouped beneath their parent fields; enum tooltips retain the underlying numeric value.
   - Conditions within one transition are combined with AND. The panel distinguishes empty condition lists from enabled exit-time gates. It shows configured rules, not live pass/fail results; engine transition ordering still applies.
3. **State Details Card**:
   - Conditional rendering: only appears when a state node on the canvas is clicked/selected.
   - Inspects motion speed, speed multiplier, and bound animation clips.
   - Displays available live state-component values from the selected controller. Missing runtime values are explicitly marked unavailable rather than replaced with authoring defaults.
4. **Component Script Code Viewer**:
   - Renders the syntax-highlighted TypeScript source code of the selected state component directly in the Inspector.
   - Progress-only updates retain graph nodes, property widgets, and source content. Source is requested when the component selection changes, not on every live tick. Focused variable inputs are not overwritten by incoming telemetry.
5. **Dual Surface (Inspector Section + Dockable Panel)**:
   - **Inspector Section**: Mounts on the `animation-graph` asset importer during preview. Outside preview, Creator's native authoring Inspector and Edit action remain unchanged.
     Creator's filename header is reused; the extension does not add a duplicate filename row in native Inspector.
   - **Dockable Panel**: Open via **Extension -> pTS-AnimGraph -> Open Panel**; choose an asset, then a runtime controller. Live controls appear only during preview.
6. **Bottom Edit Button**: Launches Creator's native Animation Graph editor panel.

---

## 2. Process Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Editor / Main Process                    │
│                                                             │
│  ┌────────────────────────┐      ┌───────────────────────┐  │
│  │ Inspector Section      │      │ Dockable Panel        │  │
│  │ (dist/animgraph.js)    │      │ (dist/panel.js)       │  │
│  └───────────┬────────────┘      └───────────┬───────────┘  │
│              │                               │              │
│              ▼                               ▼              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Broker IPC (dist/main.js)                             │  │
│  │ - Session management & observer lifecycle             │  │
│  │ - Directed Electron IPC transport to Game View        │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Directed Electron IPC
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Game View Process                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ pts-core Bridge (extensions/pts-core/src/_cc.js)      │  │
│  │ - Locates active AnimationController playing graph    │  │
│  │ - Reads _graphEval, live variables, layer weights     │  │
│  │ - Reads active state path (__DEBUG_ID__) & components │  │
│  │ - Mutates controller via setValue & setLayerWeight    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Extension Configuration & IPC Messages

### 3.1. Messages

| Message | Type | Description |
|:---|:---|:---|
| `open-panel` | Send | Opens the standalone dockable Animation Graph inspector panel. |
| `reload` | Send | Refreshes current observations and re-requests the preview session. |
| `observe-animgraph` | Request | Observes `{observerId, uuid, instanceId?}`; returns graph data, available controllers, effective instance ID, and a subscription token. |
| `unobserve-animgraph` | Send | Releases observation subscription for an observer. |
| `set-animgraph-variable` | Send | Mutates a variable for the exact `{observerId, uuid, subscriptionId, instanceId}` observation. |
| `set-animgraph-layer-weight` | Send | Changes the selected instance's layer weight using the same observation identity. |
| `log-animgraph-runtime` | Send | Logs the exact observed controller and evaluator in the preview console. |
| `get-component-script` | Request | Resolves and reads the `.ts` source file corresponding to a state component class. |

Runtime telemetry arrives through native Electron `pts-animgraph:sync-animgraph` IPC. The broker verifies preview sender, session, graph, subscription, and controller identity before broadcasting to views. This channel is not exposed as a senderless extension Message command.

---

## 4. Coding Standards

* Manifest declarations use package name `pts-animgraph` and author `pTSern`.
* Script identifiers using the project prefix use `pTS`, never `pts` or `PTS`. Package names, JSON keys, and filesystem paths may use `pts`.

## 5. Change Notes

### Complete runtime state component property coverage

- Preserved all `@property` and `@editor_property` state component declarations in runtime mode, including fields declared after `onStateMachineEnters` (`onStateMachineExits`, `tracers`) and declared fields with leading underscores (`_activeController`, `_isStateActive`, `_stateEnterTime`, `_lastReplayTime`, `_cachedDuration`).
- Updated `_pTS_extractLiveComponents` in `pts-core` (`_cc.js`) to extract declared CCClass and editor properties rather than filtering with `!k.startsWith('_')`, with reference serialization enabled for live `Component` / `Node` targets (`_activeController`) and declared attribute metadata (`type`, `min`, `tooltip`, `readonly`, `group`).
- Enriched authored dump parsing (`main.ts`) with scene-script component reflection when available, and resolved authoring JSON properties without dropping valid underscored properties.
- Updated the Inspector state details view (`animgraph.ts`) to form a complete property union of authored and live properties for each component, formatted runtime component/node references cleanly, and maintained DOM stability across live telemetry ticks.
- Added `scripts/test-state-components.js` regression test covering complete property preservation and internal engine field exclusion.

### Stable rendering, compact subgraphs, and transition conditions

- Replaced flattened nested graphs and name-based endpoints with scoped state-machine records and exact state/transition identities. Parallel arrows remain independently selectable.
- Retained SVG, state controls, source viewer, and transition panel across live progress updates. Selected live values patch existing controls without resetting scroll or input focus.
- Added compact automatic overview framing, steady active-state highlighting, transition hit areas, and read-only condition details. Removed the duplicate native Inspector filename row; retained the dockable panel heading.
- Updated both disk and native scene-script dump producers. Added `scripts/test-graph-hierarchy.js` covering repeated names/copied authoring IDs, nested/empty scopes, local endpoints, self-transitions, parallel transition identity, and resolved condition bindings.

Actual Editor Game View verification on `Borrum_Fighting_Graph`: two scoped graphs (6 states each), correct local edges, fully visible overviews at Inspector width without horizontal overflow, native mouse selection of `Any → death` showing `state == 7`, trigger conditions and exit-time gates, retained live state controls, protected focused variable input, and independent dockable rendering.

A selected-state 1.8-second live sample previously rebuilt graph/details 9 times each and replaced source text 18 times. The updated view produced zero such replacements, retained the selected controls, and kept Inspector scroll at the same position. The selected transition condition panel likewise retained its DOM during live updates.

Verification commands:

```sh
node extensions/pts-asset/node_modules/typescript/bin/tsc --project extensions/pts-animgraph/tsconfig.json
node --check extensions/pts-core/src/_cc.js
node extensions/pts-animgraph/scripts/test-graph-hierarchy.js
node extensions/pts-asset/scripts/test-preview-subscriptions.js
node extensions/pts-asset/scripts/test-query-isolation.js
```


### Runtime instance selection and native Inspector routing

- Replaced first-controller lookup with selected-graph controller discovery and exact-instance observation/edit targeting.
- Corrected native Inspector registration from `animgraph` to the verified importer key `animation-graph`.
- Separated view lifecycles; switching, unselecting, hiding, and closing release old observations. Stale edits are rejected.
- Kept instance/layer dropdown options stable across unchanged telemetry updates.
- Corrected Creator 3.8.8 variable type IDs and live state-component debug-path lookup.

Verified in actual Editor Game View with two disposable controllers sharing one graph: distinct values and paths, independent Inspector/dock selections, isolated variable and weight writes, an unevaluated controller, selected-controller destruction, stale-edit rejection, and observation release/reopen. Fixtures were removed without changing graph or scene asset files. Extension TypeScript compilation, core bridge syntax checking, and existing `pts-asset` subscription/query-isolation checks passed.
