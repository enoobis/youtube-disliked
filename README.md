# YouTube Disliked

Browser extension. Lists the videos you disliked on YouTube.

Manifest V3 · TypeScript · esbuild · zero runtime deps.
Works in any Chromium-based browser (Chrome, Edge, Brave, Opera, Vivaldi, Arc).

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

Open your browser's extensions page → enable Developer mode → **Load unpacked** → select `dist/youtube-disliked`.

| Browser | Extensions URL              |
| ------- | --------------------------- |
| Chrome  | `chrome://extensions`       |
| Edge    | `edge://extensions`         |
| Brave   | `brave://extensions`        |
| Opera   | `opera://extensions`        |

Copy the extension ID, paste it into your OAuth Client's *Application ID* field, save.

## License

MIT
