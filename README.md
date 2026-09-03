# Tesla Marketplaces & Spacecominvestment Full-Stack Platform

A fully operational full-stack web platform inspired by [tesla.com](https://www.tesla.com), combining official Tesla design aesthetics with a robust Python REST API, SQLite database, Stripe escrow simulation, automated notification dispatch, and real-time telemetry.

---

## ⚡ Full-Stack Architecture

1. **Database (`tesla_platform.db` / SQLite)**
   * Relational database storing user accounts, sourcing briefs, consignment vault inventory, encrypted concierge messages, and automated email notifications.

2. **Backend Server (`server.py` / Python REST API)**
   * Built on Python `http.server` and `sqlite3`.
   * Handles REST endpoints for brief submissions, tracking lookups, Stripe escrow payments (`/api/escrow/pay`), email notification logging, and real-time chat.

3. **Frontend & Tesla Design System (`styles.css`, `index.html`, `dashboard.html`, `admin-dashboard.html`)**
   * Full-bleed cinematic video/photography hero sections matching official Tesla standards.
   * Floating transparent navigation that solidifies on scroll.
   * Monochrome client portals and executive admin control rooms featuring real-time data sync with the backend.

---

## 🚀 Live Features
* **Real Database Persistence:** Sourcing briefs and escrow updates persist across reloads and sync between customers and admins.
* **Stripe Escrow Simulation:** Securely fund vehicle retainers and escrow deposits with instant confirmation.
* **Automated Email Dispatch:** Real notification logging for acquisition briefs and BMS battery health reports.
* **Multi-Language Internationalization (`i18n.js`):** English, Spanish, French, German, and Japanese.
