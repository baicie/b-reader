# Zeus and zeus-ui migration plan

## Decision

Do not replace every Vue webview in one change. Use a staged migration:

1. Keep Vue as the production host and validate zeus-ui Web Components in one
   low-risk webview.
2. Build one isolated Zeus TSX webview that exercises VS Code messaging,
   localization, theme tokens, lists, conditional rendering, and disposal.
3. Migrate the remaining webviews only after the proof of concept passes the
   compatibility gates below.
4. Remove Vue and Ant Design only after every production entry has moved and
   the extension package no longer contains their vendor chunks.

This is a framework migration, not a dependency rename. The six Vite HTML
entries share Vue stores, Vue I18n, Ant Design components, and the VS Code
webview message protocol. Rewriting them together would make regressions hard
to isolate and would prevent a useful rollback.

## Evidence baseline

The assessment uses the checked-out upstream repositories and b-reader at the
following revisions:

| Project | Revision/version | Contract inspected |
| --- | --- | --- |
| b-reader | `df97c92` | `packages/client`, `packages/extension`, workspace manifests |
| baicie/zeus | `9af8ae8`, `0.1.0-beta.8` | `docs/api/packages.md`, package exports and examples |
| baicie/zeus-ui | `4528c68`, workspace `0.1.0-beta.0` | package exports, registry, Vue/native examples |

The published Zeus API to target is the unified `@zeus-js/zeus` entry. The
required APIs for the proof of concept are `render`, `state`, `computed`,
`effect`, `Show`, `For`, and the disposer returned by `render`. TSX is compiled
with `@zeus-js/vite-plugin`; importing compiler/runtime internals is out of
scope.

zeus-ui has two different consumption models:

- `@zeus-web/ui` exposes styled native Web Components. Its current aggregate
  entry documents `zw-button` and `zw-input`.
- The registry contains Zeus TSX source components such as button, card,
  dialog, tabs, select, checkbox, and collapsible. Registry source is owned by
  the consuming application after it is copied.
- `@zeus-web/vue` wraps primitives for an incremental Vue-hosted migration.

The registry and native packages are not interchangeable. A component is not
considered covered until the exact chosen entry point is built and tested in a
VS Code webview.

## Current client surface

The client builds six production webview entries from `packages/client/html`:
bookself, common-reader, reader, search-online, sliderbar, and welcome. Their
extension boundary is `acquireVsCodeApi()` plus `window` message events.

Current Ant Design usage and migration status:

| Existing surface | Used by | zeus-ui status | Migration action |
| --- | --- | --- | --- |
| Button/ButtonGroup | welcome, sliderbar, reader, bookself | Button is available; group is not | Use button and a local flex toolbar |
| Card/CardMeta | bookself | Registry card exists | Validate registry card in Zeus POC; keep local metadata markup |
| Row/Col | bookself | No layout component required | Replace with responsive CSS grid |
| Tree | reader, common-reader | No equivalent found | Implement an accessible reader-specific chapter tree before migration |
| Layout/Header/Sider/Content | reader container | No equivalent required | Replace with semantic elements and CSS grid |
| Affix | reader container | No direct equivalent found | Use sticky positioning and verify webview scrolling |
| Dropdown | reader container | Registry primitives do not provide the current contract | Compose dialog/popover behavior only after keyboard tests exist |
| InputNumber | reader container | Input exists, number control contract is incomplete | Build a local labeled numeric control |
| InputSearch | search-online | Input exists, search wrapper is absent | Compose input and button with submit semantics |
| Table | search-online | Advanced data-grid exists but is not a drop-in table | Keep Ant Table initially or implement the small result table locally |
| ConfigProvider/theme/locale | all pages | No drop-in provider | Map VS Code and app theme values to CSS custom properties; keep i18n separate |
| message toast | reader | No confirmed equivalent | Implement a webview-local live-region notification service |
| Arrow icons | reader | zeus-ui icons package exists | Validate named exports, focus labels, and bundle size in POC |

Tree navigation is the main functional blocker. It must preserve nested EPUB
navigation, current selection, keyboard traversal, focus visibility, and
activation. A flat list that merely looks similar is not an acceptable
replacement.

## Compatibility gates

### Toolchain

- b-reader currently declares Node `>=24.0.0`.
- `@zeus-js/vite-plugin@0.0.2` declares Node
  `^22.18.0 || >=24.11.0`.
- Before adding the plugin, raise the workspace Node floor to `>=24.11.0` and
  run the frozen-lockfile install and complete `pnpm check` on that runtime.
- Pin Zeus and zeus-ui beta versions exactly during the POC. Both projects are
  beta and may intentionally make breaking API changes.

### VS Code webview

The POC must prove all of the following in an actual extension webview:

- no `eval`, inline-script, or remote-resource requirement that violates the
  generated CSP;
- assets resolve through the extension's webview URI conversion;
- `acquireVsCodeApi()` is called exactly once and state survives a hidden/reopen
  cycle where expected;
- inbound and outbound message payloads remain compatible with the extension;
- the render disposer removes event listeners and reactive effects;
- production chunks load without Vue globals or browser-only assumptions that
  fail under VS Code's Electron runtime.

### Product behavior

- Keyboard-only operation and visible focus for every control.
- Nested chapter navigation and selected chapter state.
- Light and dark VS Code themes with readable contrast.
- Chinese and English labels without clipping.
- No regression in EPUB import, opening, chapter changes, previous/next, font
  settings, search, or bookshelf navigation.
- Record raw and gzip bundle sizes per entry before and after migration.

## Proof-of-concept scope

Use a new, non-production `zeus-poc.html` Vite entry first. It should reuse the
real app-to-extension message adapter but must not replace an existing command.
The page contains:

- a zeus-ui button and card;
- a Zeus `state` value and `Show`/`For` rendering;
- a nested sample chapter list using the proposed chapter-tree API;
- theme token handling;
- one request and one response through the VS Code message boundary;
- explicit disposal tests.

The POC is successful only when typecheck, production build, unit tests, VSIX
packaging, and an extension-host smoke test pass. If a published package cannot
be installed reproducibly, do not substitute local workspace links in the
production lockfile; record the upstream release blocker instead.

## Delivery sequence

| Phase | Branch/PR boundary | Result |
| --- | --- | --- |
| 0 | `docs/zeus-migration-plan` | This evidence-based plan and component matrix |
| 1 | `feat/zeus-webview-poc` | Isolated TSX entry, exact pinned packages, compatibility tests and measurements |
| 2 | `feat/zeus-ui-vue-slice` | Optional native/Vue zeus-ui use in a low-risk production page |
| 3 | `feat/reader-navigation` | Framework-neutral, accessible chapter tree and message adapter |
| 4 | One branch per webview | Migrate welcome, sliderbar, bookself, search, reader pages in increasing complexity |
| 5 | `refactor/remove-vue-antd` | Remove Vue, Vue I18n, Ant Design, plugins, theme adapters and vendor chunks |

Each phase is squash-merged only after its own tests and the workspace
`pnpm check` pass. EPUB parser work stays on separate branches because its
runtime contract can be reviewed and released independently from UI migration.

## Stop conditions

Pause expansion beyond the POC if any of these remain unresolved:

- the pinned Zeus packages are unavailable from the configured registry;
- Node `>=24.11.0` cannot be used in local development and CI;
- compiler output violates the VS Code webview CSP;
- nested tree accessibility requires unsupported runtime behavior;
- the beta API requires application code to import undocumented internals;
- combined Vue and Zeus runtime cost is unacceptable for the chosen staged
  production page.

## Current verification note

The configured npm mirror currently fails to fetch `@zeus-js/zeus@0.1.0-beta.8`
(`ERR_PNPM_META_FETCH_FAIL`). Until the exact package is available, the POC
must remain isolated and the migration must not change production dependencies.
