# BringID SDK (`bringid-sdk`)

The **BringID SDK** enables communication between your web application and the **BringID Chrome Extension** using an iframe-based Connect Dialog and secure `postMessage` messaging.

It provides utilities for:

- Detecting extension installation & connection status
- Displaying the BringID Connect authentication dialog
- Requesting proofs & points
- Handling login & logout events

---

## Installation

```bash
npm install bringid-sdk
# or
yarn add bringid-sdk
```

---

## Quick Start (React Example)

```tsx
import { BringIDRequestsSDK, ConnectDialog } from "bringid-sdk";
import { useState } from "react";

export default function App() {
  const sdk = new BringIDRequestsSDK();

  const [iFrameVisible, setIFrameVisible] = useState(false);
  const [iFrameReady, setIFrameReady] = useState(false);

  return (
    <div>
      <button onClick={() => setIFrameVisible(true)}>Connect BringID</button>

      <ConnectDialog
        visible={iFrameVisible}
        setVisible={setIFrameVisible}
        connectUrl="https://dev.connect.bringid.org"
        iframeOnLoad={() => {
          sdk.markDialogReady();
          setIFrameReady(true);
        }}
        onLogin={() => {
          console.log("LOGIN DONE");
          setIFrameVisible(false);
        }}
        onLogout={() => {
          console.log("LOGOUT");
        }}
      />
    </div>
  );
}
```

---

## `<ConnectDialog />` Component

The dialog embeds BringID Connect in an iframe and manages communication with the BringID Extension.

### Props

| Prop           | Type                | Description                                                         |
| -------------- | ------------------- | ------------------------------------------------------------------- |
| `visible`      | `boolean`           | Whether the dialog is visible                                       |
| `setVisible`   | `(boolean) => void` | Update visibility                                                   |
| `connectUrl`   | `string`            | BringID Connect URL (default: `https://connect.bringid.org`)        |
| `iframeOnLoad` | `() => void`        | Fired when iframe is loaded — **must call `sdk.markDialogReady()`** |
| `onLogin`      | `() => void`        | Called after successful login                                       |
| `onLogout`     | `() => void`        | Called when user logs out via extension                             |

---

## BringIDRequestsSDK API

### Creating the SDK

```ts
const sdk = new BringIDRequestsSDK();
```

---

## Checking Extension Status

```ts
const { status } = await sdk.checkExtensionStatus();

if (status === "EXTENSION_IS_INSTALLED_AND_CONNECTED") {
  console.log("Extension installed and connected");
} else if (status === "EXTENSION_IS_INSTALLED_AND_NOT_CONNECTED") {
  console.log("Extension installed but not connected");
} else if (status === "EXTENSION_IS_NOT_INSTALLED") {
  console.log("Extension not installed");
}
```

Statuses:

- `EXTENSION_IS_INSTALLED_AND_CONNECTED`
- `EXTENSION_IS_INSTALLED_AND_NOT_CONNECTED`
- `EXTENSION_IS_NOT_INSTALLED`

---

## Requesting Proofs

```ts
const { proofs, points } = await sdk.requestProofs({
  drop: "0x...",
  address: "0x...",
  pointsRequired: 10,
});

console.log(proofs, points);
```

### Parameters

| Name             | Type     | Description             |
| ---------------- | -------- | ----------------------- |
| `drop`           | `string` | Drop address            |
| `address`        | `string` | User address            |
| `pointsRequired` | `number` | Minimum required points |

### Returns

```ts

type TProof = {
  credential_group_id: string,
  semaphore_proof: {
    merkle_tree_depth: number,
    merkle_tree_root: string,
    nullifier: string,
    message: string,
    scope: string,
    points: string[]
  }
}

{
  proofs: TProof[],
  points: number
}
```

---

## markDialogReady()

Called when the iframe is fully ready:

```ts
iframeOnLoad={() => {
  sdk.markDialogReady()
}}
```

This initializes `postMessage` communication.

---

## Login / Logout Flow

1. User opens Connect Dialog
2. Iframe loads
3. Developer calls `sdk.markDialogReady()`
4. Extension sends login/logout events
5. App receives:
   - `onLogin()`
   - `onLogout()`

---

## How It Works

- The SDK mounts an iframe (`ConnectDialog`)
- Communicates via `window.postMessage`
- BringID Extension responds with:
  - login status
  - logout events
  - extension status
  - proofs

## Notes

- Browser only — not available in Node.js
- `sdk.markDialogReady()` must be triggered **after iframe load**
- Optimized for Chrome

# BringID Modal SDK 0.0.14 – Next.js Integration Guide

This guide explains how to integrate **bringid-sdk** into a **Next.js App Router** application, including modal setup and requesting proofs.

---

## Installation

Install the SDK using Yarn:

+++bash
yarn add bringid-sdk@^0.0.14
+++

---

## Requirements

- Next.js 13+ (App Router)
- React 18+
- Client-side wallet integration (e.g. Wagmi, Ethers)
- App Router enabled (`app/` directory)

---

## Overview

The BringID SDK works by:

1. Rendering a global verification modal
2. Exposing SDK methods (`openModal`, `requestProofs`)
3. Allowing interaction from client components

To use it correctly, you must:

- Create a **Modal Provider**
- Wrap it in your **Root Layout**
- Call SDK methods from **Client Components only**

---

## 1. Create Modal Provider

Create a client-side provider that renders the verification dialog once.

**`components/ModalProvider.tsx`**

```tsx
"use client";

import { VerificationsDialog } from "bringid-sdk";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function ModalProvider({ children }: Props) {
  // Replace with actual wallet data (wagmi, ethers, etc.)
  const address: string | null = null;
  const signer: any = null;

  return (
    <>
      <VerificationsDialog
        address={address || undefined}
        generateSignature={
          signer
            ? async (value: string) => await signer.signMessage(value)
            : undefined
        }
      />
      {children}
    </>
  );
}
```

### Notes

- This component **must** be a Client Component
- Render `VerificationsDialog` only once in the app
- `address` and `signer` should come from your wallet provider

---

## 2. Wrap Root Layout

Wrap your app with the modal provider in `RootLayout`.

**`app/layout.tsx`**

```tsx
import ModalProvider from "@/components/ModalProvider";
import styles from "./page.module.css";

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
      <body className={styles.page}>
        <WagmiProvider>
          <ModalProvider>{children}</ModalProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

---

## 3. Using SDK Methods

The SDK exposes the following client-side methods:

- `openModal()` – opens the verification modal
- `requestProofs(address, chainId)` – requests verification proofs

These methods must be called from **Client Components**.

---

## Example: Open Modal and Request Proofs

**`components/CreateID.tsx`**

```tsx
"use client";

import { FC, useState } from "react";
import { openModal, requestProofs } from "bringid-sdk";

type Props = {
  setStage?: (stage: string) => void;
};

const CreateID: FC<Props> = ({ setStage }) => {
  const [proofs, setProofs] = useState<any>(null);

  return (
    <div>
      {proofs && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(proofs, null, 2)}
        </pre>
      )}

      <button
        onClick={() => {
          openModal();
        }}
      >
        Open popup
      </button>

      <button
        onClick={async () => {
          const result = await requestProofs(
            "0xA5e1149A4AE284cd2651F6672Dfb174c788984bC",
            10
          );
          setProofs(result);
        }}
      >
        Ask proofs
      </button>
    </div>
  );
};

export default CreateID;
```

---

## Best Practices

- Always call SDK methods from Client Components
- Ensure wallet is connected before requesting proofs
- Avoid rendering the modal multiple times
- For large proof objects, consider collapsing or lazy rendering

---

## Troubleshooting

### Modal does not open

- Ensure `ModalProvider` is rendered in `layout.tsx`
- Ensure `'use client'` is present

### Proof request fails

- Wallet must be connected
- Address must match signer
- Chain ID must be supported

---

## License

Refer to the BringID SDK license and documentation for details.
