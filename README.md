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
