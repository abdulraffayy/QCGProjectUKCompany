"""
Ultra Simple Flask Backend for QAQF Educational Platform
No external dependencies except Flask - easy for basic Python developers
"""
from flask import Flask, request, jsonify
import sqlite3
import hashlib
import json
import datetime
from functools import wraps
import base64
import hmac

app = Flask(__name__)
app.config['SECRET_KEY'] = 'simple-secret-key-2025'

# Simple CORS handling
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle preflight requests
@app.route('/<path:path>', methods=['OPTIONS'])
@app.route('/', methods=['OPTIONS'])
def options_handler(path=None):
    return '', 200

DATABASE = 'simple_qaqf.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database"""
    conn = get_db()
    
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Study materials table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS study_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            type TEXT NOT NULL,
            qaqf_level INTEGER NOT NULL,
            module_code TEXT,
            content TEXT,
            characteristics TEXT NOT NULL,
            verification_status TEXT DEFAULT 'pending',
            created_by_user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create demo users
    admin_password = hashlib.sha256('admin123'.encode()).hexdigest()
    user_password = hashlib.sha256('user123'.encode()).hexdigest()
    
    try:
        conn.execute('''
            INSERT INTO users (username, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', 'admin@example.com', admin_password, 'Administrator', 'admin'))
        
        conn.execute('''
            INSERT INTO users (username, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('user', 'user@example.com', user_password, 'Regular User', 'user'))
        
        print("Demo users created: admin/admin123 and user/user123")
    except sqlite3.IntegrityError:
        print("Demo users already exist")
    
    conn.commit()
    conn.close()

def create_simple_token(user_id, username):
    """Create simple token"""
    payload = f"{user_id}:{username}:{datetime.datetime.now().isoformat()}"
    signature = hmac.new(
        app.config['SECRET_KEY'].encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    token = base64.b64encode(f"{payload}:{signature}".encode()).decode()
    return token

def verify_simple_token(token):
    """Verify simple token"""
    try:
        decoded = base64.b64decode(token.encode()).decode()
        parts = decoded.rsplit(':', 1)
        if len(parts) != 2:
            return None
        
        payload, signature = parts
        expected_signature = hmac.new(
            app.config['SECRET_KEY'].encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if signature != expected_signature:
            return None
        
        user_id, username, timestamp = payload.split(':', 2)
        return int(user_id)
    except:
        return None

def token_required(f):
    """Simple token authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        user_id = verify_simple_token(token)
        if not user_id:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(user_id, *args, **kwargs)
    
    return decorated

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Simple Flask backend running'})

@app.route('/api/auth/login-json', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    conn = get_db()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ?', 
        (data['username'],)
    ).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check password (simple hash)
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    if password_hash != user['password_hash']:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create token
    token = create_simple_token(user['id'], user['username'])
    
    return jsonify({
        'access_token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'is_active': True
        }
    })

@app.route('/api/study-materials', methods=['GET'])
@token_required
def get_study_materials(current_user_id):
    conn = get_db()
    materials = conn.execute('''
        SELECT sm.*, u.username as creator_name
        FROM study_materials sm
        LEFT JOIN users u ON sm.created_by_user_id = u.id
        ORDER BY sm.created_at DESC
    ''').fetchall()
    conn.close()
    
    result = []
    for material in materials:
        material_dict = dict(material)
        # Parse characteristics JSON
        try:
            material_dict['characteristics'] = json.loads(material_dict['characteristics'])
        except:
            material_dict['characteristics'] = []
        result.append(material_dict)
    
    return jsonify(result)

@app.route('/api/study-materials', methods=['POST'])
@token_required
def create_study_material(current_user_id):
    data = request.get_json()
    
    required_fields = ['title', 'description', 'type', 'qaqf_level', 'characteristics']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    characteristics_json = json.dumps(data['characteristics'])
    
    conn = get_db()
    try:
        cursor = conn.execute('''
            INSERT INTO study_materials 
            (title, description, type, qaqf_level, module_code, content, 
             characteristics, created_by_user_id, verification_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['description'], 
            data['type'],
            data['qaqf_level'],
            data.get('module_code'),
            data.get('content'),
            characteristics_json,
            current_user_id,
            'pending'
        ))
        
        material_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Study material created successfully',
            'id': material_id
        }), 201
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/study-materials/<int:material_id>', methods=['DELETE'])
@token_required
def delete_study_material(current_user_id, material_id):
    conn = get_db()
    
    material = conn.execute(
        'SELECT * FROM study_materials WHERE id = ? AND created_by_user_id = ?',
        (material_id, current_user_id)
    ).fetchone()
    
    if not material:
        conn.close()
        return jsonify({'error': 'Study material not found or access denied'}), 404
    
    conn.execute('DELETE FROM study_materials WHERE id = ?', (material_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Study material deleted successfully'})

if __name__ == '__main__':
    init_db()
    print("Starting Simple Flask Backend on http://localhost:8000")
    print("Demo users: admin/admin123 and user/user123")
    app.run(host='0.0.0.0', port=8000, debug=True)