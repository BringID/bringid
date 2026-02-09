# BringID SDK - Project Documentation

## Project Overview

**BringID SDK** is a TypeScript client library (`bringid` on npm) that enables developers to verify humanity and request reputation scores in Next.js or Node.js applications. The SDK provides a `BringID` class for core logic and a `BringIDModal` React component for the verification UI flow.

### Purpose

The SDK provides three main capabilities:

- **Reputation Scoring**: Get a reputation score (0-100) for any Ethereum address via the BringID API
- **Humanity Verification**: Open a verification modal that guides users through identity proofs using Semaphore protocol, returning cryptographic proofs and humanity points
- **Proof Verification**: Verify Semaphore proofs on-chain (via Multicall3 + Registry contract) or off-chain (via BringID API), returning verification status and points breakdown

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
│  Helpers (helpers/)                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         External Services               │
│  BringID API (api.bringid.org)          │
│  BringID Widget (widget.bringid.org)    │
│  GitHub Configs (BringID/configs repo)  │
│  On-chain contracts (Multicall3/Registry)│
└─────────────────────────────────────────┘
```

### Key Components

1. **BringID Class** (`src/modules/bring-id-sdk/index.ts`): Main SDK class providing `getAddressScore()`, `verifyHumanity()`, and `verifyProofs()` methods. Communicates with the modal via `window.postMessage`.

2. **BringIDModal Component** (`src/modules/bring-id-modal/index.tsx`): React component that renders an iframe pointing to the BringID widget (`widget.bringid.org`). Handles message proxying between the SDK and the widget iframe.

3. **API Layer** (`src/api/`):
   - `get-score/`: Fetches reputation score for an address from the BringID API
   - `verify-proofs/`: Verifies Semaphore proofs via the BringID API

4. **Utils** (`src/utils/`):
   - `fetch-registry-config.ts`: Fetches on-chain registry config (contract address, chain ID) from GitHub
   - `fetch-tasks-config.ts`: Fetches tasks/credential group points mapping from GitHub
   - `validate-outbound-message.ts` / `validate-inbound-message.ts`: Message validation for postMessage communication
   - `create-query-string.tsx`: Query string builder for iframe URL
   - `define-api-url.tsx`: API URL resolver
   - `generate-id.tsx`: UUID generator for request tracking

5. **Hooks** (`src/hooks/`):
   - `use-message-proxy.tsx`: React hook that bridges postMessage between the SDK and the widget iframe

6. **ABI** (`src/abi/`):
   - `registry.tsx`: Registry contract ABI for on-chain proof verification
   - `milticall3.tsx`: Multicall3 contract ABI for batched on-chain calls

7. **Errors** (`src/errors/`): Custom error classes — `ValidationError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`

8. **Configs** (`src/configs/`):
   - `index.tsx`: Main config (API URL, Multicall3 address)
   - `allowed-connect-domains.tsx`: Whitelist of allowed widget domains

### External Services Used

1. **BringID API** (`https://api.bringid.org`): Zuplo-hosted API gateway providing:
   - `GET /v1/score/address/:address` — Returns reputation score for an Ethereum address
   - `POST /v1/proofs/verify` — Verifies Semaphore proofs server-side
   - Requires Bearer token authentication (`ZUPLO_API_KEY`)

2. **BringID Widget** (`https://widget.bringid.org`): Frontend verification widget loaded in an iframe. Handles the interactive humanity verification flow (OAuth, credential linking, proof generation). Allowed domains:
   - `https://widget.bringid.org` (production)
   - `https://staging.widget.bringid.org` (staging)
   - `https://dev.widget.bringid.org` (development)

3. **BringID Configs** (`https://raw.githubusercontent.com/BringID/configs/main/`): GitHub-hosted JSON configuration files:
   - `configs.json` / `dev-configs.json` — Registry contract address and chain ID
   - `tasks.json` / `tasks-sepolia.json` — Credential group points mapping

4. **On-chain Contracts**:
   - **Multicall3** (`0xca11bde05977b3631167028862be2a173976ca11`): Standard Multicall3 contract for batched calls
   - **Registry Contract**: BringID registry for on-chain Semaphore proof verification (address fetched from configs)

### Communication Flow

1. Host app creates a `BringID` instance and mounts `BringIDModal`
2. `BringIDModal` renders an iframe pointing to `widget.bringid.org`
3. When `verifyHumanity()` is called, SDK sends a `PROOFS_REQUEST` message via `window.postMessage`
4. The `useMessageProxy` hook forwards the message to the iframe
5. The widget handles user interaction (OAuth, signing, proof generation)
6. The widget sends proofs back via postMessage
7. The hook forwards the response to the SDK
8. SDK resolves the promise with `{ proofs, points }`

---

## API

### `new BringID(options?)`

Creates a new SDK instance.

```ts
import { BringID } from "bringid";

// Production mode (default)
const bringid = new BringID();

// Development mode
const bringid = new BringID({ mode: "dev" });
```

**Options:**

- `mode` — `"production"` (default) or `"dev"`. Dev mode uses staging APIs and Sepolia testnet configs.

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

// With custom scope
const { proofs, points } = await bringid.verifyHumanity({ scope: "0x..." });

// With custom message
const { proofs, points } = await bringid.verifyHumanity({
  message: "custom_message",
});

// With minimum points requirement
const { proofs, points } = await bringid.verifyHumanity({ minPoints: 10 });
```

**Parameters (all optional):**

- `scope` (string) — Custom scope for the proof
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

Verifies Semaphore proofs and returns verification status with points breakdown. Can verify via BringID API (default) or on-chain using a custom provider.

```ts
// Via BringID API (default)
const { verified, points } = await bringid.verifyProofs({ proofs: [...] });

// Via on-chain verification with custom provider
import { JsonRpcProvider } from "ethers";
const provider = new JsonRpcProvider("https://sepolia.base.org");
const { verified, points } = await bringid.verifyProofs({ proofs: [...], provider });
```

**Parameters:**

- `proofs` (TSemaphoreProof[], required) — Array of Semaphore proofs to verify
- `provider` (ethers.JsonRpcProvider, optional) — Custom JSON-RPC provider for on-chain verification. If omitted, uses BringID API.

**Returns:**

```typescript
{
  verified: boolean; // Whether all proofs are valid
  points: {
    total: number; // Total points across all credential groups
    groups: Array<{
      credential_group_id: string;
      points: number;
    }>;
  }
}
```

**Errors:**

- Throws `Error` if registry or tasks config cannot be fetched
- Returns `{ verified: false, points: { total: 0, groups: [] } }` on verification failure (does not throw)

---

### `bringid.destroy()`

Cleans up the SDK instance. Removes event listeners and rejects all pending requests.

```ts
bringid.destroy();
```

---

### `BringIDModal` (React Component)

React component that renders the verification iframe. Import from `bringid/react`.

```tsx
import { BringIDModal } from "bringid/react";

<BringIDModal
  address={address}
  generateSignature={(message) => walletClient.signMessage({ message })}
  iframeOnLoad={() => console.log("Ready")}
  mode="dev"
  theme="light"
  highlightColor="#FF5733"
  connectUrl="https://widget.bringid.org"
/>;
```

**Props:**

- `address` (string, optional) — Connected wallet address
- `generateSignature` ((message: string) => Promise<string>, optional) — Function to sign messages with the user's wallet
- `iframeOnLoad` (() => void, optional) — Callback when the iframe has loaded
- `mode` (`"production"` | `"dev"`, optional) — Defaults to `"production"`
- `theme` (`"light"` | `"dark"`, optional) — Defaults to `"light"`
- `highlightColor` (string, optional) — Custom accent color
- `connectUrl` (string, optional) — Widget URL. Defaults to `"https://widget.bringid.org"`. Must be in the allowed domains whitelist.

---

## Data Models

### TSemaphoreProof

```typescript
type TSemaphoreProof = {
  credential_group_id: string;
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
  points: {
    total: number;
    groups: Array<{
      credential_group_id: string;
      points: number;
    }>;
  };
};
```

---

## Configuration

### Development vs Production Mode

| Aspect          | Production (default)         | Dev                              |
| --------------- | ---------------------------- | -------------------------------- |
| API endpoint    | `https://api.bringid.org`    | `https://api.bringid.org`        |
| Widget URL      | `https://widget.bringid.org` | `https://dev.widget.bringid.org` |
| Registry config | `configs.json`               | `dev-configs.json`               |
| Tasks config    | `tasks.json`                 | `tasks-sepolia.json`             |
| Chain           | Mainnet                      | Sepolia                          |

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
│   ├── index.tsx                     # API methods (getScore, verifyProofs)
│   ├── get-score/                    # Score endpoint types
│   └── verify-proofs/               # Verify proofs endpoint types
├── abi/                              # Smart contract ABIs
│   ├── registry.tsx                  # Registry contract ABI
│   └── milticall3.tsx               # Multicall3 contract ABI
├── components/                       # Shared React components
│   ├── dialog/                       # Dialog/modal wrapper
│   ├── close-button/                # Close button
│   └── spinner/                     # Loading spinner
├── configs/                          # Configuration
│   ├── index.tsx                     # API URLs, contract addresses
│   └── allowed-connect-domains.tsx  # Whitelisted widget domains
├── errors/                           # Custom error classes
├── helpers/                          # HTTP request helper, error text
├── hooks/                            # React hooks (useMessageProxy)
├── themes/                           # Styled-components themes
├── texts/                            # Error text constants
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

2. **PostMessage Communication**: The SDK and modal communicate via `window.postMessage`. Each request gets a unique UUID, and responses are matched by `requestId`.

3. **On-chain vs Off-chain Verification**: `verifyProofs()` supports both modes. Without a `provider`, it calls the BringID API. With a `provider`, it makes a Multicall3 call to the Registry contract directly.

4. **Config Fetching**: Registry and tasks configs are fetched at runtime from the `BringID/configs` GitHub repository. This allows updating contract addresses and points mapping without SDK updates.

5. **Domain Whitelist**: The `BringIDModal` only allows iframe sources from whitelisted domains (`widget.bringid.org`, `staging.widget.bringid.org`, `dev.widget.bringid.org`).

6. **Wallet Integration**: The SDK is wallet-agnostic. It accepts a `generateSignature` function prop, allowing integration with any wallet provider (wagmi, ethers, etc.).

7. **Cleanup**: Always call `bringid.destroy()` when unmounting to clean up event listeners and reject pending requests.

8. **Mode Consistency**: The `mode` must match between the `BringID` instance and the `BringIDModal` component for correct behavior.
