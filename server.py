import http.server
import socketserver
import sqlite3
import json
import urllib.parse
import os
import random

PORT = 8000
DB_FILE = 'tesla_platform.db'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT,
                tier TEXT)''')
    
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

    # Seed default data if empty
    c.execute("SELECT COUNT(*) FROM briefs")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO briefs VALUES ('TSLA-REQ-94821', 'Elon Musk', 'elon@tesla.com', 'Tesla Model S Plaid (Ultra Red)', 'Personal Sourcing / Proxy Hunt', '$85,000', 'Cream interior, yoke steering', 'Battery PPI Active', 'Marcus Vance', datetime('now'))")
        c.execute("INSERT INTO briefs VALUES ('TSLA-REQ-81920', 'Safra Catz', 'safra@example.com', 'Cybertruck Foundation Series', 'Personal Sourcing / Proxy Hunt', '$115,000', 'Tri-motor AWD', 'Escrow Pending', 'Greta Lindqvist', datetime('now'))")

    c.execute("SELECT COUNT(*) FROM consignments")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO consignments VALUES ('TSLA-CON-38192', 'Elon Musk', 'Tesla Model Y Performance', 'Austin Vault #2', '$46,500', 'Fully Insured ($100k)')")

    c.execute("SELECT COUNT(*) FROM messages")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO messages (sender, text) VALUES ('Marcus Vance', 'Hello Elon. We have completed the BMS diagnostic check on the Model S Plaid in Austin. State of health is 99.4%.')")
        c.execute("INSERT INTO messages (sender, text) VALUES ('Elon Musk', 'Perfect. Please proceed with account migration and enclosed transport dispatch.')")

    conn.commit()
    conn.close()

class TeslaHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        query = urllib.parse.parse_qs(parsed_path.query)

        if path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            response_data = {}
            if path == '/api/briefs':
                c.execute("SELECT * FROM briefs ORDER BY created_at DESC")
                response_data = [dict(row) for row in c.fetchall()]
            elif path == '/api/briefs/lookup':
                brief_id = query.get('id', [''])[0].strip().upper()
                c.execute("SELECT * FROM briefs WHERE id = ?", (brief_id,))
                row = c.fetchone()
                response_data = dict(row) if row else {"error": "Brief not found"}
            elif path == '/api/consignments':
                c.execute("SELECT * FROM consignments")
                response_data = [dict(row) for row in c.fetchall()]
            elif path == '/api/messages':
                c.execute("SELECT * FROM messages ORDER BY id ASC")
                response_data = [dict(row) for row in c.fetchall()]

            conn.close()
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
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            response_data = {"status": "success"}

            if path == '/api/briefs':
                brief_id = f"TSLA-REQ-{random.randint(10000, 99999)}"
                service_type = data.get('service_type', 'Personal Sourcing')
                model = data.get('model', 'Tesla Model Y')
                name = data.get('name', 'Valued Client')
                email = data.get('email', 'client@tesla.com')
                budget = data.get('budget', '$50,000')
                notes = data.get('notes', 'Standard specification')
                status = 'Battery PPI Active' if 'Sourcing' in service_type else 'Vault Intake'
                director = 'Marcus Vance'

                c.execute("INSERT INTO briefs (id, client_name, email, asset_spec, service_type, budget, notes, status, assigned_director) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          (brief_id, name, email, model, service_type, budget, notes, status, director))
                conn.commit()
                response_data = {"id": brief_id, "status": "success"}

            elif path == '/api/briefs/status':
                brief_id = data.get('id')
                status = data.get('status')
                c.execute("UPDATE briefs SET status = ? WHERE id = ?", (status, brief_id))
                conn.commit()
                response_data = {"status": "updated"}

            elif path == '/api/messages':
                sender = data.get('sender', 'Client')
                text = data.get('text', '')
                c.execute("INSERT INTO messages (sender, text) VALUES (?, ?)", (sender, text))
                conn.commit()
                response_data = {"status": "sent"}

            elif path == '/api/auth':
                email = data.get('email', '')
                role = 'admin' if ('admin' in email or 'owner' in email or 'director' in email) else 'customer'
                response_data = {"status": "authenticated", "role": role, "email": email}

            conn.close()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            return

        return super().do_POST()

if __name__ == '__main__':
    init_db()
    os.chdir('/home/user')
    with socketserver.TCPServer(("", PORT), TeslaHandler) as httpd:
        print(f"Serving Tesla Platform on port {PORT}...")
        httpd.serve_forever()
