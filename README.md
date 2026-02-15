# Dev Toolbox

A privacy-first, offline-friendly toolbox of developer utilities that runs entirely in the browser. No backend required, and no tracking by default.

## Highlights
- Built with Angular + TypeScript and shipped as static assets.
- TailwindCSS + Angular Material with a glassmorphism UI.
- CodeMirror 6 for rich editor inputs.
- Web Workers for heavy JSON/Text operations.
- Offline-ready PWA in production builds.
- Modular, lazy-loaded routes per tool category.

## Supported Tools
JSON Core:
- JSON Formatter / Validator
- JSON Minifier
- JSON Canonicalizer
- JSON Diff
- JSON <-> YAML
- JSON Schema Validator
- JSONPath Evaluator
- JSON Patch (RFC 6902)
- JSON Merge Patch
- JSON -> Types
- JSON5 / JSONC -> JSON

Text Tools:
- Text Diff
- Regex Tester
- Text Editor + Counter
- Whitespace Normalizer
- Markdown Preview
- Unicode Inspector

Crypto & Encoding:
- Base64 Encode/Decode
- URL Encode/Decode
- JWT Decoder
- Hash Generator
- UUID Generator
- UUIDv7 / ULID
- HMAC Generator
- Password Generator

Data Utilities:
- Timestamp Converter
- CSV <-> JSON
- Cron Next Run
- Timezone Converter
- CSV Profiler
- OpenAPI Snippet Viewer

SQL Tools:
- SQL Formatter / Minifier
- SQL IN Clause Builder
- SQL Identifier Escaper
- Execution Plan Analyzer

## Quick Start
```bash
npm install
npm start
```

Then open `http://localhost:4200/`.

## Scripts
- `npm start`: Run the dev server (development configuration).
- `npm run build`: Production build.
- `npm run watch`: Build in watch mode for development.
- `npm test`: Run unit tests.

## Build Output
Production builds emit static assets to `dist/devtools`.

## Deploying (S3 + CloudFront)
1. Build the app and upload the contents of `dist/devtools` to your S3 bucket.
2. Enable S3 static website hosting.
3. CloudFront:
   - Set default root object to `index.html`.
   - Add custom error responses for 403/404 to serve `/index.html` with HTTP 200 (SPA routing).
4. Cache headers (recommended):
   - `index.html`: `Cache-Control: no-cache`
   - `/*.js`, `/*.css`, assets: `Cache-Control: public, max-age=31536000, immutable`

## Ads / Monetization
Ad placeholder lives here:
- `src/app/shared/components/ad-slot/ad-slot.component.html`

Paste your Carbon Ads / EthicalAds / AdSense snippet in the commented section within that file.

## Privacy & Security Notes
- All processing happens locally in the browser.
- No user input is sent to any server.
- Analytics are off by default and optional.
- JWT decoder is **decode-only** and does not verify signatures.
- "Remember my inputs" is off by default; enabling it stores inputs locally on this device.

## Contributor Guidelines
- Keep changes focused and incremental; avoid drive-by refactors.
- Follow existing Angular + TypeScript patterns and keep lint/build clean.
- Prefer pure, testable functions for data transforms and heavy parsing.
- Use Web Workers for CPU-heavy operations to keep the UI responsive.
- Keep UI components accessible (labels, contrast, keyboard focus, ARIA where needed).
- Respect privacy-by-default: no new tracking, network calls, or telemetry without explicit discussion.
- Update docs when you add or change tools, routes, or build behavior.

Before opening a PR:
- Run `npm test` and `npm run build`.
- Verify the affected tool in the browser (inputs, outputs, and error states).
