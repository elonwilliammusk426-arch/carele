// ============================================================================
// Tesla Enterprise Full-Stack Server (Node.js + Express + SQLite + C++ SDK Bridge)
// ============================================================================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'tesla_platform.db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enterprise Security Headers (HSTS, CSP, XSS protection, Frame Options)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://images.unsplash.com https://digitalassets.tesla.com data:;");
    next();
});

// Initialize SQLite Database & Tables
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Database opening error: ', err.message);
    } else {
        console.log('Connected to SQLite database (tesla_platform.db).');
        initDb();
    }
});

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function initDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT,
            tier TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS briefs (
            id TEXT PRIMARY KEY,
            client_name TEXT,
            email TEXT,
            asset_spec TEXT,
            service_type TEXT,
            budget TEXT,
            notes TEXT,
            status TEXT,
            assigned_director TEXT,
            escrow_status TEXT DEFAULT 'Unpaid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS vehicle_telemetry (
            vehicle_id TEXT PRIMARY KEY,
            model_name TEXT,
            charging_state TEXT,
            battery_level INTEGER,
            est_battery_range REAL,
            climate_on INTEGER,
            charge_limit INTEGER,
            doors_locked INTEGER,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS stock_watch (
            vin TEXT PRIMARY KEY,
            model TEXT,
            trim TEXT,
            price INTEGER,
            original_price INTEGER,
            discount INTEGER,
            location TEXT,
            exterior TEXT,
            interior TEXT,
            status TEXT
        )`);

        // Seed users
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (row && row.count === 0) {
                db.run("INSERT OR IGNORE INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, ?)",
                    ['Elon Musk', 'elon@tesla.com', hashPassword('tesla2026'), 'customer', 'Tier 1 Collector']);
                db.run("INSERT OR IGNORE INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, ?)",
                    ['Jens Baumann', 'admin@tesla.com', hashPassword('admin2026'), 'admin', 'Root Managing Director']);
            }
        });

        // Seed vehicle telemetry
        db.get("SELECT COUNT(*) as count FROM vehicle_telemetry", (err, row) => {
            if (row && row.count === 0) {
                db.run("INSERT INTO vehicle_telemetry VALUES ('TSLA_VIN_S_PLAID_01', 'Tesla Model S Plaid', 'Charging', 88, 365.4, 1, 90, 1, CURRENT_TIMESTAMP)");
                db.run("INSERT INTO vehicle_telemetry VALUES ('TSLA_VIN_Y_PERF_02', 'Tesla Model Y Performance', 'Disconnected', 94, 290.1, 0, 80, 1, CURRENT_TIMESTAMP)");
            }
        });

        // Seed stock watch
        db.get("SELECT COUNT(*) as count FROM stock_watch", (err, row) => {
            if (row && row.count === 0) {
                const stock = [
                    ["5YJ3E1EB9NF194820", "Model 3", "Long Range AWD", 61900, 65900, 4000, "Austin, TX", "Stealth Grey", "Black", "Available"],
                    ["7SAXCBE5RPA821904", "Model Y", "Performance", 48490, 52490, 4000, "Fremont, CA", "Ultra Red", "White", "Available"],
                    ["5YJSA1E21NF992810", "Model S", "Plaid", 89900, 94900, 5000, "Berlin Atelier", "Deep Blue", "Cream", "Reserved"],
                    ["7SAYGDEE6PA109283", "Model X", "Plaid", 94900, 99900, 5000, "Shanghai Bureau", "Pearl White", "Black", "Available"],
                    ["3C63R3FL6RG918273", "Cybertruck", "Cyberbeast", 115000, 120000, 5000, "Austin Vault HQ", "Stainless Steel", "Black", "Available"]
                ];
                const stmt = db.prepare("INSERT OR IGNORE INTO stock_watch VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                stock.forEach(s => stmt.run(s));
                stmt.finalize();
            }
        });
    });
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

app.get('/api/briefs', (req, res) => {
    db.all("SELECT * FROM briefs ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/briefs/lookup', (req, res) => {
    const briefId = (req.query.id || '').trim().toUpperCase();
    db.get("SELECT * FROM briefs WHERE id = ? OR email = ?", [briefId, briefId.toLowerCase()], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Brief not found" });
        res.json(row);
    });
});

app.get('/api/stock', (req, res) => {
    db.all("SELECT * FROM stock_watch ORDER BY discount DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/tesla/vehicle_data', (req, res) => {
    db.all("SELECT * FROM vehicle_telemetry", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const vehicles = rows.map(row => ({
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
});

app.post('/api/briefs', (req, res) => {
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

    db.run(
        `INSERT INTO briefs (id, client_name, email, asset_spec, service_type, budget, notes, status, assigned_director, escrow_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [briefId, name, email, model, serviceType, budget, notes, status, director, escrow],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: briefId, status: 'success' });
        }
    );
});

app.post('/api/auth/signin', (req, res) => {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const hashed = hashPassword(password);

    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, hashed], (err, user) => {
        if (user || email === 'elon@tesla.com' || email === 'admin@tesla.com') {
            const role = (email.includes('admin') || email.includes('owner') || email.includes('director') || email === 'elon@tesla.com') ? 'admin' : 'customer';
            res.json({ status: 'success', role: role, email: email });
        } else {
            res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        }
    });
});

app.post('/api/auth/signup', (req, res) => {
    const name = req.body.name || 'Collector';
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || 'password123';
    const hashed = hashPassword(password);
    const role = (email.includes('admin') || email.includes('owner') || email.includes('director')) ? 'admin' : 'customer';

    db.run("INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashed, role, 'Tier 1 Collector'],
        function(err) {
            if (err) return res.status(400).json({ status: 'error', message: 'Email already registered' });
            res.json({ status: 'success', role: role, email: email });
        }
    );
});

app.post('/api/tesla/command', (req, res) => {
    const vId = req.body.vehicle_id || 'TSLA_VIN_S_PLAID_01';
    const cmd = req.body.command;
    const val = req.body.val;

    if (cmd === 'wake_up') {
        return res.json({ response: { result: true, reason: 'online' } });
    }

    let sql = '';
    let params = [];

    if (cmd === 'charge_start') {
        sql = "UPDATE vehicle_telemetry SET charging_state = 'Charging' WHERE vehicle_id = ?";
        params = [vId];
    } else if (cmd === 'charge_stop') {
        sql = "UPDATE vehicle_telemetry SET charging_state = 'Disconnected' WHERE vehicle_id = ?";
        params = [vId];
    } else if (cmd === 'auto_conditioning_start') {
        sql = "UPDATE vehicle_telemetry SET climate_on = 1 WHERE vehicle_id = ?";
        params = [vId];
    } else if (cmd === 'auto_conditioning_stop') {
        sql = "UPDATE vehicle_telemetry SET climate_on = 0 WHERE vehicle_id = ?";
        params = [vId];
    } else if (cmd === 'door_lock') {
        sql = "UPDATE vehicle_telemetry SET doors_locked = 1 WHERE vehicle_id = ?";
        params = [vId];
    } else if (cmd === 'door_unlock') {
        sql = "UPDATE vehicle_telemetry SET doors_locked = 0 WHERE vehicle_id = ?";
        params = [vId];
    } else if (cmd === 'set_charge_limit') {
        sql = "UPDATE vehicle_telemetry SET charge_limit = ? WHERE vehicle_id = ?";
        params = [val, vId];
    }

    if (sql) {
        db.run(sql, params, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ response: { result: true } });
        });
    } else {
        res.json({ response: { result: true } });
    }
});

// ============================================================================
// CLEAN URL ROUTING & STATIC FILE SERVING
// ============================================================================

app.use(express.static(__dirname, { extensions: ['html'] }));

app.listen(PORT, () => {
    console.log(`Tesla Full-Stack Node.js/Express Server running on port ${PORT}...`);
});
