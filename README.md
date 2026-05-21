# totp-tools

An open-source 2FA / TOTP toolkit and a small set of everyday web utilities, designed to deploy for free on **Cloudflare Pages**. Pure static, zero build step, runs entirely in the browser.

Live demo: https://totp-tools.pages.dev

## ✨ Features

- **2FA multi-account manager** — store as many accounts as you need locally; automatic 30-second refresh; add by Base32 secret, scan a QR code, or import from a saved image; rename inline; reorder, copy, regenerate QR; JSON import / export for backup
- **Text utilities** — dedupe, sort, case conversion, character / word / byte counts, Base64 and URL encode/decode, JSON pretty-print and minify, line numbering
- **Image utilities** — drag-drop / paste / pick a file, resize, compress, convert between JPG / PNG / WEBP, copy as Base64
- **Currency converter** — live FX rates from [Frankfurter / ECB](https://frankfurter.dev), no API key required
- **More tools** — UUID v4, secure password generator, timestamp converter, SHA-1/256/384/512 hashing, QR code generator
- **In-app navigation** — switching between tools never reloads the page; the sidebar acts as a SPA router so timers, focus state, and library globals are preserved

## 🔒 Privacy

Every tool runs **entirely in the browser**. Secrets, images, and text are never sent to any server. The only outbound call the site makes is to `frankfurter.dev` for exchange rates (currency codes only, no user data).

## 🗂️ Layout

```
public/
├── index.html       # 2FA multi-account manager
├── note.html        # Text utilities
├── work.html        # Image utilities
├── money.html       # Currency converter
├── more.html        # UUID / password / timestamp / hash / QR
├── _redirects       # Cloudflare Pages route (/2fa/* → index.html)
└── assets/
    ├── css/style.css
    ├── img/favicon.svg
    └── js/
        ├── common.js              # Sidebar, toast, clipboard, SPA router
        ├── otpauth.umd.min.js     # MIT, hectorm/otpauth 9.3.4
        ├── qrcode.min.js          # MIT, davidshimjs/qrcodejs
        └── jsQR.js                # Apache-2.0, cozmo/jsQR
```

No bundler, no build script. Any static host will serve it.

## 🚀 Deploy to Cloudflare Pages

### Option 1 — One-shot Wrangler deploy (recommended)

```bash
npx wrangler login                                                         # one-time
npx wrangler pages deploy ./public --project-name totp-tools
```

Wrangler creates the project on first run. Re-run the command to publish updates.

### Option 2 — Connect a Git repository

1. Push the repo to GitHub.
2. In the [Cloudflare dashboard](https://dash.cloudflare.com) go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick the repo. Leave **Build command** empty. Set **Build output directory** to `public`.

### Option 3 — GitHub Actions

The repo ships with `.github/workflows/deploy.yml`. Add two repository secrets:

- `CLOUDFLARE_API_TOKEN` — created at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) using the **Edit Cloudflare Workers** template
- `CLOUDFLARE_ACCOUNT_ID` — visible at the bottom-right of the Cloudflare dashboard

Pushing to `main` will deploy automatically.

## 🛠 Local preview

```bash
cd public && python3 -m http.server 8080
```

Open <http://127.0.0.1:8080>.

## 📜 License

[MIT](LICENSE). Bundled third-party assets:

- [otpauth](https://github.com/hectorm/otpauth) by Héctor Molinero Fernández — MIT
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) by Sangmin Shim — MIT
- [jsQR](https://github.com/cozmo/jsQR) by Daniel Cohen Gindi — Apache 2.0
