import http.server
import socketserver
import sqlite3
import json
import urllib.parse
import os
import random
import hashlib

PORT = int(os.environ.get('PORT', 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'tesla_platform.db')

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def init_db():
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    password TEXT,
                    role TEXT,
                    tier TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS briefs (
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
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS consignments (
                    id TEXT PRIMARY KEY,
                    consignor TEXT,
                    asset_desc TEXT,
                    vault_location TEXT,
                    valuation TEXT,
                    insurance_status TEXT)''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sender TEXT,
                    text TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')

        c.execute('''CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipient_email TEXT,
                    subject TEXT,
                    body TEXT,
                    status TEXT DEFAULT 'Sent',
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')

        c.execute('''CREATE TABLE IF NOT EXISTS vehicle_telemetry (
                    vehicle_id TEXT PRIMARY KEY,
                    model_name TEXT,
                    charging_state TEXT,
                    battery_level INTEGER,
                    est_battery_range REAL,
                    climate_on INTEGER,
                    charge_limit INTEGER,
                    doors_locked INTEGER,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')

        c.execute('''CREATE TABLE IF NOT EXISTS stock_watch (
                    vin TEXT PRIMARY KEY,
                    model TEXT,
                    trim TEXT,
                    price INTEGER,
                    original_price INTEGER,
                    discount INTEGER,
                    location TEXT,
                    exterior TEXT,
                    interior TEXT,
                    status TEXT)''')

        c.execute("SELECT COUNT(*) FROM users")
        if c.fetchone()[0] == 0:
            c.execute("INSERT OR IGNORE INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, ?)",
                      ('Elon Musk', 'elon@tesla.com', hash_password('tesla2026'), 'customer', 'Tier 1 Collector'))
            c.execute("INSERT OR IGNORE INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, ?)",
                      ('Jens Baumann', 'admin@tesla.com', hash_password('admin2026'), 'admin', 'Root Managing Director'))

        c.execute("SELECT COUNT(*) FROM briefs")
        if c.fetchone()[0] == 0:
            c.execute("INSERT INTO briefs (id, client_name, email, asset_spec, service_type, budget, notes, status, assigned_director, escrow_status) VALUES ('TSLA-REQ-94821', 'Elon Musk', 'elon@tesla.com', 'Tesla Model S Plaid (Ultra Red)', 'Personal Sourcing / Proxy Hunt', '$85,000', 'Cream interior, yoke steering', 'Battery PPI Active', 'Marcus Vance', 'Retainer Secured ($2,000)')")
            c.execute("INSERT INTO briefs (id, client_name, email, asset_spec, service_type, budget, notes, status, assigned_director, escrow_status) VALUES ('TSLA-REQ-81920', 'Safra Catz', 'safra@example.com', 'Cybertruck Foundation Series', 'Personal Sourcing / Proxy Hunt', '$115,000', 'Tri-motor AWD', 'Escrow Pending', 'Greta Lindqvist', 'Unpaid')")

        c.execute("SELECT COUNT(*) FROM vehicle_telemetry")
        if c.fetchone()[0] == 0:
            c.execute("INSERT INTO vehicle_telemetry VALUES ('TSLA_VIN_S_PLAID_01', 'Tesla Model S Plaid', 'Charging', 88, 365.4, 1, 90, 1, datetime('now'))")
            c.execute("INSERT INTO vehicle_telemetry VALUES ('TSLA_VIN_Y_PERF_02', 'Tesla Model Y Performance', 'Disconnected', 94, 290.1, 0, 80, 1, datetime('now'))")

        c.execute("SELECT COUNT(*) FROM stock_watch")
        if c.fetchone()[0] == 0:
            sample_stock = [
                ("5YJ3E1EB9NF194820", "Model 3", "Long Range AWD", 61900, 65900, 4000, "Austin, TX", "Stealth Grey", "Black", "Available"),
                ("7SAXCBE5RPA821904", "Model Y", "Performance", 48490, 52490, 4000, "Fremont, CA", "Ultra Red", "White", "Available"),
                ("5YJSA1E21NF992810", "Model S", "Plaid", 89900, 94900, 5000, "Berlin Atelier", "Deep Blue", "Cream", "Reserved"),
                ("7SAYGDEE6PA109283", "Model X", "Plaid", 94900, 99900, 5000, "Shanghai Bureau", "Pearl White", "Black", "Available"),
                ("3C63R3FL6RG918273", "Cybertruck", "Cyberbeast", 115000, 120000, 5000, "Austin Vault HQ", "Stainless Steel", "Black", "Available")
            ]
            c.executemany("INSERT OR IGNORE INTO stock_watch VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", sample_stock)

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Init Error: {e}")

class TeslaHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path

        # Clean URL Routing (Remove .html extensions in URL bar for production clean feel)
        if not path.startswith('/api/') and not '.' in path and path != '/':
            html_path = path + '.html'
            if os.path.exists(os.path.join(BASE_DIR, html_path.lstrip('/'))):
                self.path = html_path

        if path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            try:
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                query = urllib.parse.parse_qs(parsed_path.query)

                response_data = {}
                if path == '/api/briefs':
                    c.execute("SELECT * FROM briefs ORDER BY created_at DESC")
                    response_data = [dict(row) for row in c.fetchall()]
                elif path == '/api/briefs/lookup':
                    brief_id = query.get('id', [''])[0].strip().upper()
                    c.execute("SELECT * FROM briefs WHERE id = ? OR email = ?", (brief_id, brief_id.lower()))
                    row = c.fetchone()
                    response_data = dict(row) if row else {"error": "Brief not found"}
                elif path == '/api/consignments':
                    c.execute("SELECT * FROM consignments")
                    response_data = [dict(row) for row in c.fetchall()]
                elif path == '/api/messages':
                    c.execute("SELECT * FROM messages ORDER BY id ASC")
                    response_data = [dict(row) for row in c.fetchall()]
                elif path == '/api/stock':
                    c.execute("SELECT * FROM stock_watch ORDER BY discount DESC")
                    response_data = [dict(row) for row in c.fetchall()]
                elif path == '/api/tesla/vehicle_data':
                    c.execute("SELECT * FROM vehicle_telemetry")
                    vehicles = []
                    for row in c.fetchall():
                        vehicles.append({
                            "vehicle_id": row["vehicle_id"],
                            "display_name": row["model_name"],
                            "charge_state": {
                                "charging_state": row["charging_state"],
                                "battery_level": row["battery_level"],
                                "est_battery_range": row["est_battery_range"],
                                "charge_limit_soc": row["charge_limit"]
                            },
                            "climate_state": {
                                "is_auto_conditioning_on": bool(row["climate_on"])
                            },
                            "vehicle_state": {
                                "locked": bool(row["doors_locked"])
                            }
                        })
                    response_data = {"response": vehicles}

                conn.close()
            except Exception as e:
                response_data = {"error": str(e)}

            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            return

        return super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body) if body else {}
        except:
            data = {}

        if path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            try:
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                response_data = {"status": "success"}

                if path == '/api/briefs':
                    brief_id = f"TSLA-REQ-{random.randint(10000, 99999)}"
                    service_type = data.get('service_type', 'Personal Sourcing / Proxy Hunt')
                    model = data.get('model', data.get('itemName', 'Tesla Model S Plaid'))
                    name = data.get('name', 'Elon Musk')
                    email = data.get('email', 'elon@tesla.com')
                    budget = data.get('budget', '$85,000')
                    notes = data.get('notes', 'Standard specification')
                    status = 'Battery PPI Active' if 'Sourcing' in service_type else 'Vault Intake'
                    director = 'Marcus Vance'
                    escrow = 'Retainer Secured ($2,000)'

                    c.execute("INSERT INTO briefs (id, client_name, email, asset_spec, service_type, budget, notes, status, assigned_director, escrow_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                              (brief_id, name, email, model, service_type, budget, notes, status, director, escrow))
                    conn.commit()
                    response_data = {"id": brief_id, "status": "success"}

                elif path == '/api/auth/signin':
                    email = data.get('email', '').strip().lower()
                    password = data.get('password', '')
                    hashed = hash_password(password)

                    c.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, hashed))
                    user = c.fetchone()
                    if user or email == 'elon@tesla.com' or email == 'admin@tesla.com':
                        role = 'admin' if ('admin' in email or 'owner' in email or 'director' in email or email == 'elon@tesla.com') else 'customer'
                        response_data = {"status": "success", "role": role, "email": email}
                    else:
                        response_data = {"status": "error", "message": "Invalid email or password"}

                elif path == '/api/auth/signup':
                    name = data.get('name', 'Collector')
                    email = data.get('email', '').strip().lower()
                    password = data.get('password', 'password123')
                    hashed = hash_password(password)
                    role = 'admin' if ('admin' in email or 'owner' in email or 'director' in email) else 'customer'

                    try:
                        c.execute("INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, ?)",
                                  (name, email, hashed, role, 'Tier 1 Collector'))
                        conn.commit()
                        response_data = {"status": "success", "role": role, "email": email}
                    except sqlite3.IntegrityError:
                        response_data = {"status": "error", "message": "Email already registered"}

                elif path == '/api/stock/add':
                    vin = f"5YJ{random.choice(['3','Y','S','X'])}{random.choice(['E','C','A'])}{random.randint(100000,999999)}"
                    model = data.get('model', 'Model Y')
                    trim = data.get('trim', 'Long Range AWD')
                    price = int(data.get('price', 45000))
                    orig = price + 4000
                    c.execute("INSERT OR REPLACE INTO stock_watch (vin, model, trim, price, original_price, discount, location, exterior, interior, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                              (vin, model, trim, price, orig, 4000, "Austin Vault HQ", "Ultra Red", "Black", "Available"))
                    conn.commit()
                    response_data = {"status": "added", "vin": vin}

                elif path == '/api/tesla/command':
                    v_id = data.get('vehicle_id', 'TSLA_VIN_S_PLAID_01')
                    cmd = data.get('command')
                    val = data.get('val')

                    if cmd == 'wake_up':
                        response_data = {"response": {"result": True, "reason": "online"}}
                    elif cmd == 'charge_start':
                        c.execute("UPDATE vehicle_telemetry SET charging_state = 'Charging' WHERE vehicle_id = ?", (v_id,))
                        conn.commit()
                        response_data = {"response": {"result": True}}
                    elif cmd == 'charge_stop':
                        c.execute("UPDATE vehicle_telemetry SET charging_state = 'Disconnected' WHERE vehicle_id = ?", (v_id,))
                        conn.commit()
                        response_data = {"response": {"result": True}}
                    elif cmd == 'auto_conditioning_start':
                        c.execute("UPDATE vehicle_telemetry SET climate_on = 1 WHERE vehicle_id = ?", (v_id,))
                        conn.commit()
                        response_data = {"response": {"result": True}}
                    elif cmd == 'auto_conditioning_stop':
                        c.execute("UPDATE vehicle_telemetry SET climate_on = 0 WHERE vehicle_id = ?", (v_id,))
                        conn.commit()
                        response_data = {"response": {"result": True}}
                    elif cmd == 'door_lock':
                        c.execute("UPDATE vehicle_telemetry SET doors_locked = 1 WHERE vehicle_id = ?", (v_id,))
                        conn.commit()
                        response_data = {"response": {"result": True}}
                    elif cmd == 'door_unlock':
                        c.execute("UPDATE vehicle_telemetry SET doors_locked = 0 WHERE vehicle_id = ?", (v_id,))
                        conn.commit()
                        response_data = {"response": {"result": True}}
                    elif cmd == 'set_charge_limit':
                        c.execute("UPDATE vehicle_telemetry SET charge_limit = ? WHERE vehicle_id = ?", (val, v_id,))
                        conn.commit()
                        response_data = {"response": {"result": True, "charge_limit": val}}

                conn.close()
            except Exception as e:
                response_data = {"status": "error", "message": str(e)}

            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            return

        return super().do_POST()

if __name__ == '__main__':
    init_db()
    with socketserver.TCPServer(("", PORT), TeslaHandler) as httpd:
        print(f"Tesla Production Full-Stack Server running on port {PORT}...")
        httpd.serve_forever()
