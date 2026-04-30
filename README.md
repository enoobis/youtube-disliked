# <img src="icons/icon128.png" width="45" align="left"> YouTube Disliked

> Chrome extension that shows the videos you disliked on YouTube via your account.

This is a **Manifest V3** rewrite of the original
[`father-gregor/youtube-disliked-extension`](https://github.com/father-gregor/youtube-disliked-extension).
The stack was reduced to plain TypeScript + a tiny `esbuild` build script — no
React, no Webpack, no SCSS. Two devDependencies in total.

## Features

- Toolbar popup that lists your disliked videos.
- Sidebar entry inside YouTube's left navigation (clones the spirit of the
  original "Disliked videos" button) and a floating overlay panel.
- A "Disliked videos" section on `youtube.com/feed/library`.
- Light + dark theme via `prefers-color-scheme` (auto-follows YouTube's theme).
- Multi-language UI through `chrome.i18n` (en, ru, de, es, fr, uk).

## Prerequisites

You need a Google OAuth Client ID with **YouTube Data API v3** access.

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable **YouTube Data API v3**.
3. `APIs & Services` → `OAuth consent screen` → External → fill the basics.
4. `APIs & Services` → `Credentials` → `Create credentials` → `OAuth client ID`
   → application type **Chrome Extension**.
5. The console will ask for your extension's ID. You'll get one after the first
   `Load unpacked` (see below). For now you can put a placeholder, then come
   back and update it.
6. Copy the resulting `client_id` and paste it into `manifest.json`:
   ```json
   "oauth2": {
       "client_id": "1234567890-xxxx.apps.googleusercontent.com",
       "scopes": ["https://www.googleapis.com/auth/youtube.readonly"]
   }
   ```

## Build

```bash
npm install
npm run build
```

Output: `dist/youtube-disliked/`. For active development:

```bash
npm run watch
```

Type-check only (no emit):

```bash
npm run typecheck
```

## Load into Chrome

1. Go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and pick `dist/youtube-disliked`.
4. Copy the extension ID that appears, paste it into the OAuth Client ID's
   "Application ID" field in Google Cloud Console, then `Save`.
5. Click the extension icon → sign in with Google → enjoy.

## Project layout

```text
.
├── manifest.json          ← Manifest V3
├── package.json
├── tsconfig.json
├── build.mjs              ← esbuild driver
├── icons/                 ← 16/32/48/128 px PNGs
├── _locales/              ← chrome.i18n messages (en, ru, de, es, fr, uk)
└── src/
    ├── background.ts      ← service worker (auth + YouTube API)
    ├── content.ts         ← content script (sidebar btn, overlay, library)
    ├── content.css
    ├── popup.html
    ├── popup.ts
    ├── popup.css
    ├── views.ts           ← shared DOM rendering helpers
    ├── api.ts             ← YouTube Data API wrappers
    ├── duration.ts        ← ISO 8601 parser
    ├── format.ts          ← view count + relative dates
    └── types.ts
```

## Notes

- `chrome.identity.getAuthToken` is used for OAuth — no user secret leaves the
  device. The token is cached by Chrome and revoked via the
  `https://oauth2.googleapis.com/revoke` endpoint on sign-out.
- YouTube DOM is volatile. Sidebar/Library injection uses `MutationObserver`
  with multiple fallback selectors and gives up gracefully if YouTube changes
  things again. The popup keeps working regardless.

## License

MIT — see `LICENSE`.
