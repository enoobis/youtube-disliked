# youtube disliked

browser extension. lists the videos you disliked on youtube.

manifest v3 · typescript · esbuild · zero runtime deps.
works in any chromium-based browser (chrome, edge, brave, opera, vivaldi, arc).

## install (no build needed)

1. download this repo as a zip ([direct link](https://github.com/enoobis/youtube-disliked/archive/refs/heads/main.zip)) and unpack it.
2. open `dist/youtube-disliked/manifest.json`, replace `PASTE_YOUR_OAUTH_CLIENT_ID_HERE...` with your client id (see [setup](#setup)).
3. open your browser's extensions page, enable developer mode, click **load unpacked**, select the `dist/youtube-disliked` folder.

| browser | extensions url        |
| ------- | --------------------- |
| chrome  | `chrome://extensions` |
| edge    | `edge://extensions`   |
| brave   | `brave://extensions`  |
| opera   | `opera://extensions`  |

## setup

1. create an oauth 2.0 client id (type **chrome extension**, scope `youtube.readonly`) in [google cloud console](https://console.cloud.google.com/).
2. copy the extension id from your browser's extensions page, paste it into the oauth client's *application id* field.
3. paste the client id into `dist/youtube-disliked/manifest.json` → `oauth2.client_id`, then reload the extension.

## build from source (optional)

```bash
npm install
npm run build
```

output: `dist/youtube-disliked/`.

## license

mit
