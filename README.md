# Tesla Marketplaces & Spacecominvestment Ecosystem

A high-performance, multi-page web platform inspired by [tesla.com](https://www.tesla.com), combining official Tesla design aesthetics (minimalism, bold typography, full-viewport cinematic photography/video, generous whitespace, and sleek dark/light contrast sections) with an advanced **Vehicle & Energy Marketplaces, Proxy Sourcing, and White-Glove Consignment** platform.

---

## 🚀 Key Features & Architecture

1. **Authentic Tesla.com Homepage (`index.html`)**
   * Full-viewport vertical snap-scrolling layout matching official Tesla design.
   * Cinematic background videos and imagery sourced directly from Tesla’s official CDN assets (`digitalassets.tesla.com`).
   * Minimalist floating header navigation with quick-links to Model Y, Model 3, Model S, Model X, Cybertruck, Solar Roof, and Powerwall.

2. **Multi-Page Platform Suite**
   * **Ecosystem (`how-it-works.html`):** Step-by-step breakdown of Tesla's closed-loop sustainable energy model (Solar ➔ Storage ➔ Transport ➔ AI Autonomy).
   * **Showcase (`categories.html`):** Filterable portfolio of vehicles and home energy units available for consignment and proxy acquisition.
   * **Vehicle & Energy Configurator (`configurator.html`):** Interactive builder for custom vehicle specifications, paint options, add-ons, and real-time pricing.
   * **Solar & VPP Calculator (`calculator.html`):** Interactive estimator for 25-year net savings, grid independence, and Virtual Power Plant earnings.
   * **AI & FSD Telemetry (`ai-fleet.html`):** Real-time metrics for neural network miles, Dojo supercomputing exaflops, and active robotaxi fleets.
   * **Source / Consign Brief (`request.html`):** Secure intake portal for custom vehicle sourcing briefs and consignment intake.
   * **Track Order (`track.html`):** Real-time dossier lookup for tracking battery PPI diagnostics and escrow transit.
   * **About & Contact (`about.html`):** Corporate mission, global impact statistics, and executive contact desk.

3. **Strictly Segregated Portals & Authentication**
   * **Authentication Gateway (`auth.html`):** TLS 1.3-encrypted sign-in and sign-up portal with automated role routing.
   * **Client Portal (`dashboard.html`):** Dedicated personal garage tracking active orders, VIN delivery dates, and home energy gateway telemetry.
   * **Admin & Owner Control Room (`admin-dashboard.html`):** Enterprise management dashboard for root managing directors monitoring global Gigafactory outputs, escrow volumes ($42.5M), and fleet OTA update broadcasts.

4. **Multi-Language Internationalization (`i18n.js`)**
   * Built-in dynamic translation selector supporting **English, Spanish (Español), French (Français), German (Deutsch), and Japanese (日本語)** with persistent preference storage.

---

## 📁 File Structure

* `index.html` — Official Tesla.com-inspired snap-scroll homepage with CDN video assets.
* `how-it-works.html` — Ecosystem and sustainable energy architecture.
* `categories.html` — Filterable Tesla vehicle and energy showcase.
* `configurator.html` — Interactive vehicle and energy configurator.
* `calculator.html` — Solar & VPP financial calculator.
* `ai-fleet.html` — AI and FSD telemetry dashboard.
* `request.html` — Sourcing brief and consignment submission form.
* `track.html` — Real-time tracking portal.
* `about.html` — Corporate mission and contact desk.
* `dashboard.html` — Customer garage and order tracker.
* `admin-dashboard.html` — Executive owner control room.
* `auth.html` — Secure TLS authentication gateway.
* `styles.css` — Unified Tesla design system stylesheet.
* `app.js` — Core interactive frontend scripts (mobile toggle, FAQ accordion, mock submissions).
* `i18n.js` — Multi-language localization dictionary and DOM binder.

---

## 🛠️ Local Development & Preview

The project is fully pre-configured and running in your workspace environment:
* **Local Server:** Python HTTP server running on port `8000`.
* **Live Preview:** Accessible directly via the Arena workspace preview interface.
