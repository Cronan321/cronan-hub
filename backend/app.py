from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from dotenv import load_dotenv
import resend


load_dotenv()


def send_notification(subject: str, html_body: str) -> None:
    resend.api_key = os.environ.get("RESEND_API_KEY", "")
    try:
        resend.Emails.send({
            "from": "notifications@cronantech.com",
            "to": ["Brianna@CronanTech.com", "Bethany@CronanTech.com"],
            "subject": subject,
            "html": html_body,
        })
    except Exception as e:
        print(f"[send_notification] Failed to send email: {e}")

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-change-me')

# Cookie config — SameSite=None + Secure required for cross-origin sessions (Vercel → Render)
is_production = os.environ.get('RENDER') or os.environ.get('NODE_ENV') == 'production'
app.config.update(
    SESSION_COOKIE_SAMESITE='None' if is_production else 'Lax',
    SESSION_COOKIE_SECURE=bool(is_production),
    SESSION_COOKIE_HTTPONLY=True,
)

CORS(app,
     origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","),
     supports_credentials=True)

# On Render, mount a persistent disk at /data and store the DB there.
# Locally it just sits in the backend folder as before.
DB_DIR = os.environ.get("DB_DIR", os.path.dirname(os.path.abspath(__file__)))
DB_NAME = os.path.join(DB_DIR, "cronan_ai.db")

def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        
        # 1. Your existing Trainer table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applicants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                specialty TEXT NOT NULL,
                experience TEXT NOT NULL,
                status TEXT DEFAULT 'Pending Review'
            )
        ''')
        
        # 2. NEW: The Business Client table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS business_leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                contact_name TEXT NOT NULL,
                email TEXT NOT NULL,
                project_type TEXT NOT NULL,
                status TEXT DEFAULT 'New Lead'
            )
        ''')

        # 3. Newsletter subscribers table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            )
        ''')
        conn.commit()

def migrate_db():
    """Idempotently add new columns to existing tables."""
    applicant_columns = [
        ("phone", "TEXT"),
        ("linkedin_url", "TEXT"),
        ("availability_hours", "INTEGER"),
    ]
    business_lead_columns = [
        ("phone", "TEXT"),
        ("company_size", "TEXT"),
        ("industry", "TEXT"),
        ("budget_range", "TEXT"),
        ("timeline", "TEXT"),
        ("referral_source", "TEXT"),
        ("message", "TEXT"),
    ]
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        for col_name, col_type in applicant_columns:
            try:
                cursor.execute(f"ALTER TABLE applicants ADD COLUMN {col_name} {col_type}")
                conn.commit()
            except sqlite3.OperationalError:
                pass  # Column already exists
        for col_name, col_type in business_lead_columns:
            try:
                cursor.execute(f"ALTER TABLE business_leads ADD COLUMN {col_name} {col_type}")
                conn.commit()
            except sqlite3.OperationalError:
                pass  # Column already exists

init_db()
migrate_db()

# --- Your 3 Pillars ---
@app.route('/api/agency', methods=['GET'])
def get_agency_info():
    return jsonify({
        "name": "Cronan AI",
        "mission": "High-level data specialist services and AI trainer recruitment.",
        "status": "Currently Onboarding AI Trainers"
    })

@app.route('/api/studio', methods=['GET'])
def get_studio_info():
    return jsonify({
        "podcast": "Behind the Prompts",
        "latest_episode": "The Reality of Remote AI Training",
        "books": ["The Uncharted Daughter", "Final Mandate: The Obedience Serum"]
    })

@app.route('/api/lab', methods=['GET'])
def get_lab_info():
    return jsonify({
        "featured_project": "Web-Based Hearts Card Game",
        "features": ["Custom UI", "Python Backend Logic", "Interactive Theme"],
        "status": "Live Project"
    })

# --- The Trainer Form Endpoints ---
@app.route('/api/apply', methods=['POST'])
def submit_application():
    data = request.json or {}
    required = ['name', 'email', 'specialty', 'experience', 'phone', 'availabilityHours']
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    # Validate availabilityHours
    try:
        availability_hours = int(data['availabilityHours'])
        if not (1 <= availability_hours <= 168):
            return jsonify({"error": "availabilityHours must be between 1 and 168"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "availabilityHours must be a valid integer"}), 400

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO applicants (name, email, specialty, experience, phone, linkedin_url, availability_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('name'),
            data.get('email'),
            data.get('specialty'),
            data.get('experience'),
            data.get('phone'),
            data.get('linkedinUrl'),
            availability_hours,
        ))
        conn.commit()
    print(f"\n✅ SUCCESS: Trainer Application saved for {data.get('name')}\n")
    send_notification(
        subject="New Trainer Application",
        html_body=(
            f"<h2>New Trainer Application</h2>"
            f"<p><strong>Name:</strong> {data.get('name')}</p>"
            f"<p><strong>Email:</strong> {data.get('email')}</p>"
            f"<p><strong>Specialty:</strong> {data.get('specialty')}</p>"
            f"<p><strong>Phone:</strong> {data.get('phone')}</p>"
        ),
    )
    return jsonify({"message": "Application saved successfully!", "status": "success"})

@app.route('/api/applicants', methods=['GET'])
def view_applicants():
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM applicants")
        return jsonify([dict(row) for row in cursor.fetchall()])

@app.route('/api/applicants/<int:id>/status', methods=['PUT'])
def update_status(id):
    data = request.json
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE applicants SET status = ? WHERE id = ?", (data.get('status'), id))
        conn.commit()
    return jsonify({"status": "success"})

# --- NEW: The Business Lead Endpoint ---
@app.route('/api/b2b/apply', methods=['POST'])
def submit_b2b_lead():
    data = request.json or {}
    required = ['companyName', 'contactName', 'email', 'projectType', 'phone', 'companySize', 'industry', 'budgetRange', 'timeline', 'referralSource']
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    message = data.get('message', '')
    if message and len(message) > 1000:
        return jsonify({"error": "Message must be 1000 characters or fewer"}), 400

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO business_leads (company_name, contact_name, email, project_type, phone, company_size, industry, budget_range, timeline, referral_source, message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('companyName'), data.get('contactName'), data.get('email'), data.get('projectType'),
            data.get('phone'), data.get('companySize'), data.get('industry'), data.get('budgetRange'),
            data.get('timeline'), data.get('referralSource'), message or None,
        ))
        conn.commit()

    print(f"\n🚀 NEW B2B LEAD: {data.get('companyName')} is requesting early access!\n")
    send_notification(
        subject="New B2B Lead",
        html_body=(
            f"<h2>New B2B Lead</h2>"
            f"<p><strong>Company:</strong> {data.get('companyName')}</p>"
            f"<p><strong>Contact:</strong> {data.get('contactName')} — {data.get('email')}</p>"
            f"<p><strong>Phone:</strong> {data.get('phone')}</p>"
            f"<p><strong>Industry:</strong> {data.get('industry')} | Size: {data.get('companySize')}</p>"
            f"<p><strong>Project Type:</strong> {data.get('projectType')}</p>"
            f"<p><strong>Budget:</strong> {data.get('budgetRange')} | Timeline: {data.get('timeline')}</p>"
            f"<p><strong>Referral:</strong> {data.get('referralSource')}</p>"
            + (f"<p><strong>Message:</strong> {message}</p>" if message else "")
        ),
    )
    return jsonify({"message": "Lead captured successfully!", "status": "success"})

# --- NEW: Administrator Routes for Business Leads ---
@app.route('/api/b2b/leads', methods=['GET'])
def view_b2b_leads():
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM business_leads")
        return jsonify([dict(row) for row in cursor.fetchall()])

@app.route('/api/b2b/leads/<int:id>/status', methods=['PUT'])
def update_b2b_status(id):
    data = request.json
    new_status = data.get('status')
    
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE business_leads SET status = ? WHERE id = ?", (new_status, id))
        conn.commit()
        
    print(f"\n✅ UPDATE: Business Lead #{id} status changed to '{new_status}'\n")
    return jsonify({"message": f"Lead {id} updated to {new_status}", "status": "success"})

@app.route('/api/newsletter/subscribers', methods=['GET'])
def view_newsletter_subscribers():
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM newsletter_subscribers")
        return jsonify([dict(row) for row in cursor.fetchall()])

@app.route('/api/newsletter', methods=['POST'])
def subscribe_newsletter():
    data = request.json or {}
    if not data.get('name') or not data.get('email'):
        return jsonify({"error": "Name and email are required"}), 400

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO newsletter_subscribers (name, email) VALUES (?, ?)',
                (data.get('name'), data.get('email'))
            )
            conn.commit()
        except sqlite3.IntegrityError:
            # Email already subscribed — treat as success silently
            pass

    print(f"\n📧 NEWSLETTER: {data.get('name')} ({data.get('email')}) subscribed\n")
    return jsonify({"message": "Subscribed successfully!", "status": "success"})

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)