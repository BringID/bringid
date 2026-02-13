# BringID SDK

Verify humanity and request reputation scores in your Next.js or Node.js app.

## Installation

```bash
npm install bringid
```

## Quick Start

```ts
import { BringID } from "bringid";

const bringid = new BringID({ appId: "1" });

// Get a reputation score (0-100) — works immediately
const { score } = await bringid.getAddressScore("0x...");

// Verify humanity and get proofs — requires modal setup (see below)
const { proofs, points } = await bringid.verifyHumanity();

// Verify proofs on-chain and get score breakdown — requires a provider
import { JsonRpcProvider } from "ethers";
const provider = new JsonRpcProvider("https://mainnet.base.org");
const { verified, score } = await bringid.verifyProofs({ proofs, provider });
```

> **Note:** `getAddressScore` works out of the box. `verifyHumanity` requires the modal provider — see [Setup](#setup) below. `verifyProofs` requires an ethers `JsonRpcProvider`.

## Requirements

**For React/Next.js:**

- Next.js 13+ (App Router)
- React 18+
- Wallet provider (wagmi, ethers, etc.)

**For Node.js:**

- Node.js 16+

## Setup

### 1. Create the SDK instance

Create a shared instance to use across your app. The `appId` parameter is required.

```ts
// lib/bringid.ts
import { BringID } from "bringid";

export const bringid = new BringID({ appId: "1" });
```

### 2. Add the Modal Provider

The `verifyHumanity` method requires a modal. Render it once at the root of your app. The `mode` is passed from the SDK instance automatically — no need to set it on the modal.

```tsx
// app/providers/BringIDProvider.tsx
"use client";

import { BringIDModal } from "bringid/react";
import { useAccount, useWalletClient } from "wagmi";

export function BringIDProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  return (
    <>
      {walletClient && (
        <BringIDModal
          address={address}
          generateSignature={(message) => walletClient.signMessage({ message })}
          iframeOnLoad={() => console.log("BringID ready")}
        />
      )}
      {children}
    </>
  );
}
```

### 3. Wrap your layout

```tsx
// app/layout.tsx
import { BringIDProvider } from "./providers/BringIDProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          <BringIDProvider>{children}</BringIDProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

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

### `bringid.getAddressScore(address)`

Returns a reputation score for any address. No wallet connection required.

```ts
const { score } = await bringid.getAddressScore("0x...");
```

**Returns:**

- `score` — number between 0 and 100

### `bringid.verifyProofs({ proofs, provider, context?, contract? })`

Verifies Semaphore proofs on-chain and returns verification status with score breakdown. A `provider` is required.

```ts
import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://mainnet.base.org");
const { verified, score } = await bringid.verifyProofs({ proofs, provider });
// verified: true/false
// score: { total: 15, groups: [{ credential_group_id: "16", score: 10 }, ...] }

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

- `verified` — boolean indicating if proofs are valid
- `score` — object containing:
  - `total` — total score across all credential groups
  - `groups` — array of `{ credential_group_id, score }` for each proof

### `bringid.verifyHumanity(options?)`

Opens the verification modal and returns proofs. Requires the modal provider to be mounted.

```ts
const { proofs, points } = await bringid.verifyHumanity();

// With contract address
const { proofs, points } = await bringid.verifyHumanity({
  contract: "0x...",
});

// With context
const { proofs, points } = await bringid.verifyHumanity({
  context: 1,
});

// With custom message
const { proofs, points } = await bringid.verifyHumanity({
  message: "custom_message",
});

// With minimum points requirement. Defaults to 0 (any amount above 0 is acceptable)
const { proofs, points } = await bringid.verifyHumanity({
  minPoints: 10,
});
```

**Parameters (all optional):**

- `contract` (string) — Contract address (0x string) for the proof
- `context` (number) — Context value. Defaults to 0.
- `message` (string) — Custom message for the proof
- `minPoints` (number) — Minimum points required. Defaults to 0.

**Returns:**

- `proofs` — Array of Semaphore proofs
- `points` — Humanity points earned

### `bringid.destroy()`

Cleans up the SDK instance. Removes event listeners and rejects pending requests.

```ts
bringid.destroy();
```

### `BringIDModal` (React Component)

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
/>
```

**Props:**

- `address` (string, optional) — Connected wallet address
- `generateSignature` ((message: string) => Promise\<string\>, optional) — Function to sign messages with the user's wallet
- `iframeOnLoad` (() => void, optional) — Callback when the iframe has loaded
- `theme` (`"light"` | `"dark"`, optional) — Defaults to `"light"`
- `highlightColor` (string, optional) — Custom accent color
- `connectUrl` (string, optional) — Widget URL. Defaults to `"https://widget.bringid.org"`.
- `customTitles` (object, optional) — Override widget UI titles: `{ pointsTitle, pointsShortTitle, scoreTitle }`

## Configuration

### Development Mode

Set `mode: "dev"` on the BringID instance. The mode is automatically passed to the modal via postMessage — no need to set it on `BringIDModal`.

```ts
const bringid = new BringID({ appId: "1", mode: "dev" });
```

> **Note:** Production mode is enabled by default. Only use `dev` mode during development.

## Example

```tsx
"use client";

import { useState } from "react";
import { bringid } from "@/lib/bringid";

export function VerifyButton() {
  const [points, setPoints] = useState<number | null>(null);

  const handleVerify = async () => {
    try {
      const { points, proofs } = await bringid.verifyHumanity();
      setPoints(points);
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  return (
    <div>
      <button onClick={handleVerify}>Verify Humanity</button>
      {points !== null && <p>Points: {points}</p>}
    </div>
  );
}
```

## Troubleshooting

**Modal doesn't open**

- Ensure `BringIDProvider` is in your layout
- Ensure the component calling `verifyHumanity` has `"use client"`
- Ensure wallet is connected before calling

**Score returns undefined**

- Verify the address format is correct (checksummed)

## License

MIT
