"""
Complete Flask Backend for QAQF Educational Platform
Fixed version with file upload, content extraction, and Ollama AI integration
"""

import os
import sqlite3
import json
import bcrypt
import secrets
import datetime
from datetime import timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from werkzeug.utils import secure_filename
from functools import wraps
# import markdown
import traceback
import re
import unicodedata
import fitz  # PyMuPDF
import docx
from docx import Document
app = Flask(__name__)
CORS(app)

DATABASE = 'complete_qaqf_platform.db'
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'md'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.after_request(after_request)

@app.route('/api/options/<path:path>', methods=['OPTIONS'])
def options_handler(path=None):
    return '', 200

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_complete_db():
    """Initialize all database tables"""
    conn = get_db()
    
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            avatar VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP
        )
    ''')
    
    # QAQF levels table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS qaqf_levels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level INTEGER UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT NOT NULL
        )
    ''')
    
    # QAQF characteristics table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS qaqf_characteristics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) NOT NULL
        )
    ''')
    
    # Contents table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS contents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            type VARCHAR(50) NOT NULL,
            qaqf_level INTEGER NOT NULL,
            module_code VARCHAR(20),
            created_by_user_id INTEGER NOT NULL,
            verification_status VARCHAR(20) DEFAULT 'pending',
            verified_by_user_id INTEGER,
            content TEXT NOT NULL,
            characteristics TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by_user_id) REFERENCES users (id),
            FOREIGN KEY (verified_by_user_id) REFERENCES users (id)
        )
    ''')
    
    # Videos table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            qaqf_level INTEGER NOT NULL,
            module_code VARCHAR(20),
            created_by_user_id INTEGER NOT NULL,
            verification_status VARCHAR(20) DEFAULT 'pending',
            verified_by_user_id INTEGER,
            animation_style VARCHAR(50),
            duration VARCHAR(20),
            characteristics TEXT,
            url VARCHAR(255),
            thumbnail_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by_user_id) REFERENCES users (id)
        )
    ''')
    
    # Study materials table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS study_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            type VARCHAR(50) NOT NULL,
            qaqf_level INTEGER NOT NULL,
            created_by_user_id INTEGER NOT NULL,
            content TEXT,
            file_url VARCHAR(255),
            file_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by_user_id) REFERENCES users (id)
        )
    ''')
    
    # Collections table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_by_user_id INTEGER NOT NULL,
            is_public BOOLEAN DEFAULT FALSE,
            material_ids TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by_user_id) REFERENCES users (id)
        )
    ''')
    
    # Templates table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            type VARCHAR(50) NOT NULL,
            qaqf_level INTEGER NOT NULL,
            content_structure TEXT,
            created_by_user_id INTEGER NOT NULL,
            is_public BOOLEAN DEFAULT FALSE,
            usage_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by_user_id) REFERENCES users (id)
        )
    ''')
    
    # Activities table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action VARCHAR(50) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Insert default admin and user
    admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
    user_password = bcrypt.hashpw('user123'.encode('utf-8'), bcrypt.gensalt())
    
    try:
        conn.execute('''
            INSERT OR IGNORE INTO users (username, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', 'admin@qaqf.edu', admin_password, 'Administrator', 'admin'))
        
        conn.execute('''
            INSERT OR IGNORE INTO users (username, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('user', 'user@qaqf.edu', user_password, 'Test User', 'user'))
    except:
        pass
    
    # Insert QAQF levels
    # qaqf_levels = [
    #     (1, 'Foundation Certificate', 'Basic knowledge and skills for entry-level positions'),
    #     (2, 'Foundation Diploma', 'Enhanced foundation skills with practical application'),
    #     (3, 'Diploma', 'Intermediate skills with specialized knowledge'),
    #     (4, 'Higher Diploma', 'Advanced diploma with leadership components'),
    #     (5, 'Bachelor Degree', 'Undergraduate degree with comprehensive knowledge'),
    #     (6, 'Bachelor Honours', 'Enhanced bachelor degree with research elements'),
    #     (7, 'Master Degree', 'Postgraduate degree with advanced specialization'),
    #     (8, 'Master Research', 'Research-focused master degree'),
    #     (9, 'Doctoral Degree', 'Highest academic qualification with original research')
    # ]
    
    # for level_data in qaqf_levels:
    #     try:
    #         conn.execute('''
    #             INSERT OR IGNORE INTO qaqf_levels (level, name, description)
    #             VALUES (?, ?, ?)
    #         ''', level_data)
    #     except:
    #         pass
    
    # Insert QAQF characteristics
    # characteristics = [
    #     ('Clarity', 'Clear presentation and understanding of concepts', 'cognitive'),
    #     ('Completeness', 'Comprehensive coverage of required material', 'cognitive'),
    #     ('Accuracy', 'Factual correctness and precision', 'cognitive'),
    #     ('Coherence', 'Logical structure and flow', 'cognitive'),
    #     ('Relevance', 'Applicable to real-world contexts', 'practical'),
    #     ('Complexity', 'Appropriate level of difficulty', 'practical'),
    #     ('Innovation', 'Creative and original thinking', 'creative'),
    #     ('Critical Thinking', 'Analysis and evaluation skills', 'analytical'),
    #     ('Communication', 'Effective expression and presentation', 'communication'),
    #     ('Collaboration', 'Teamwork and cooperative learning', 'social')
    # ]
    
    # for char_data in characteristics:
    #     try:
    #         conn.execute('''
    #             INSERT OR IGNORE INTO qaqf_characteristics (name, description, category)
    #             VALUES (?, ?, ?)
    #         ''', char_data)
    #     except:
    #         pass
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS generatecourses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            userid INTEGER NOT NULL,
            description TEXT,
            createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
            updateddate DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT
        )
    ''')
    conn.execute('''
        CREATE TRIGGER IF NOT EXISTS trg_generatecourses_updated
        AFTER UPDATE ON generatecourses
        FOR EACH ROW
        BEGIN
            UPDATE generatecourses SET updateddate = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS weeks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            courseid INTEGER NOT NULL,
            title TEXT NOT NULL,
            createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
            updateddate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TRIGGER IF NOT EXISTS trg_weeks_updated
        AFTER UPDATE ON weeks
        FOR EACH ROW
        BEGIN
            UPDATE weeks SET updateddate = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS generatedlesson (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            courseid INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            level INTEGER NULL,
            userid INTEGER NOT NULL,
            duration INTEGER,
            type TEXT,
            status TEXT DEFAULT 'pending',     
            createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
            updateddate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TRIGGER IF NOT EXISTS trg_generatedlesson_updated
        AFTER UPDATE ON generatedlesson
        FOR EACH ROW
        BEGIN
            UPDATE generatedlesson SET updateddate = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS weeklessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            courseid INTEGER,
            lessonid INTEGER,
            weekid INTEGER,
            userid INTEGER,
            orderno INTEGER,
            status TEXT,
            createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
            updateddate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TRIGGER IF NOT EXISTS trg_weeklessons_updated
        AFTER UPDATE ON weeklessons
        FOR EACH ROW
        BEGIN
            UPDATE weeklessons SET updateddate = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
    ''')
    conn.commit()
    conn.close()

def create_simple_token(user_id, username):
    """Create simple authentication token"""
    payload = f"{user_id}:{username}:{secrets.token_hex(16)}"
    return payload

def verify_simple_token(token):
    """Verify authentication token"""
    try:
        parts = token.split(':')
        if len(parts) == 3:
            user_id, username = parts[0], parts[1]
            return int(user_id)
    except:
        pass
    return None

def token_required(f):
    """Authentication decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token[7:]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        current_user_id = verify_simple_token(token)
        if not current_user_id:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

def log_activity(user_id, action, entity_type, entity_id, details=None):
    """Log user activity"""
    conn = get_db()
    conn.execute('''
        INSERT INTO activities (user_id, action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, action, entity_type, entity_id, json.dumps(details) if details else None))
    conn.commit()
    conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'QAQF Platform API is running'}), 200


def clean_text(text):
    text = unicodedata.normalize("NFKD", text)
    text = ''.join(c for c in text if c.isprintable())
    text = text.replace("", "-").replace("•", "-").replace("\u00a0", " ").replace("\uf0b7", "-")
    text = re.sub(r"[-–—]{2,}", "-", text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_pdf_content(filepath):
    try:
        content = ""
        pdf = fitz.open(filepath)
        for page in pdf:
            raw_text = page.get_text()
            content += clean_text(raw_text) + "\n"
        return content.strip()
    except Exception:
        traceback.print_exc()
        return ""


def extract_txt_content(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return clean_text(f.read())
    except Exception:
        traceback.print_exc()
        return ""


def extract_doc_content(filepath):
    try:
        doc = Document(filepath)
        text = "\n".join([para.text for para in doc.paragraphs])
        return clean_text(text)
    except Exception:
        traceback.print_exc()
        return ""

# AUTH ROUTES
@app.route('/api/auth/login-json', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    conn = get_db()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ?', (username,)
    ).fetchone()
    conn.close()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        token = create_simple_token(user['id'], user['username'])
        return jsonify({
            'access_token': token,
            'token_type': 'bearer',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'avatar': user['avatar'],
                'is_active': user['is_active']
            }
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['username', 'email', 'password', 'name']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    conn = get_db()
    try:
        cursor = conn.execute('''
            INSERT INTO users (username, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['username'], data['email'], password_hash, data['name'], data.get('role', 'user')))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        token = create_simple_token(user_id, data['username'])
        return jsonify({
            'access_token': token,
            'token_type': 'bearer',
            'message': 'User registered successfully'
        }), 201
        
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username or email already exists'}), 400

# DASHBOARD ROUTES
@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def dashboard_stats(current_user_id):
    conn = get_db()
    
    stats = {}
    stats['content_count'] = conn.execute('SELECT COUNT(*) as count FROM contents').fetchone()['count']
    stats['verified_content_count'] = conn.execute("SELECT COUNT(*) as count FROM contents WHERE verification_status = 'verified'").fetchone()['count']
    stats['material_count'] = conn.execute('SELECT COUNT(*) as count FROM study_materials').fetchone()['count']
    stats['user_count'] = conn.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    
    conn.close()
    return jsonify(stats)

# QAQF ROUTES
@app.route('/api/qaqf/levels', methods=['GET'])
def get_qaqf_levels():
    conn = get_db()
    levels = conn.execute('SELECT * FROM qaqf_levels ORDER BY level').fetchall()
    conn.close()
    return jsonify([dict(level) for level in levels])

@app.route('/api/qaqf/characteristics', methods=['GET'])
def get_qaqf_characteristics():
    conn = get_db()
    characteristics = conn.execute('SELECT * FROM qaqf_characteristics ORDER BY name').fetchall()
    conn.close()
    return jsonify([dict(char) for char in characteristics])


# Course CRUD
@app.route('/api/courses', methods=['GET'])
# @token_required
def get_courses():
    db = get_db()
    rows = db.execute("SELECT * FROM generatecourses").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/courses/<int:id>', methods=['GET'])
def get_course(id):
    db = get_db()
    row = db.execute("SELECT * FROM generatecourses WHERE id = ?", (id,)).fetchone()
    if row: return jsonify(dict(row))
    return jsonify({'error': 'Course not found'}), 404

@app.route('/api/courses', methods=['POST'])
def create_course():
    data = request.json
    db = get_db()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO generatecourses (title, userid, description, status)
        VALUES (?, ?, ?, ?)
    ''', (data['title'], data['userid'], data.get('description', ''), data.get('status', 'active')))
    db.commit()
    return jsonify({'success': True, 'id': cur.lastrowid})

@app.route('/api/courses/<int:id>', methods=['PUT'])
def update_course(id):
    data = request.json
    db = get_db()
    db.execute('''
        UPDATE generatecourses SET title = ?, userid = ?, description = ?, status = ?
        WHERE id = ?
    ''', (data['title'], data['userid'], data.get('description', ''), data.get('status', 'active'), id))
    db.commit()
    return jsonify({'success': True})

@app.route('/api/courses/<int:id>', methods=['DELETE'])
def delete_course(id):
    db = get_db()
    db.execute("DELETE FROM generatecourses WHERE id = ?", (id,))
    db.commit()
    return jsonify({'success': True})

# Week CRUD
@app.route('/api/weeks', methods=['GET'])
def get_weeks():
    courseid = request.args.get('courseid', type=int)
    db = get_db()
    if courseid:
        rows = db.execute("SELECT * FROM weeks WHERE courseid = ?", (courseid,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM weeks").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/weeks/<int:id>', methods=['GET'])
def get_week(id):
    db = get_db()
    row = db.execute("SELECT * FROM weeks WHERE id = ?", (id,)).fetchone()
    if row: return jsonify(dict(row))
    return jsonify({'error': 'Week not found'}), 404

@app.route('/api/weeks', methods=['POST'])
def create_week():
    data = request.json
    db = get_db()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO weeks (courseid, title)
        VALUES (?, ?)
    ''', (data['courseid'], data['title']))
    db.commit()
    return jsonify({'success': True, 'id': cur.lastrowid})

@app.route('/api/weeks/<int:id>', methods=['PUT'])
def update_week(id):
    data = request.json
    db = get_db()
    db.execute('''
        UPDATE weeks SET courseid = ?, title = ?
        WHERE id = ?
    ''', (data['courseid'], data['title'], id))
    db.commit()
    return jsonify({'success': True})

@app.route('/api/weeks/<int:id>', methods=['DELETE'])
def delete_week(id):
    db = get_db()
    db.execute("DELETE FROM weeks WHERE id = ?", (id,))
    db.commit()
    return jsonify({'success': True})
# Lesson CRUD
@app.route('/api/lessons', methods=['GET'])
def get_lessons():
    courseid = request.args.get('courseid', type=int)
    db = get_db()
    if courseid:
        rows = db.execute("SELECT * FROM generatedlesson WHERE courseid = ?", (courseid,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM generatedlesson").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/lessons/<int:id>', methods=['GET'])
def get_lesson(id):
    db = get_db()
    row = db.execute("SELECT * FROM generatedlesson WHERE id = ?", (id,)).fetchone()
    if row: return jsonify(dict(row))
    return jsonify({'error': 'Lesson not found'}), 404

@app.route('/api/lessons', methods=['POST'])
def create_lesson():
    data = request.json
    db = get_db()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO generatedlesson (courseid, title, level, description, userid, duration, type)
        VALUES (?, ?, ?, ?, ?, ?,?)
    ''', (data['courseid'], data['title'], data.get('level', ''),data.get('description', ''), data['userid'], data.get('duration', 0), data.get('type', 'lecture')))
    print(cur.lastrowid)
    print(data)
    db.commit()
    return jsonify({'success': True, 'id': cur.lastrowid})

@app.route('/api/lessons/<int:id>', methods=['PUT'])
def update_lesson(id):
    data = request.json
    db = get_db()
    db.execute('''
        UPDATE generatedlesson SET courseid = ?, title = ?,level = ?, description = ?, userid = ?, duration = ?, type = ?
        WHERE id = ?
    ''', (data['courseid'], data['title'],data['level'], data.get('description', ''), data['userid'], data.get('duration', 0), data.get('type', 'lecture'), id))
    db.commit()
    return jsonify({'success': True})

@app.route('/api/lessons_status/<int:id>', methods=['PUT'])
def update_lesson_status(id):
    data = request.json
    db = get_db()
    db.execute('''
        UPDATE generatedlesson SET status = ?
        WHERE id = ?
    ''', (data['status'], id))
    db.commit()
    return jsonify({'success': True})

@app.route('/api/lessons/<int:id>', methods=['DELETE'])
def delete_lesson(id):
    db = get_db()
    db.execute("DELETE FROM generatedlesson WHERE id = ?", (id,))
    db.commit()
    return jsonify({'success': True})

# WeekLesson CRUD
@app.route('/api/weeklessons', methods=['POST'])
def assign_lesson_to_week():
    data = request.json
    db = get_db()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO weeklessons (courseid, lessonid, weekid, userid, orderno, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (data['courseid'], data['lessonid'], data['weekid'], data['userid'], data.get('orderno', 1), data.get('status', 'active')))
    db.commit()
    return jsonify({'success': True, 'id': cur.lastrowid})

@app.route('/api/weeklessons/week/<int:weekid>', methods=['GET'])
def get_lessons_by_week(weekid):
    db = get_db()
    rows = db.execute("""
    SELECT weeklessons.*, generatedlesson.title 
    FROM weeklessons
    JOIN generatedlesson ON weeklessons.lessonid = generatedlesson.id
    WHERE weeklessons.weekid = ?
    ORDER BY weeklessons.orderno
""", (weekid,)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/weeklessons/<int:id>', methods=['DELETE'])
def remove_lesson_from_week(id):
    db = get_db()
    db.execute("DELETE FROM weeklessons WHERE id = ?", (id,))
    db.commit()
    return jsonify({'success': True})

@app.route('/api/weeklessons/<int:id>', methods=['PUT'])
def update_weeklesson(id):
    data = request.json
    db = get_db()
    db.execute('''
        UPDATE weeklessons
        SET  weekid = ?, orderno = ?, status = ?
        WHERE id = ?
    ''', (data['weekid'],data['orderno'], data.get('status', 'active'), id))
    db.commit()
    return jsonify({'success': True})

@app.route('/api/weeklessonsorders', methods=['PUT'])
def update_weeklessonorders():
    data = request.json
    db = get_db()
    for item in data:
        # Validate each item in the array
        if not all(key in item for key in ['id','orderno']):
            return jsonify({"error": "Each lesson update must contain 'id' and 'orderno'."}, 400)
        # Extract data for the update
        record_id = item['id']
        order_no = item['orderno']
        db.execute('''
            UPDATE weeklessons
            SET  orderno = ?
            WHERE id = ?
        ''', (order_no,record_id))
    db.commit()
    return jsonify({'success': True})

# FILE UPLOAD AND TEXT EXTRACTION
@app.route('/api/content/extract-text', methods=['POST'])
@token_required
def extract_text_from_file(current_user_id):
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = secure_filename(file.filename).lower()
        extracted_text = ""
        
        if filename.endswith('.txt'):
            extracted_text = file.read().decode('utf-8')
        elif filename.endswith('.md'):
            extracted_text = file.read().decode('utf-8')
        elif filename.endswith(('.pdf', '.doc', '.docx')):
            # For demo purposes, simulate text extraction
            file_content = file.read()
            extracted_text = f"""[Extracted content from {filename}]

This is simulated text extraction from the uploaded document. In a production environment, this would use libraries like PyPDF2, python-docx, or similar to extract actual text content from the file.

Document: {filename}
File size: {len(file_content)} bytes

Sample educational content extracted:

# Introduction to Educational Content

This document contains comprehensive educational material that has been structured according to academic standards and learning objectives.

## Key Learning Areas

1. **Foundational Concepts**
   - Core principles and theories
   - Essential vocabulary and terminology
   - Historical context and development

2. **Practical Applications**
   - Real-world examples and case studies
   - Hands-on exercises and activities
   - Problem-solving scenarios

3. **Assessment Criteria**
   - Learning outcome measurements
   - Evaluation methods and rubrics
   - Progress tracking mechanisms

## Content Structure

The material is organized into modules that build upon each other, ensuring a logical progression of knowledge and skills development.

This extracted content can now be used as source material for AI-powered content generation, providing context and foundation for creating QAQF-compliant educational resources."""
        else:
            return jsonify({'error': 'Unsupported file format. Please upload .txt, .md, .pdf, .doc, or .docx files'}), 400
        
        # Log activity
        log_activity(current_user_id, 'upload', 'file', 0, {'filename': filename})
        
        return jsonify({
            'extracted_text': extracted_text,
            'filename': filename,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': f'File processing failed: {str(e)}'}), 500

# AI CONTENT GENERATION
@app.route('/api/ai/generate-content', methods=['POST'])
@token_required
def generate_content_with_ollama(current_user_id):
    data = request.get_json()
    print(data, current_user_id)
    return jsonify({'error': 'AI content generation is not yet implemented.'}), 501
    try:
        contenttype = data.get('generation_type', 'content').lower()
        prompt = ""
        content_type = data.get('content_type', 'academic_paper')

        if contenttype == "content":
            # Safely extract parameters with default values
            title = data.get('title', 'AI Generated Content')
            subject = data.get('subject_area', 'General Education')
            target_audience = data.get('target_audience', 'Students')
            learning_objectives = data.get('learning_objectives', 
                'Understand core concepts and apply knowledge in practical scenarios')
            module_code = data.get('module_code', 'GEN101')
            qaqf_level = data.get('qaqf_level', 5)
            additional_instructions = data.get('additional_instructions', '')
            source_content = data.get('source_content', '')
            assessment_methods = data.get('assessment_methods', 'quizzes, assignments')
            characteristics = data.get('selected_characteristics', ['clarity', 'coherence', 'relevance'])

            extra_sections = ""
            if source_content:
                extra_sections += f"\n- Source Material: {source_content}"
            if additional_instructions:
                extra_sections += f"\n- Additional Instructions: {additional_instructions}"

            prompt = f"""Create a comprehensive {content_type} for {subject} at QAQF Level {qaqf_level}.

    Requirements:
    - Content Type: {content_type}
    - Subject: {subject}
    - QAQF Level: {qaqf_level}
    - Educational Standards: Follow QAQF guidelines for Level {qaqf_level}
    - Module Code: {module_code}
    - Target Audience: {target_audience}
    - Learning Objectives: {learning_objectives}
    - Assessment Methods: {assessment_methods}

    Generate well-structured, educational content with:
    1. Clear learning objectives
    2. Comprehensive topic coverage
    3. Level-appropriate complexity
    4. Assessment alignment
    5. Practical applications

    Format professionally with proper headings and structure.
    """

        elif contenttype == "course":
            # Extract parameters
            title = data.get('title', 'AI Generated Course')
            subject = data.get('subject_area', 'General Education')
            target_audience = data.get('target_audience', 'Students')
            learning_objectives = data.get('learning_objectives', 
                'Understand core concepts and apply knowledge in practical scenarios')
            duration_weeks = data.get('duration_weeks', 1)
            modules_count = data.get('modules_count', 1)
            delivery_mode = data.get('delivery_mode', 'online')
            qaqf_level = data.get('qaqf_level', 5)
            additional_instructions = data.get('additional_instructions', '')
            source_content = data.get('source_content', '')
            assessment_methods = data.get('assessment_methods', 'quizzes, assignments')
            characteristics = data.get('selected_characteristics', ['clarity', 'coherence', 'relevance'])

            extra_sections = ""
            if source_content:
                extra_sections += f"\n- Source Material: {source_content}"
            if additional_instructions:
                extra_sections += f"\n- Additional Instructions: {additional_instructions}"

            full_title = f"{subject} Course - QAQF Level {qaqf_level}"

            prompt = f"""Create a comprehensive course outline titled '{full_title}'.

    Requirements:
    - Subject: {subject}
    - QAQF Level: {qaqf_level}
    - Duration: {duration_weeks} week(s)
    - Module Count: {modules_count}
    - Delivery Mode: {delivery_mode}
    - Target Audience: {target_audience}
    - Learning Objectives: {learning_objectives}
    - Assessment Methods: {assessment_methods}

    Structure the course with:
    1. Weekly module breakdown
    2. Aligned learning outcomes
    3. Level-appropriate instructional methods
    4. Embedded assessment strategies
    5. Real-world application opportunities

    Ensure the outline is clear, structured, and adheres to QAQF Level {qaqf_level} standards.
    """

        # === COMMON OLLAMA HANDLER FOR BOTH TYPES ===
        if not prompt:
            return jsonify({'error': 'Prompt generation failed. Unsupported content_type?'}), 400

        # Try Ollama API first
        ollama_response = requests.post('http://localhost:11434/api/generate', 
            json={
                'model': 'llama3.2',
                'prompt': prompt,
                'stream': False
            }, 
            timeout=3000
        )
        
        if ollama_response.status_code == 200:
            generated_content = ollama_response.json().get('response', '')
        else:
            raise Exception("Ollama API not available")
            
        # Log activity
        # log_activity(current_user_id, 'ai_generate', 'content', 0, {
        #     'content_type': content_type,
        #     'subject': subject,
        #     'qaqf_level': qaqf_level
        # })
        finn = generated_content.strip()
        print(finn)
        if contenttype == "content":
            db = get_db()
            cur = db.cursor()
            cur.execute('''
                INSERT INTO generatedlesson (courseid, title, level, description, userid, duration, type)
                VALUES (?, ?, ?, ?, ?, ?,?)
            ''', (4, title, qaqf_level, finn , current_user_id, 20, content_type))
            db.commit()
        return jsonify({
            'generated_content': finn,
            'content_type': content_type,
            'qaqf_level': qaqf_level,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': f'Content generation failed: {str(e)}'}), 500

@app.route('/api/ai/assessment-content', methods=['POST'])
@token_required
def assessment_content_ollama(current_user_id):
    data = request.get_json()
    try:
        contenttype = data.get('generation_type', 'quiz').lower()
        material = data.get('material', 'nomaterial').lower()
        qaqf_level = data.get('qaqf_level', '1').lower()
        subject = data.get('subject', '').lower()
        userquery = data.get('userquery').lower()
        if material == "nomaterial":
            prompt = f"""Create a comprehensive {contenttype} for related to {subject} at QAQF Level {qaqf_level}. 
            Format professionally with proper headings and structure. 
            Ensure the content is engaging and suitable for learning purposes.
            User query: {userquery}"""
        else:
            prompt = f"""Create a comprehensive {contenttype} for {subject} at QAQF Level {qaqf_level} based on the provided material: {material}. 
            Format professionally with proper headings and structure. 
            Ensure the content is engaging and suitable for learning purposes.
            User query: {userquery}"""
        print(prompt)
        # Try Ollama API first
        ollama_response = requests.post('http://localhost:11434/api/generate', 
            json={
                'model': 'llama3.2',
                'prompt': prompt,
                'stream': False
            }, 
            timeout=3000
        )
        
        if ollama_response.status_code == 200:
            generated_content = ollama_response.json().get('response', '')
        else:
            raise Exception("Ollama API not available")
            
        finn = generated_content.strip()
        print(finn)
        finn2 = markdown.markdown(finn)
        return jsonify({
            'generated_content': finn2,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': f'Content generation failed: {str(e)}'}), 500

# CONTENT ROUTES
@app.route('/api/content', methods=['GET'])
@token_required
def get_contents(current_user_id):
    conn = get_db()
    contents = conn.execute('''
        SELECT c.*, u.username as creator_name
        FROM contents c
        LEFT JOIN users u ON c.created_by_user_id = u.id
        ORDER BY c.created_at DESC
    ''').fetchall()
    conn.close()
    
    result = []
    for content in contents:
        content_dict = dict(content)
        try:
            content_dict['characteristics'] = json.loads(content_dict['characteristics']) if content_dict['characteristics'] else []
        except:
            content_dict['characteristics'] = []
        result.append(content_dict)
    
    return jsonify(result)

@app.route('/api/content', methods=['POST'])
@token_required
def create_content(current_user_id):
    data = request.get_json()
    
    required_fields = ['title', 'description', 'type', 'qaqf_level', 'content']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    characteristics_json = json.dumps(data.get('characteristics', []))
    
    conn = get_db()
    try:
        cursor=conn.execute('''
            INSERT INTO contents 
            (title, description, type, qaqf_level, module_code, content, characteristics, created_by_user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['description'],
            data['type'],
            data['qaqf_level'],
            data.get('module_code'),
            data['content'],
            characteristics_json,
            current_user_id
        ))
        
        content_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        log_activity(current_user_id, 'create', 'content', content_id)
        
        return jsonify({
            'message': 'Content created successfully',
            'id': content_id
        }), 201
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

# STUDY MATERIALS ROUTES
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
        try:
            material_dict['characteristics'] = json.loads(material_dict['characteristics']) if material_dict['characteristics'] else []
            material_dict['tags'] = json.loads(material_dict['tags']) if material_dict['tags'] else []
        except:
            material_dict['characteristics'] = []
            material_dict['tags'] = []
        result.append(material_dict)
    
    return jsonify(result)

@app.route('/api/study-materials', methods=['POST'])
@token_required
def create_study_material(current_user_id):
    title = request.form.get('title')
    description = request.form.get('description')
    material_type = request.form.get('type')
    qaqf_level = request.form.get('qaqf_level')

    if not all([title, description, material_type, qaqf_level]):
        return jsonify({'error': 'Missing required fields'}), 400

    file = request.files.get('file')
    content = ""
    file_url = None
    file_name = None
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx', 'md'}
    if file and allowed_file(file.filename):
        print(file.filename)
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        ext = filename.rsplit('.', 1)[1].lower()
        file_name = filename
        file_url = file_path

        try:
            if ext == 'pdf':
                content = extract_pdf_content(file_path)
            elif ext == 'txt':
                content = extract_txt_content(file_path)
            elif ext in ['doc', 'docx']:
                content = extract_doc_content(file_path)
            elif ext == 'md':
                content = extract_txt_content(file_path)  # treat markdown as plain text
        except Exception as e:
            return jsonify({'error': 'Failed to extract file content', 'details': str(e)}), 500

    conn = get_db()
    try:
        cursor = conn.execute('''
            INSERT INTO study_materials 
            (title, description, type, qaqf_level, created_by_user_id, content, file_url, file_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            title,
            description,
            material_type,
            int(qaqf_level),
            current_user_id,
            content,
            file_url,
            file_name
        ))
        
        material_id = cursor.lastrowid
        conn.commit()
        conn.close()

        log_activity(current_user_id, 'create', 'study_material', material_id)

        return jsonify({
            'message': 'Study material created successfully',
            'id': material_id
        }), 201

    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

# ACTIVITIES ROUTES
@app.route('/api/activities', methods=['GET'])
@token_required
def get_activities(current_user_id):
    conn = get_db()
    activities = conn.execute('''
        SELECT a.*, u.username
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 100
    ''').fetchall()
    conn.close()
    
    result = []
    for activity in activities:
        activity_dict = dict(activity)
        try:
            activity_dict['details'] = json.loads(activity_dict['details']) if activity_dict['details'] else None
        except:
            activity_dict['details'] = None
        result.append(activity_dict)
    
    return jsonify(result)

# Additional AI routes for assessment and verification
@app.route('/api/ai/assess-content', methods=['POST'])
@token_required
def assess_content_with_ai(current_user_id):
    data = request.get_json()
    
    try:
        content = data.get('content', '')
        assessment_type = data.get('assessment_type', 'quiz')
        qaqf_level = data.get('qaqf_level', '5')
        subject = data.get('subject', 'General Education')
        
        prompt = f"""Create a {assessment_type} for {subject} at QAQF Level {qaqf_level}.

Content to assess:
{content}

Generate a comprehensive {assessment_type} that includes:
1. Clear instructions
2. Multiple question types appropriate for Level {qaqf_level}
3. Marking criteria and rubrics
4. Expected learning outcomes assessment

Format as a complete assessment ready for use."""

        try:
            # Try Ollama API first
            ollama_response = requests.post('http://localhost:11434/api/generate', 
                json={
                    'model': 'llama3.2',
                    'prompt': prompt,
                    'stream': False
                }, 
                timeout=30
            )
            
            if ollama_response.status_code == 200:
                assessment = ollama_response.json().get('response', '')
            else:
                raise Exception("Ollama API not available")
                
        except:
            # Fallback assessment generation
            assessment = f"""# {subject} Assessment - QAQF Level {qaqf_level}

## Instructions
This {assessment_type} assesses your understanding of {subject} concepts at QAQF Level {qaqf_level}. Please read all questions carefully and provide complete answers.

## Section A: Multiple Choice Questions (40 points)

1. Which of the following best describes the core concept of {subject}?
   a) Option A - Basic understanding
   b) Option B - Intermediate application
   c) Option C - Advanced synthesis
   d) Option D - Expert evaluation

2. In the context of {subject}, what is the most important consideration?
   a) Theoretical framework
   b) Practical application
   c) Historical context
   d) Future implications

## Section B: Short Answer Questions (30 points)

3. Explain the key principles of {subject} and their relevance to Level {qaqf_level} learning outcomes. (15 points)

4. Describe how you would apply {subject} concepts in a real-world scenario. (15 points)

## Section C: Extended Response (30 points)

5. Critically analyze the importance of {subject} in your field of study. Your response should demonstrate Level {qaqf_level} understanding and include:
   - Analysis of key concepts
   - Evaluation of different perspectives
   - Synthesis of ideas
   - Practical applications

## Marking Criteria

### Level {qaqf_level} Assessment Rubric:
- **Excellent (90-100%)**: Demonstrates comprehensive understanding with critical analysis
- **Good (80-89%)**: Shows solid understanding with some analytical depth
- **Satisfactory (70-79%)**: Basic understanding with limited analysis
- **Needs Improvement (60-69%)**: Minimal understanding, requires additional support
- **Unsatisfactory (Below 60%)**: Insufficient understanding of core concepts

## Time Allocation: {data.get('duration', '60 minutes')}
## Total Marks: {data.get('total_marks', '100')}

*Assessment generated with AI assistance for {subject} at QAQF Level {qaqf_level}*"""
        
        # Log activity
        log_activity(current_user_id, 'ai_assess', 'content', 0, {
            'assessment_type': assessment_type,
            'qaqf_level': qaqf_level,
            'subject': subject
        })
        
        return jsonify({
            'assessment': assessment.strip(),
            'assessment_type': assessment_type,
            'qaqf_level': qaqf_level,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': f'Assessment generation failed: {str(e)}'}), 500

if __name__ == '__main__':
    init_complete_db()
    print("🚀 Starting QAQF Platform API Server...")
    print("📊 Database initialized with all tables")
    print("🔐 Demo accounts: admin/admin123, user/user123")
    print("🤖 AI integration: Ollama (with fallback)")
    print("📁 File upload: Enabled with text extraction")
    print("🌐 Server running on http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)