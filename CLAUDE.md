# BringID SDK - Project Documentation

## Project Overview

**BringID SDK** is a TypeScript client library (`bringid` on npm) that enables developers to verify humanity and request reputation scores in Next.js or Node.js applications. The SDK provides a `BringID` class for core logic and a `BringIDModal` React component for the verification UI flow.

### Purpose

The SDK provides three main capabilities:

- **Reputation Scoring**: Get a reputation score (0-100) for any Ethereum address via the BringID API
- **Humanity Verification**: Open a verification modal that guides users through identity proofs using Semaphore protocol, returning cryptographic proofs and humanity points
- **Proof Verification**: Verify Semaphore proofs on-chain (via Registry + Scorer contracts), returning verification status and score breakdown

### Technology Stack

- **Language**: TypeScript
- **Bundler**: Webpack 5
- **UI Framework**: React 19 (peer dependency)
- **Styling**: styled-components v6
- **State Management**: Redux + Redux Thunk
- **Cryptography**: @semaphore-protocol/core & @semaphore-protocol/identity v4
- **Blockchain**: Ethers.js v6 (for on-chain proof verification)
- **Testing**: Mocha + Chai
- **Build**: Webpack + TypeScript declaration emitter

### Architecture

The SDK is split into two entry points:

```
┌─────────────────────────────────────────┐
│         Entry Points                    │
│  "bringid"       → src/index.ts         │
│  "bringid/react" → src/react-entry.ts   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Modules                         │
│  BringID      (bring-id-sdk)            │
│  BringIDModal (bring-id-modal)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services                        │
│  API Layer (api/)                       │
│  Utils (utils/)                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         External Services               │
│  BringID API (api.bringid.org)          │
│  BringID Widget (widget.bringid.org)    │
│  GitHub Configs (BringID/configs repo)  │
│  On-chain contracts (Registry/Scorer)   │
└─────────────────────────────────────────┘
```

### Key Components

1. **BringID Class** (`src/modules/bring-id-sdk/index.ts`): Main SDK class providing `getAddressScore()`, `verifyHumanity()`, and `verifyProofs()` methods. Requires `appId` at construction. Communicates with the modal via `window.postMessage`. Provides `setMode()`, `setAppId()`, `getAppId()`, and `getMode()` for runtime configuration.

2. **BringIDModal Component** (`src/modules/bring-id-modal/index.tsx`): React component that renders an iframe pointing to the BringID widget (`widget.bringid.org`). Handles message proxying between the SDK and the widget iframe. Mode and appId are passed from the SDK to the widget automatically via postMessage.

3. **API Layer** (`src/api/`):
   - `get-score/`: Fetches reputation score for an address from the BringID API

4. **Utils** (`src/utils/`):
   - `fetch-registry-config.ts`: Fetches on-chain registry config (contract address, chain ID) from GitHub
   - `validate-outbound-message.ts` / `validate-inbound-message.ts`: Message validation for postMessage communication
   - `create-query-string.tsx`: Query string builder for iframe URL
   - `api.tsx`: HTTP fetch wrapper used by the API layer

5. **Hooks** (`src/hooks/`):
   - `use-message-proxy.tsx`: React hook that bridges postMessage between the SDK and the widget iframe

6. **ABI** (`src/abi/`):
   - `registry.tsx`: Registry contract ABI (`verifyProof`, `verifyProofs`, `getScore`, `apps`)
   - `scorer.tsx`: Scorer contract ABI (`getScore`, `getScores`)

7. **Errors** (`src/errors/`): Custom error classes — `ValidationError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`

8. **Configs** (`src/configs/`):
   - `index.tsx`: Main config (API URL)
   - `allowed-connect-domains.tsx`: Whitelist of allowed widget domains

### External Services Used

1. **BringID API** (`https://api.bringid.org`): Zuplo-hosted API gateway providing:
   - `GET /v1/score/address/:address` — Returns reputation score for an Ethereum address
   - Requires Bearer token authentication (`ZUPLO_API_KEY`)

2. **BringID Widget** (`https://widget.bringid.org`): Frontend verification widget loaded in an iframe. Handles the interactive humanity verification flow (OAuth, credential linking, proof generation). Allowed domains:
   - `https://widget.bringid.org` (production)
   - `https://staging.widget.bringid.org` (staging)
   - `https://dev.widget.bringid.org` (development)

3. **BringID Configs** (`https://raw.githubusercontent.com/BringID/configs/main/`): GitHub-hosted JSON configuration files:
   - `configs.json` / `dev-configs-staging.json` — Registry contract address and chain ID

4. **On-chain Contracts**:
   - **Registry Contract**: BringID registry for on-chain Semaphore proof verification and app management (address fetched from configs)
   - **Scorer Contract**: Per-app scorer for credential group score lookups (address fetched from Registry via `apps()`)

### Communication Flow

1. Host app creates a `BringID` instance with `appId` and mounts `BringIDModal`
2. `BringIDModal` renders an iframe pointing to `widget.bringid.org`
3. When `verifyHumanity()` is called, SDK sends a `PROOFS_REQUEST` message via `window.postMessage` (includes `mode` and `appId`)
4. The `useMessageProxy` hook forwards the message to the iframe
5. The widget handles user interaction (OAuth, signing, proof generation)
6. The widget sends proofs back via postMessage
7. The hook forwards the response to the SDK
8. SDK resolves the promise with `{ proofs, points }`

---

## API

### `new BringID({ appId, mode? })`

Creates a new SDK instance. The `appId` is required.

```ts
import { BringID } from "bringid";

// Production mode (default)
const bringid = new BringID({ appId: "1" });

// Development mode
const bringid = new BringID({ appId: "1", mode: "dev" });
```

**Options:**

- `appId` (string, required) — Your application ID
- `mode` (`"production"` | `"dev"`, optional) — Defaults to `"production"`. Dev mode uses staging APIs and Sepolia testnet configs.

**Instance methods:**

- `setMode(mode)` — Switch between `"production"` and `"dev"`
- `setAppId(appId)` — Update the app ID
- `getAppId()` — Get the current app ID
- `getMode()` — Get the current mode

---

### `bringid.getAddressScore(address)`

Returns a reputation score for any Ethereum address. No wallet connection or modal required.

```ts
const { score, message, signature } = await bringid.getAddressScore("0x...");
```

**Parameters:**

- `address` (string, required) — Ethereum address to score

**Returns:**

```typescript
{
  score: number; // Reputation score (0-100)
  message: {
    address: string; // The queried address
    score: number; // Same score value
    timestamp: number; // Unix timestamp
  }
  signature: string; // Cryptographic signature of the message
}
```

**Errors:**

- Throws `Error` if `address` is not provided
- Throws `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), or `ConflictError` (409) based on API response

---

### `bringid.verifyHumanity(options?)`

Opens the verification modal and returns Semaphore proofs. Requires `BringIDModal` to be mounted in the React tree.

```ts
// Basic usage
const { proofs, points } = await bringid.verifyHumanity();

// With contract address
const { proofs, points } = await bringid.verifyHumanity({ contract: "0x..." });

// With context
const { proofs, points } = await bringid.verifyHumanity({ context: 1 });

// With custom message
const { proofs, points } = await bringid.verifyHumanity({
  message: "custom_message",
});

// With minimum points requirement
const { proofs, points } = await bringid.verifyHumanity({ minPoints: 10 });
```

**Parameters (all optional):**

- `contract` (string) — Contract address (0x string) for the proof
- `context` (number) — Context value. Defaults to 0.
- `message` (string) — Custom message for the proof
- `minPoints` (number) — Minimum points required. Defaults to 0 (any amount above 0 is acceptable)

**Returns:**

```typescript
{
  proofs: TSemaphoreProof[]   // Array of Semaphore proofs
  points: number              // Total humanity points earned
}
```

**TSemaphoreProof:**

```typescript
{
  credential_group_id: string
  app_id: string
  semaphore_proof: {
    merkle_tree_depth: number
    merkle_tree_root: string
    nullifier: string
    message: string
    scope: string
    points: string[]
  }
}
```

**Errors:**

- Rejects with `"REJECTED"` if the user closes the modal
- Rejects with `"DESTROYED"` if the SDK instance is destroyed

---

### `bringid.verifyProofs(options)`

Verifies Semaphore proofs on-chain via the Registry and Scorer contracts and returns verification status with score breakdown. A `provider` is required.

```ts
import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://mainnet.base.org");
const { verified, score } = await bringid.verifyProofs({ proofs, provider });

// With optional context and contract parameters
const { verified, score } = await bringid.verifyProofs({
  proofs,
  provider,
  context: 1,
  contract: "0x..."
});
```

**Parameters:**

- `proofs` (TSemaphoreProof[], required) — Array of Semaphore proofs to verify
- `provider` (ethers.JsonRpcProvider, required) — JSON-RPC provider for on-chain verification
- `context` (number, optional) — Context value for scope verification. Defaults to 0.
- `contract` (string, optional) — Contract address (0x) for scope verification. Defaults to registry address.

**Returns:**

```typescript
{
  verified: boolean; // Whether all proofs are valid
  score: {
    total: number; // Total score across all credential groups
    groups: Array<{
      credential_group_id: string;
      score: number;
    }>;
  }
}
```

**Errors:**

- Throws `Error` if registry config cannot be fetched
- Returns `{ verified: false, score: { total: 0, groups: [] } }` on verification failure (does not throw)

---

### `bringid.destroy()`

Cleans up the SDK instance. Removes event listeners and rejects all pending requests.

```ts
bringid.destroy();
```

---

### `BringIDModal` (React Component)

React component that renders the verification iframe. Import from `bringid/react`. Mode and appId are passed from the SDK instance automatically via postMessage.

```tsx
import { BringIDModal } from "bringid/react";

<BringIDModal
  address={address}
  generateSignature={(message) => walletClient.signMessage({ message })}
  iframeOnLoad={() => console.log("Ready")}
  theme="light"
  highlightColor="#FF5733"
  connectUrl="https://widget.bringid.org"
  customTitles={{
    pointsTitle: "Humanity Points",
    pointsShortTitle: "HP",
    scoreTitle: "Score"
  }}
/>;
```

**Props:**

- `address` (string, optional) — Connected wallet address
- `generateSignature` ((message: string) => Promise<string>, optional) — Function to sign messages with the user's wallet
- `iframeOnLoad` (() => void, optional) — Callback when the iframe has loaded
- `theme` (`"light"` | `"dark"`, optional) — Defaults to `"light"`
- `highlightColor` (string, optional) — Custom accent color
- `connectUrl` (string, optional) — Widget URL. Defaults to `"https://widget.bringid.org"`. Must be in the allowed domains whitelist.
- `customTitles` (object, optional) — Override widget UI titles: `{ pointsTitle, pointsShortTitle, scoreTitle }`

---

## Data Models

### TSemaphoreProof

```typescript
type TSemaphoreProof = {
  credential_group_id: string;
  app_id: string;
  semaphore_proof: {
    merkle_tree_depth: number;
    merkle_tree_root: string;
    nullifier: string;
    message: string;
    scope: string;
    points: string[];
  };
};
```

### TScoreMessage

```typescript
type TScoreMessage = {
  address: string;
  score: number;
  timestamp: number;
};
```

### TVerifyProofsResult

```typescript
type TVerifyProofsResult = {
  verified: boolean;
  score: {
    total: number;
    groups: Array<{
      credential_group_id: string;
      score: number;
    }>;
  };
};
```

---

## Configuration

### Development vs Production Mode

| Aspect          | Production (default)         | Dev                                |
| --------------- | ---------------------------- | ---------------------------------- |
| API endpoint    | `https://api.bringid.org`    | `https://api.bringid.org`          |
| Widget URL      | `https://widget.bringid.org` | `https://dev.widget.bringid.org`   |
| Registry config | `configs.json`               | `dev-configs-staging.json`         |
| Chain           | Mainnet                      | Sepolia                            |

### Environment Variables

- `ZUPLO_API_KEY` — API key for BringID API authentication (baked into build)

---

## Project Structure

```
src/
├── index.ts                          # Main entry point (exports BringID)
├── react-entry.ts                    # React entry point (exports BringIDModal)
├── modules/
│   ├── bring-id-sdk/                 # BringID class
│   │   ├── index.ts                  # Main SDK logic
│   │   └── types/                    # Method type definitions
│   └── bring-id-modal/              # BringIDModal React component
│       ├── index.tsx                 # Modal component
│       ├── component-types.tsx       # Props type
│       └── styled-components.tsx     # Styled components
├── api/                              # API layer
│   ├── index.tsx                     # API methods (getScore)
│   └── get-score/                    # Score endpoint types
├── abi/                              # Smart contract ABIs
│   ├── registry.tsx                  # Registry contract ABI
│   └── scorer.tsx                    # Scorer contract ABI
├── components/                       # Shared React components
│   ├── dialog/                       # Dialog/modal wrapper
│   ├── close-button/                # Close button
│   └── spinner/                     # Loading spinner
├── configs/                          # Configuration
│   ├── index.tsx                     # API URL
│   └── allowed-connect-domains.tsx  # Whitelisted widget domains
├── errors/                           # Custom error classes
├── hooks/                            # React hooks (useMessageProxy)
├── themes/                           # Styled-components themes
├── types/                            # Shared TypeScript types
└── utils/                            # Utility functions
```

---

## Build & Development

### Scripts

- `yarn build` — Clean dist, bundle with Webpack, and emit type declarations
- `yarn build:types` — Emit TypeScript declarations only
- `yarn test` — Run Mocha tests with env-cmd

### Requirements

- Node.js 16+
- Yarn

---

## Important Notes

1. **Two Entry Points**: The package exports `BringID` from `"bringid"` and `BringIDModal` from `"bringid/react"`. The React entry point is optional and only needed for `verifyHumanity()`.

2. **App ID Required**: The `BringID` constructor requires an `appId` parameter. This ID is used for on-chain app lookups (scorer address) and is passed to the widget automatically.

3. **PostMessage Communication**: The SDK and modal communicate via `window.postMessage`. A single pending request model is used (new requests reject any pending one).

4. **On-chain Verification Only**: `verifyProofs()` requires an ethers `JsonRpcProvider`. It calls `registry.verifyProofs()` for proof validation and `scorer.getScores()` for per-group score lookup. The scorer address is fetched from the registry via `registry.apps(appId)`.

5. **Config Fetching**: Registry config is fetched at runtime from the `BringID/configs` GitHub repository. This allows updating contract addresses without SDK updates.

6. **Domain Whitelist**: The `BringIDModal` only allows iframe sources from whitelisted domains (`widget.bringid.org`, `staging.widget.bringid.org`, `dev.widget.bringid.org`).

7. **Wallet Integration**: The SDK is wallet-agnostic. It accepts a `generateSignature` function prop, allowing integration with any wallet provider (wagmi, ethers, etc.).

8. **Cleanup**: Always call `bringid.destroy()` when unmounting to clean up event listeners and reject pending requests.

9. **Mode Propagation**: The `mode` is set only on the `BringID` instance and automatically passed to the widget via postMessage. There is no `mode` prop on `BringIDModal`.
