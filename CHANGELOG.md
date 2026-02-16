# BringID

## 0.4.1-beta

- Fixed iframe `url` query parameter to use `window.location.origin` instead of `window.location.href` to avoid leaking path and query string to the widget

## 0.4.0-beta

- **Breaking:** `BringID` constructor now requires `appId` — `new BringID({ appId: "1" })`
- **Breaking:** `verifyProofs` result shape changed from `points` to `score` — `{ verified, score: { total, groups } }` where groups contain `score` instead of `points`
- **Breaking:** `verifyProofs` now requires a `provider` — removed off-chain API verification mode
- **Breaking:** `verifyHumanity` replaced `scope` parameter with `contract` (0x address string) and `context` (number, defaults to 0)
- **Breaking:** `BringIDModal` removed `mode` prop — mode and appId are now passed from SDK to widget automatically via postMessage
- `verifyProofs` accepts optional `context` (number, defaults to 0) and `contract` (0x address string, defaults to registry address) parameters for on-chain scope verification
- `verifyProofs` now calls registry `verifyProofs` and scorer `getScores` directly instead of using Multicall3
- `TSemaphoreProof` type now includes `app_id` field
- `BringIDModal` added `customTitles` prop for overriding widget UI titles (`pointsTitle`, `pointsShortTitle`, `scoreTitle`)
- `BringIDModal` iframe sandbox updated to include `allow-popups-to-escape-sandbox` and `allow-modals`
- Added `SCORER_ABI` with `getScore` and `getScores` methods
- Updated `REGISTRY_ABI` with `verifyProofs`, `getScore`, and `apps` methods
- Added `setMode`, `setAppId`, `getAppId` methods to `BringID` class
- Simplified internal request handling from map-based to single pending request
- Removed `fetchTasksConfig` utility and tasks config dependency
- Removed `generateId` utility and `requestId` from message protocol

## 0.3.1-beta

- Added message property for `verifyHumanity` request

## 0.3.0-beta

- **Breaking:** `verifyProofs` now returns `{ verified, points }` instead of `boolean`
  - `verified` — boolean indicating if proofs are valid
  - `points.total` — total points across all credential groups
  - `points.groups` — array of `{ credential_group_id, points }` for each proof
- Removed unused type definitions

## 0.2.1-beta

- Added minor UI fixes

## 0.2.0-beta

- Added dev.widget support

## 0.1.7-beta

- Node.js support - SDK can now be used in Node.js environments without React dependency
- `verifyProofs` method for validating semaphore proofs via API or on-chain
- Import structure updated: `BringIDModal` is now imported from `bringid/react`
- Minor improvements and bug fixes
