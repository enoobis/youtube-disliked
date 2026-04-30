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

<img width="204" height="77" alt="image" src="https://github.com/user-attachments/assets/ca2c2b6c-6db3-4892-a55b-69b9e20e9483" />

<img width="790" height="39" alt="image" src="https://github.com/user-attachments/assets/343915aa-7e98-476e-adc9-4781d9a9d0e0" />

<img width="561" height="233" alt="image" src="https://github.com/user-attachments/assets/a9487c6a-dbc1-4460-81a9-a97f58113dec" />

<img width="742" height="128" alt="image" src="https://github.com/user-attachments/assets/19b72250-1e52-4534-b8cc-8a59deeec943" />

<img width="1194" height="59" alt="image" src="https://github.com/user-attachments/assets/6f5d9633-6856-4b4b-a546-344a990ebbde" />

<img width="986" height="202" alt="image" src="https://github.com/user-attachments/assets/3177ab15-2ca5-4bc5-9071-1ac76350fc85" />

<img width="1212" height="213" alt="image" src="https://github.com/user-attachments/assets/1dba3ca1-7a35-4f54-86b1-b40db7971787" />



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
