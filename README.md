# YouTube Disliked

Chrome extension. Lists the videos you disliked on YouTube.

Manifest V3 · TypeScript · esbuild · zero runtime deps.

## Build

```bash
npm install
npm run build
```

Output: `dist/youtube-disliked/`.

## Setup

1. Create an OAuth 2.0 Client ID (type **Chrome Extension**, scope `youtube.readonly`) in [Google Cloud Console](https://console.cloud.google.com/).
2. Paste it into `manifest.json` → `oauth2.client_id`.

## Install

`chrome://extensions` → Developer mode → **Load unpacked** → select `dist/youtube-disliked`.

Copy the extension ID, paste it into your OAuth Client's *Application ID* field, save.

## License

MIT
