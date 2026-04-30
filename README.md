# youtube disliked

browser extension. lists the videos you disliked on youtube.

manifest v3 · typescript · esbuild · zero runtime deps.
works in any chromium-based browser (chrome, edge, brave, opera, vivaldi, arc).

## build

```bash
npm install
npm run build
```

output: `dist/youtube-disliked/`.

## setup

1. create an oauth 2.0 client id (type **chrome extension**, scope `youtube.readonly`) in [google cloud console](https://console.cloud.google.com/).
2. paste it into `manifest.json` → `oauth2.client_id`.

## install

open your browser's extensions page → enable developer mode → **load unpacked** → select `dist/youtube-disliked`.

| browser | extensions url              |
| ------- | --------------------------- |
| chrome  | `chrome://extensions`       |
| edge    | `edge://extensions`         |
| brave   | `brave://extensions`        |
| opera   | `opera://extensions`        |

copy the extension id, paste it into your oauth client's *application id* field, save.

## license

mit
