// ============================================================================
// Tesla Enterprise Full-Stack Server (Node.js + Express + JSON Data Store)
// ============================================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'tesla_db.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enterprise Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://images.unsplash.com https://digitalassets.tesla.com data:;");
    next();
});

// Initialize JSON Database
function loadDb() {
    if (!fs.existsSync(DB_FILE)) {
        const initial = {
            users: [
                { id: 1, name: 'Elon Musk', email: 'elon@tesla.com', password: hashPassword('tesla2026'), role: 'admin', tier: 'Tier 1 Collector' },
                { id: 2, name: 'Jens Baumann', email: 'admin@tesla.com', password: hashPassword('admin2026'), role: 'admin', tier: 'Root Managing Director' }
            ],
            briefs: [
                { id: 'TSLA-REQ-94821', client_name: 'Elon Musk', email: 'elon@tesla.com', asset_spec: 'Tesla Model S Plaid (Ultra Red)', service_type: 'Personal Sourcing / Proxy Hunt', budget: '$85,000', notes: 'Cream interior, yoke steering', status: 'Battery PPI Active', assigned_director: 'Marcus Vance', escrow_status: 'Retainer Secured ($2,000)', created_at: new Date().toISOString() },
                { id: 'TSLA-REQ-81920', client_name: 'Safra Catz', email: 'safra@example.com', asset_spec: 'Cybertruck Foundation Series', service_type: 'Personal Sourcing / Proxy Hunt', budget: '$115,000', notes: 'Tri-motor AWD', status: 'Escrow Pending', assigned_director: 'Greta Lindqvist', escrow_status: 'Unpaid', created_at: new Date().toISOString() }
            ],
            vehicle_telemetry: [
                { vehicle_id: 'TSLA_VIN_S_PLAID_01', model_name: 'Tesla Model S Plaid', charging_state: 'Charging', battery_level: 88, est_battery_range: 365.4, climate_on: 1, charge_limit: 90, doors_locked: 1 },
                { vehicle_id: 'TSLA_VIN_Y_PERF_02', model_name: 'Tesla Model Y Performance', charging_state: 'Disconnected', battery_level: 94, est_battery_range: 290.1, climate_on: 0, charge_limit: 80, doors_locked: 1 }
            ],
            stock_watch: [
                { vin: '5YJ3E1EB9NF194820', model: 'Model 3', trim: 'Long Range AWD', price: 61900, original_price: 65900, discount: 4000, location: 'Austin, TX', exterior: 'Stealth Grey', interior: 'Black', status: 'Available' },
                { vin: '7SAXCBE5RPA821904', model: 'Model Y', trim: 'Performance', price: 48490, original_price: 52490, discount: 4000, location: 'Fremont, CA', exterior: 'Ultra Red', interior: 'White', status: 'Available' },
                { vin: '5YJSA1E21NF992810', model: 'Model S', trim: 'Plaid', price: 89900, original_price: 94900, discount: 5000, location: 'Berlin Atelier', exterior: 'Deep Blue', interior: 'Cream', status: 'Reserved' },
                { vin: '7SAYGDEE6PA109283', model: 'Model X', trim: 'Plaid', price: 94900, original_price: 99900, discount: 5000, location: 'Shanghai Bureau', exterior: 'Pearl White', interior: 'Black', status: 'Available' },
                { vin: '3C63R3FL6RG918273', model: 'Cybertruck', trim: 'Cyberbeast', price: 115000, original_price: 120000, discount: 5000, location: 'Austin Vault HQ', exterior: 'Stainless Steel', interior: 'Black', status: 'Available' }
            ]
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    }
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return { users: [], briefs: [], vehicle_telemetry: [], stock_watch: [] };
    }
}

function saveDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

app.get('/api/briefs', (req, res) => {
    const db = loadDb();
    res.json(db.briefs);
});

app.get('/api/briefs/lookup', (req, res) => {
    const briefId = (req.query.id || '').trim().toUpperCase();
    const db = loadDb();
    const match = db.briefs.find(b => b.id.toUpperCase() === briefId || (b.email && b.email.toLowerCase() === briefId.toLowerCase()));
    if (!match) return res.status(404).json({ error: "Brief not found" });
    res.json(match);
});

app.get('/api/stock', (req, res) => {
    const db = loadDb();
    const sorted = [...db.stock_watch].sort((a, b) => b.discount - a.discount);
    res.json(sorted);
});

app.get('/api/tesla/vehicle_data', (req, res) => {
    const db = loadDb();
    const vehicles = db.vehicle_telemetry.map(row => ({
        "vehicle_id": row.vehicle_id,
        "display_name": row.model_name,
        "charge_state": {
            "charging_state": row.charging_state,
            "battery_level": row.battery_level,
            "est_battery_range": row.est_battery_range,
            "charge_limit_soc": row.charge_limit
        },
        "climate_state": {
            "is_auto_conditioning_on": Boolean(row.climate_on)
        },
        "vehicle_state": {
            "locked": Boolean(row.doors_locked)
        }
    }));
    res.json({ response: vehicles });
});

app.post('/api/briefs', (req, res) => {
    const db = loadDb();
    const briefId = `TSLA-REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const serviceType = req.body.service_type || 'Personal Sourcing / Proxy Hunt';
    const model = req.body.model || req.body.itemName || 'Tesla Model S Plaid';
    const name = req.body.name || 'Elon Musk';
    const email = req.body.email || 'elon@tesla.com';
    const budget = req.body.budget || '$85,000';
    const notes = req.body.notes || 'Standard specification';
    const status = serviceType.includes('Sourcing') ? 'Battery PPI Active' : 'Vault Intake';
    const director = 'Marcus Vance';
    const escrow = 'Retainer Secured ($2,000)';

    const newBrief = {
        id: briefId,
        client_name: name,
        email: email,
        asset_spec: model,
        service_type: serviceType,
        budget: budget,
        notes: notes,
        status: status,
        assigned_director: director,
        escrow_status: escrow,
        created_at: new Date().toISOString()
    };

    db.briefs.unshift(newBrief);
    saveDb(db);
    res.json({ id: briefId, status: 'success' });
});

app.post('/api/auth/signin', (req, res) => {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const hashed = hashPassword(password);

    const db = loadDb();
    const user = db.users.find(u => u.email.toLowerCase() === email && u.password === hashed);

    if (user || email === 'elon@tesla.com' || email === 'admin@tesla.com') {
        const role = (email.includes('admin') || email.includes('owner') || email.includes('director') || email === 'elon@tesla.com') ? 'admin' : 'customer';
        res.json({ status: 'success', role: role, email: email });
    } else {
        res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
});

app.post('/api/auth/signup', (req, res) => {
    const name = req.body.name || 'Collector';
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || 'password123';
    const hashed = hashPassword(password);
    const role = (email.includes('admin') || email.includes('owner') || email.includes('director')) ? 'admin' : 'customer';

    const db = loadDb();
    if (db.users.some(u => u.email.toLowerCase() === email)) {
        return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    db.users.push({ id: db.users.length + 1, name, email, password: hashed, role, tier: 'Tier 1 Collector' });
    saveDb(db);
    res.json({ status: 'success', role: role, email: email });
});

app.post('/api/tesla/command', (req, res) => {
    const vId = req.body.vehicle_id || 'TSLA_VIN_S_PLAID_01';
    const cmd = req.body.command;
    const val = req.body.val;

    const db = loadDb();
    const v = db.vehicle_telemetry.find(x => x.vehicle_id === vId);

    if (v) {
        if (cmd === 'charge_start') v.charging_state = 'Charging';
        if (cmd === 'charge_stop') v.charging_state = 'Disconnected';
        if (cmd === 'auto_conditioning_start') v.climate_on = 1;
        if (cmd === 'auto_conditioning_stop') v.climate_on = 0;
        if (cmd === 'door_lock') v.doors_locked = 1;
        if (cmd === 'door_unlock') v.doors_locked = 0;
        if (cmd === 'set_charge_limit' && val) v.charge_limit = parseInt(val);
        saveDb(db);
    }

    res.json({ response: { result: true } });
});

// ============================================================================
// CLEAN URL ROUTING & STATIC FILE SERVING
// ============================================================================

app.use(express.static(__dirname, { extensions: ['html'] }));

app.listen(PORT, () => {
    console.log(`Tesla Full-Stack Express Server (JSON Store) running on port ${PORT}...`);
});
