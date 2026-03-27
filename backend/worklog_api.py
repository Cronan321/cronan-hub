import sqlite3
import os
import json
import bcrypt
import functools
from flask import Blueprint, request, jsonify, session

worklog_bp = Blueprint('worklog', __name__)

WORKLOG_DB = None


def init_worklog_db():
    global WORKLOG_DB
    db_dir = os.environ.get('DB_DIR', '.')
    WORKLOG_DB = os.path.join(db_dir, 'worklog.db')

    with sqlite3.connect(WORKLOG_DB) as conn:
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL DEFAULT 0,
                week_ending TEXT NOT NULL,
                ref_number TEXT NOT NULL,
                net_pay REAL NOT NULL,
                full_data TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        ''')

        try:
            cursor.execute(
                'ALTER TABLE history ADD COLUMN employee_id INTEGER NOT NULL DEFAULT 0'
            )
        except sqlite3.OperationalError:
            pass

        try:
            cursor.execute(
                'ALTER TABLE history ADD COLUMN created_at TEXT'
            )
        except sqlite3.OperationalError:
            pass

        conn.commit()

def worklog_login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('worklog_user') is None:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('worklog_user') is None:
            return jsonify({"error": "Authentication required"}), 401
        if session['worklog_user'].get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@worklog_bp.route('/api/worklog/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    # Check admin credentials
    admin_username = os.environ.get('WORKLOG_ADMIN_USERNAME')
    admin_password = os.environ.get('WORKLOG_ADMIN_PASSWORD')

    if username == admin_username and password == admin_password:
        session['worklog_user'] = {
            'username': username,
            'employee_id': 0,
            'role': 'admin'
        }
        return jsonify({"role": "admin", "employee_id": 0}), 200

    # Check employee credentials
    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                'SELECT id, password_hash, is_active FROM users WHERE username = ?',
                (username,)
            )
            row = cursor.fetchone()
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during login: {e}")
        return jsonify({"error": "Database error"}), 500

    if row and row['is_active'] and bcrypt.checkpw(password.encode(), row['password_hash'].encode()):
        session['worklog_user'] = {
            'username': username,
            'employee_id': row['id'],
            'role': 'viewer'
        }
        return jsonify({"role": "viewer", "employee_id": row['id']}), 200

    return jsonify({"error": "Invalid credentials"}), 401


@worklog_bp.route('/api/worklog/logout', methods=['POST'])
@worklog_login_required
def logout():
    session.pop('worklog_user', None)
    return jsonify({"status": "logged_out"}), 200


@worklog_bp.route('/api/worklog/session', methods=['GET'])
def get_session():
    user = session.get('worklog_user')
    if user:
        return jsonify({
            "authenticated": True,
            "role": user['role'],
            "employee_id": user['employee_id']
        }), 200
    return jsonify({"authenticated": False}), 401


@worklog_bp.route('/api/worklog/save', methods=['POST'])
@worklog_login_required
def save():
    data = request.json or {}
    for field in ['week_ending', 'ref_number', 'net_pay', 'full_data']:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    employee_id = session['worklog_user']['employee_id']

    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT OR REPLACE INTO history (employee_id, week_ending, ref_number, net_pay, full_data) VALUES (?, ?, ?, ?, ?)',
                (employee_id, data['week_ending'], data['ref_number'], data['net_pay'], data['full_data'])
            )
            conn.commit()
            return jsonify({"message": "Saved", "id": cursor.lastrowid}), 200
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during save: {e}")
        return jsonify({"error": "Database error"}), 500


@worklog_bp.route('/api/worklog/delete', methods=['POST'])
@worklog_login_required
def delete():
    data = request.json or {}
    record_id = data.get('id')
    if record_id is None:
        return jsonify({"error": "Missing required field: id"}), 400

    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT id, employee_id FROM history WHERE id = ?', (record_id,))
            record = cursor.fetchone()

            if record is None:
                return jsonify({"error": "Record not found"}), 404

            user = session['worklog_user']
            if user['role'] == 'viewer' and record['employee_id'] != user['employee_id']:
                return jsonify({"error": "Access denied"}), 403

            cursor.execute('DELETE FROM history WHERE id = ?', (record_id,))
            conn.commit()
            return jsonify({"message": "Deleted"}), 200
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during delete: {e}")
        return jsonify({"error": "Database error"}), 500


@worklog_bp.route('/api/worklog/history', methods=['GET'])
@worklog_login_required
def history():
    user = session['worklog_user']

    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            if user['role'] == 'viewer':
                cursor.execute(
                    'SELECT * FROM history WHERE employee_id = ? ORDER BY week_ending DESC',
                    (user['employee_id'],)
                )
            else:
                filter_employee_id = request.args.get('employee_id')
                if filter_employee_id is not None:
                    cursor.execute(
                        'SELECT * FROM history WHERE employee_id = ? ORDER BY week_ending DESC',
                        (filter_employee_id,)
                    )
                else:
                    cursor.execute('SELECT * FROM history ORDER BY week_ending DESC')

            rows = cursor.fetchall()
            return jsonify([dict(row) for row in rows]), 200
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during history: {e}")
        return jsonify({"error": "Database error"}), 500


@worklog_bp.route('/api/worklog/employees', methods=['GET'])
@admin_required
def get_employees():
    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                'SELECT id, username, is_active, created_at FROM users ORDER BY created_at ASC'
            )
            rows = cursor.fetchall()
            return jsonify([dict(row) for row in rows]), 200
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during get_employees: {e}")
        return jsonify({"error": "Database error"}), 500


@worklog_bp.route('/api/worklog/employees', methods=['POST'])
@admin_required
def create_employee():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                (username, password_hash)
            )
            conn.commit()
            return jsonify({"id": cursor.lastrowid, "username": username}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during create_employee: {e}")
        return jsonify({"error": "Database error"}), 500


@worklog_bp.route('/api/worklog/employees/<int:employee_id>', methods=['PUT'])
@admin_required
def update_employee(employee_id):
    data = request.json or {}
    is_active = data.get('is_active')

    if is_active is None:
        return jsonify({"error": "is_active required"}), 400

    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE users SET is_active = ? WHERE id = ?',
                (is_active, employee_id)
            )
            conn.commit()
            return jsonify({"message": "Updated"}), 200
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during update_employee: {e}")
        return jsonify({"error": "Database error"}), 500


@worklog_bp.route('/api/worklog/employees/<int:employee_id>/reset-password', methods=['POST'])
@admin_required
def reset_employee_password(employee_id):
    data = request.json or {}
    password = data.get('password')

    if not password:
        return jsonify({"error": "password required"}), 400

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        with sqlite3.connect(WORKLOG_DB) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                (password_hash, employee_id)
            )
            conn.commit()
            return jsonify({"message": "Password updated"}), 200
    except sqlite3.Error as e:
        print(f"[WorkLog] DB error during reset_employee_password: {e}")
        return jsonify({"error": "Database error"}), 500


def init_worklog(app):
    """Validate env vars, initialize DB, and register the WorkLog blueprint."""
    admin_username = os.environ.get('WORKLOG_ADMIN_USERNAME')
    admin_password = os.environ.get('WORKLOG_ADMIN_PASSWORD')

    missing = []
    if not admin_username:
        missing.append('WORKLOG_ADMIN_USERNAME')
    if not admin_password:
        missing.append('WORKLOG_ADMIN_PASSWORD')

    if missing:
        for var in missing:
            print(f"[WorkLog] ERROR: Missing environment variable: {var}")
        print("[WorkLog] WorkLog routes NOT registered.")
        return

    init_worklog_db()
    app.register_blueprint(worklog_bp)
    print("[WorkLog] Routes registered successfully.")
