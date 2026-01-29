# BringID SDK

Verify humanity and request reputation scores in your Next.js or Node.js app.

## Installation

```bash
npm install bringid
```

## Quick Start

```ts
import { BringID } from "bringid";

const bringid = new BringID();

// Get a reputation score (0-100) — works immediately
const { score } = await bringid.getAddressScore("0x...");

// Verify humanity and get proofs — requires modal setup (see below)
const { proofs, points } = await bringid.verifyHumanity();

// Verify proofs — works immediately
const isVerified = await bringid.verifyProofs({ proofs: [ ... ]})

```

> **Note:** `getAddressScore` and `verifyProofs` works out of the box. `verifyHumanity` requires the modal provider — see [Setup](#setup) below.

## Requirements

**For React/Next.js:**

- Next.js 13+ (App Router)
- React 18+
- Wallet provider (wagmi, ethers, etc.)

**For Node.js:**

- Node.js 16+

## Setup

### 1. Create the SDK instance

Create a shared instance to use across your app:

```ts
// lib/bringid.ts
import { BringID } from "bringid";

export const bringid = new BringID();
// will return a BringID instance ready for production
```

### 2. Add the Modal Provider

The `verifyHumanity` method requires a modal. Render it once at the root of your app:

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

### `bringid.getAddressScore(address)`

Returns a reputation score for any address. No wallet connection required.

```ts
const { score } = await bringid.getAddressScore("0x...");
```

**Returns:**

- `score` — number between 0 and 100

### `bringid.verifyProofs({ proofs, provider })`

Returns `true` if proofs are valid. If not -- returns `false`

```ts
const isVerified = await bringid.verifyProofs({ proofs: [ ... ] });
// it will check the validity of proofs and return a boolean value


const provider = new JsonRpcProvider('https://sepolia.base.org');
const isVerified = await bringid.verifyProofs({ proofs: [ ... ], provider });
// it is possible to use a custom JSONRpcProvider for a proofs validity check

```

### `bringid.verifyHumanity(options?)`

Opens the verification modal and returns proofs. Requires the modal provider to be mounted.

```ts
const { proofs, points } = await bringid.verifyHumanity();

// With custom scope
const { proofs, points } = await bringid.verifyHumanity({
  scope: "0x...",
});

// With minumum points requirement. If `minPoints` not presented any amount of points above 0 is acceptable
const { proofs, points } = await bringid.verifyHumanity({
  minPoints: 10,
});
```

**Returns:**

- `proofs` — Array of semaphore proofs
- `points` — Humanity points earned

## Configuration

### Development Mode

Use `mode="dev"` on the modal for testing:

```tsx
<BringIDModal
  mode="dev"
  address={address}
  generateSignature={(message) => walletClient.signMessage({ message })}
/>
```

Also it should be used for BringID instance

```tsx
const bringid = new BringID({ mode: "dev" });
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
