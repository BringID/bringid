# BringID

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
