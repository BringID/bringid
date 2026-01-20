# BringID Modal SDK 0.0.19 – Next.js Integration Guide

This guide explains how to integrate **bringid-sdk** into a **Next.js App Router** application, including verifying humanity and requesting score.

---

## Installation

Install the SDK using Yarn:

```bash
yarn add bringid-sdk
```

---

## Requirements

- Next.js 13+ (App Router)
- React 18+
- Client-side wallet integration (e.g. Wagmi, Ethers)
- App Router enabled (`app/` directory)

---

## Overview

The BringID SDK works by:

1. SDK initialization
2. Exposing SDK methods (`verifyHumanity`, `requestScore`)
3. Rendering a global BringID modal (ONLY for `verifyHumanity` method to interact with BringIDModal)
4. Allowing interaction from client components

---

## SDK initialization

Create an sdk instance

```tsx
import { BringID } from "bringid-sdk";
const sdk = new BringID();
```

## SDK methods

When the sdk is ready you can use methods to request address score (`requestScore`) and to verify humanity (`verifyHumanity`)

### sdk.requestScore method

```tsx
const { score } = await sdk.requestScore("0x..."); // address is a required param
console.log(score); // `score` is a number between 0 and 100
```

### sdk.verifyHumanity method

To use it correctly, you must:

- Create a **Modal Provider**
- Wrap it in your **Root Layout**
- Call `sdk.verifyHumanity` from **Client Components only**

#### 1. Create Modal Provider

Create a client-side provider that renders the verification dialog once.

**`@/app/providers/ModalProvider.tsx`**

```tsx
"use client";

import { BringIDModal } from "bringid-sdk";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function ModalProvider({ children }: Props) {
  // Replace with actual wallet data (wagmi, ethers, etc.)
  const address: string | undefined = undefined;
  const signer: any = null;

  return (
    <>
      {signer ? (
        <BringIDModal
          address={address}
          iframeOnLoad={() => {
            console.log("modal window is ready to use. iframe is fully loaded");
          }}
          generateSignature={async (value: string) =>
            await signer.signMessage(value)
          }
        />
      ) : null}
      {children}
    </>
  );
}
```

##### Notes

- Render `BringIDModal` only once in the app
- `address` and signer in the `generateSignature` callback should come from your wallet provider (wagmi, etc.)
- **IMPORTANT: use `mode="dev"` property to enable dev mode. Otherwise `production` mode is enabled by default**

---

#### 2. Wrap Root Layout

Wrap your app with the modal provider in `RootLayout`.

**`@/app/layout.tsx`**

```tsx
import ModalProvider from "@/app/providers/ModalProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </head>
      <body>
        <WagmiProvider>
          <ModalProvider>{children}</ModalProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

---

#### 3. Call verifyHumanity SDK Method

When the modal window is fully rendered you can use `sdk.verifyHumanity` method

```tsx
const { proofs, points } = await sdk.verifyHumanity();
console.log(
  proofs, // array of semaphore proofs
  points, // amount of points
);
```

Also you can use `scope` option. It can be presented as a string if specific scope needed. By default the scope will be computed from registry address

```tsx
const { proofs, points } = await sdk.verifyHumanity({
  scope: "0x....",
});

console.log(
  proofs, // array of semaphore proofs
  points, // amount of points
);
```

That method should be called from **Client Components**.

---

#### Example: Verify humanity

**`@/app/utils/sdk.tsx`**

```tsx
import { BringID } from "bringid-sdk";

const initSDK = (() => {
  let sdk: null | BringID = null;

  return () => {
    if (!sdk) {
      const newSDK = new BringID();
      sdk = newSDK;

      return sdk;
    }

    return sdk;
  };
})();

export default initSDK;
```

**`@/app/components/main.tsx`**

```tsx
"use client";

import { FC, useState } from "react";
import initSDK from "@/app/utils/sdk.tsx";

type Props = {
  setStage?: (stage: string) => void;
};

const Main: FC<Props> = ({ setStage }) => {
  const [points, setPoints] = useState<number>(0);

  return (
    <div>
      <h1>Humanity points: {points}</h1>
      <button
        onClick={async () => {
          try {
            const sdk = initSDK();
            const { points } = await sdk.verifyHumanity();

            setPoints(points);
          } catch (err) {
            console.error(err);
          }
        }}
      >
        Verify humanity
      </button>
    </div>
  );
};

export default Main;
```

---

## Best Practices

- Ensure wallet is connected before requesting proofs
- Avoid rendering the modal multiple times
- For large proof objects, consider collapsing or lazy rendering

---

## Troubleshooting

### Modal does not open

- Ensure `ModalProvider` is rendered in `layout.tsx`
- Ensure `'use client'` is present

---

## License

Refer to the BringID SDK license and documentation for details.
