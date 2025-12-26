# BringID Modal SDK 0.0.18 – Next.js Integration Guide

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
2. Exposing SDK methods (`openModal`)
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

The SDK exposes the following client-side method:

`openModal ( proofsGeneratedCallback, scope )` – opens the verification modal

- proofsGeneratedCallback - required. Should be presented as a callback with two arguments: proofs (array of semaphore proofs) points (amount of points for seleceted array of proofs)

- scope - NOT required. Should be presented as a string if specific scope needed. By default the scope will be computed from registry address

That method should be called from **Client Components**.

---

## Example: Open Modal

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

      <button
        onClick={() => {
          openModal(
            proofsGeneratedCallback: (proofs, points) => {
              setProofs(proofs)
            }
          );
        }}
      >
        Open popup
      </button>

    </div>
  );
};

export default CreateID;
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
