# youtube disliked

shows the videos you disliked on youtube.

manifest v3 · vanilla typescript · works in any chromium browser (chrome, edge, brave, opera, vivaldi, arc).

---

## quick start

```text
1. load → 2. id → 3. oauth → 4. paste → 5. reload
```

### 1. load

extensions page → developer mode → **load unpacked** → pick `dist/youtube-disliked`.

| chrome  | `chrome://extensions` |
| ------- | --------------------- |
| edge    | `edge://extensions`   |
| brave   | `brave://extensions`  |
| opera   | `opera://extensions`  |

### 2. copy extension id

it appears under the extension's name. 32 lowercase letters.

### 3. create an oauth client

[console.cloud.google.com](https://console.cloud.google.com/) → new project → enable **youtube data api v3** → oauth consent screen (external, add yourself as a test user) → credentials → **create oauth client id** → type **chrome extension** → paste the extension id.

copy the resulting client id.

### 4. paste into manifest

open `dist/youtube-disliked/manifest.json`, replace the placeholder in `oauth2.client_id`.

### 5. reload

hit ⟳ on the extension card. click the extension icon. sign in. done.

---

## build from source

```bash
npm install
npm run build
```

## license

mit
