# Notepad — Just text

A small iPhone-friendly, browser-only PWA. Paste reads text/plain, the editor is a textarea, and Copy writes text/plain. Rich clipboard HTML is never read or interpreted. Literal angle-bracket text remains literal. Invisible control and directional override characters are stripped; this also removes zero-width joiners used in some scripts and emoji.

## Privacy
No backend, analytics, third-party libraries, forms, note URLs, localStorage, sessionStorage, IndexedDB, or note caching. Only public application assets are cached by the service worker. Notes never enter GitHub or deployment artifacts. Host access logs can contain ordinary request metadata such as IP addresses, but not editor contents.

The editor clears synchronously on visibility hidden, window blur, pagehide, freeze, and a persisted pageshow. Clearing replaces the textarea to discard native undo history and invalidates pending clipboard reads. This intentionally clears text when switching apps, locking the phone, navigating away, or losing focus, including some permission dialogs. Copy first if you need to keep text. Reload starts empty.

iOS can terminate a process without dispatching any event. Force-close detection, app-switcher snapshots, browser/OS memory erasure, keyboard behavior, and system clipboard/history clearing cannot be guaranteed. Clear affects only this editor. Copy leaves text on the system clipboard, which may sync through OS features.

## Install and offline use
Open in Safari, Share → Add to Home Screen. Visit once online and allow the service worker to finish installing before relying on offline use. Only app files persist. Clipboard APIs require HTTPS (or localhost), a user gesture, and browser permission. If Paste is unavailable, touch and hold in the editor and choose Paste. If Copy is blocked, use the selection menu.

## Deploy for free
This public repository can use GitHub Pages on GitHub Free, without paid compute. In repository Settings → Pages, select **GitHub Actions** as the build source. Then run the **Deploy Notepad** workflow, or push to main. Workflow deployments are automatic on main pushes. Each deployment stamps the commit into the service worker cache version. The app checks for updates on opening, returning, reconnecting, and once a minute while running. Updates activate automatically and may clear/reload the editor. Offline devices receive updates when online again.

Cloudflare Pages and Hugging Face Static Spaces were also considered; neither needs a server for this workload. GitHub Pages keeps deployment tied directly to this repository with no additional hosting account. Do not enable paid products.

Official references:
- https://developers.cloudflare.com/pages/platform/limits/
- https://huggingface.co/docs/hub/spaces-overview
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

## Verification
Run `node test.cjs` (no dependencies). Covers plain-text paste/copy, hidden control stripping, clear and native-control replacement, lifecycle events, delayed paste after clearing, clipboard denial fallbacks, absence of note persistence/network APIs, cached assets with a failing network, and exclusion of POST requests from the worker cache.

Browser preview checked typing, Paste, Copy, Clear, and an empty editor after reload in Chromium. Offline caching was tested through an isolated service-worker harness with all network requests failing. Physical iPhone/Safari, OS termination, actual device offline installation, permission prompts, and automatic update deployment still need device/live-host verification. No claim of guaranteed secure erasure is made.
