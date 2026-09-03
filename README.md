# Tesla Marketplaces & Spacecominvestment Full-Stack Platform

A fully operational full-stack web platform inspired by [tesla.com](https://www.tesla.com), combining official Tesla design aesthetics with a robust Python REST API, SQLite database, multi-chain crypto escrow (USDT, USDC, ETH, BTC), live Supercharger locator, Stock Watcher, and Fleet API Vehicle Command proxy.

---

## 🚀 Deployment on Railway
This repository is pre-configured for instant deployment on [Railway](https://railway.app):
1. **Procfile:** Configured with `web: python3 server.py`.
2. **Environment Port:** Automatically binds to Railway's `$PORT` environment variable (`os.environ.get('PORT', 8000)`).
3. **Persistent SQLite:** `tesla_platform.db` initializes automatically on first boot.

---

## 📁 File Structure
* `server.py` — Python full-stack server & REST API handling briefs, stock watch, vehicle commands, and SQLite storage.
* `Procfile` — Railway deployment entrypoint.
* `index.html` — Official Tesla.com snap-scroll homepage with CDN video assets.
* `stock-watch.html` — Live Tesla inventory & price drop watcher.
* `command.html` — Fleet API vehicle command proxy (lock, climate, charge).
* `escrow.html` — Multi-chain crypto escrow payment gateway (USDT, USDC, ETH, BTC).
* `superchargers.html` — Global V3/V4 Supercharger station locator.
* `valuation.html` — Consignment valuation & appraisal calculator.
* `dashboard.html` — Customer garage & portfolio asset manager.
* `admin-dashboard.html` — Executive owner control room & telemetry.
* `auth.html` — TLS 1.3 secure authentication gateway.
* `styles.css` — Unified Tesla design system stylesheet.
* `i18n.js` — Multi-language localization (English, Spanish, French, German, Japanese).
