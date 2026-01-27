"""
Secure City IQ REST API Server
Comprehensive API for network monitoring, threat analysis, and system management
"""

from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
import json
import datetime
import jwt
import hashlib
import secrets
import threading
import time
import os
import zipfile
import io
from functools import wraps
import base64
import hmac
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from ai_threat_detector import AIThreatDetector
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False

try:
    from iot_monitor import IoTMonitor
    IOT_AVAILABLE = True
except ImportError:
    IOT_AVAILABLE = False

try:
    from encryption_analyzer import EncryptionAnalyzer
    ENCRYPTION_AVAILABLE = True
except ImportError:
    ENCRYPTION_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# API Configuration
API_CONFIG = {
    'secret_key': 'secure_city_iq_api_secret_2024',
    'token_expire_hours': 24,
    'rate_limit_window': 60,  # seconds
    'rate_limit_max_requests': 100,
    'api_version': 'v1'
}

# In-memory storage (in production, use database)
users_db = {
    'admin': {
        'password_hash': hashlib.sha256('admin123'.encode()).hexdigest(),
        'role': 'admin',
        'permissions': ['read', 'write', 'admin'],
        'created_at': datetime.datetime.now().isoformat()
    }
}

active_tokens = {}
rate_limits = {}

# Global data store
api_data_store = {
    'monitoring_data': {
        'packets': 0,
        'threats': 0,
        'safe_packets': 0,
        'attack_rate': 0,
        'tcp_count': 0,
        'udp_count': 0,
        'icmp_count': 0,
        'last_update': None
    },
    'threats': [],
    'websites': {},
    'ip_threats': {},
    'ai_analysis': [],
    'iot_devices': [],
    'encryption_data': [],
    'system_logs': [],
    'alerts': []
}

# Initialize analyzers
ai_detector = None
iot_monitor = None
encryption_analyzer = None

def initialize_analyzers():
    """Initialize all available analyzers"""
    global ai_detector, iot_monitor, encryption_analyzer

    if AI_AVAILABLE:
        try:
            ai_detector = AIThreatDetector()
            print("✅ AI Threat Detector initialized for API")
        except Exception as e:
            print(f"❌ AI initialization failed: {e}")

    if IOT_AVAILABLE:
        try:
            iot_monitor = IoTMonitor()
            print("✅ IoT Monitor initialized for API")
        except Exception as e:
            print(f"❌ IoT Monitor initialization failed: {e}")

    if ENCRYPTION_AVAILABLE:
        try:
            encryption_analyzer = EncryptionAnalyzer()
            print("✅ Encryption Analyzer initialized for API")
        except Exception as e:
            print(f"❌ Encryption Analyzer initialization failed: {e}")

# Authentication decorators
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401

        token = auth_header.split(' ')[1]
        user = verify_token(token)
        if not user:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'current_user') or request.current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def check_rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_ip = request.remote_addr
        current_time = time.time()

        if client_ip not in rate_limits:
            rate_limits[client_ip] = {'requests': [], 'blocked_until': 0}

        # Clean old requests
        rate_limits[client_ip]['requests'] = [
            req_time for req_time in rate_limits[client_ip]['requests']
            if current_time - req_time < API_CONFIG['rate_limit_window']
        ]

        # Check if blocked
        if current_time < rate_limits[client_ip]['blocked_until']:
            return jsonify({'error': 'Rate limit exceeded. Try again later.'}), 429

        # Check rate limit
        if len(rate_limits[client_ip]['requests']) >= API_CONFIG['rate_limit_max_requests']:
            rate_limits[client_ip]['blocked_until'] = current_time + 300  # Block for 5 minutes
            return jsonify({'error': 'Rate limit exceeded. Try again later.'}), 429

        rate_limits[client_ip]['requests'].append(current_time)
        return f(*args, **kwargs)
    return decorated_function

# Authentication functions
def generate_token(username, role='user'):
    """Generate JWT token"""
    payload = {
        'username': username,
        'role': role,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=API_CONFIG['token_expire_hours'])
    }
    token = jwt.encode(payload, API_CONFIG['secret_key'], algorithm='HS256')
    active_tokens[token] = payload
    return token

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, API_CONFIG['secret_key'], algorithms=['HS256'])
        if token in active_tokens:
            return payload
    except jwt.ExpiredSignatureError:
        if token in active_tokens:
            del active_tokens[token]
    except jwt.InvalidTokenError:
        pass
    return None

def hash_password(password):
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{hashed.hex()}"

def verify_password(password, hashed_password):
    """Verify password against hash"""
    try:
        salt, hash_value = hashed_password.split(':')
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return hmac.compare_digest(hashed.hex(), hash_value)
    except:
        return False

# API Routes

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat(),
        'version': API_CONFIG['api_version'],
        'services': {
            'ai_detector': AI_AVAILABLE,
            'iot_monitor': IOT_AVAILABLE,
            'encryption_analyzer': ENCRYPTION_AVAILABLE
        }
    })

@app.route('/api/v1/auth/login', methods=['POST'])
@check_rate_limit
def login():
    """User authentication"""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400

    username = data['username']
    password = data['password']

    if username not in users_db:
        return jsonify({'error': 'Invalid credentials'}), 401

    stored_hash = users_db[username]['password_hash']
    if not verify_password(password, stored_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = generate_token(username, users_db[username]['role'])

    return jsonify({
        'token': token,
        'user': {
            'username': username,
            'role': users_db[username]['role'],
            'permissions': users_db[username]['permissions']
        },
        'expires_in': API_CONFIG['token_expire_hours'] * 3600
    })

@app.route('/api/v1/auth/logout', methods=['POST'])
@require_auth
def logout():
    """User logout"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in active_tokens:
            del active_tokens[token]

    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/v1/auth/refresh', methods=['POST'])
@require_auth
def refresh_token():
    """Refresh authentication token"""
    current_user = request.current_user
    token = generate_token(current_user['username'], current_user['role'])

    return jsonify({
        'token': token,
        'expires_in': API_CONFIG['token_expire_hours'] * 3600
    })

# Monitoring Data Endpoints

@app.route('/api/v1/monitoring/status', methods=['GET'])
@require_auth
def get_monitoring_status():
    """Get current monitoring status"""
    return jsonify({
        'data': api_data_store['monitoring_data'],
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/monitoring/update', methods=['POST'])
@require_auth
def update_monitoring_data():
    """Update monitoring data from main application"""
    data = request.get_json()
    if data:
        api_data_store['monitoring_data'].update(data)
        api_data_store['monitoring_data']['last_update'] = datetime.datetime.now().isoformat()
        return jsonify({'status': 'success', 'message': 'Data updated'})
    return jsonify({'error': 'No data provided'}), 400

@app.route('/api/v1/threats', methods=['GET'])
@require_auth
def get_threats():
    """Get threats data with filtering options"""
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    severity = request.args.get('severity')
    source_ip = request.args.get('source_ip')

    threats = api_data_store['threats']

    # Apply filters
    if severity:
        threats = [t for t in threats if t.get('severity') == severity]
    if source_ip:
        threats = [t for t in threats if t.get('src_ip') == source_ip]

    # Apply pagination
    total = len(threats)
    threats = threats[offset:offset + limit]

    return jsonify({
        'threats': threats,
        'total': total,
        'limit': limit,
        'offset': offset,
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/threats/<threat_id>', methods=['GET'])
@require_auth
def get_threat(threat_id):
    """Get specific threat details"""
    threat = next((t for t in api_data_store['threats'] if str(t.get('id')) == threat_id), None)
    if not threat:
        return jsonify({'error': 'Threat not found'}), 404

    return jsonify({'threat': threat})

@app.route('/api/v1/threats', methods=['POST'])
@require_auth
def add_threat():
    """Add new threat (for integration with main application)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No threat data provided'}), 400

    threat_id = len(api_data_store['threats']) + 1
    threat = {
        'id': threat_id,
        'timestamp': datetime.datetime.now().isoformat(),
        **data
    }

    api_data_store['threats'].append(threat)

    # Keep only last 1000 threats
    if len(api_data_store['threats']) > 1000:
        api_data_store['threats'] = api_data_store['threats'][-1000:]

    return jsonify({'status': 'success', 'threat_id': threat_id}), 201

# Websites and Domains

@app.route('/api/v1/websites', methods=['GET'])
@require_auth
def get_websites():
    """Get websites data"""
    return jsonify({
        'websites': api_data_store['websites'],
        'total': len(api_data_store['websites']),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/websites/block', methods=['POST'])
@require_auth
@require_admin
def block_website():
    """Block a website"""
    data = request.get_json()
    domain = data.get('domain')
    if not domain:
        return jsonify({'error': 'Domain required'}), 400

    # In a real implementation, this would add to firewall rules
    api_data_store['websites'][domain] = api_data_store['websites'].get(domain, {})
    api_data_store['websites'][domain]['blocked'] = True
    api_data_store['websites'][domain]['blocked_at'] = datetime.datetime.now().isoformat()

    return jsonify({'status': 'success', 'message': f'Domain {domain} blocked'})

# IP Management

@app.route('/api/v1/ips/threats', methods=['GET'])
@require_auth
def get_ip_threats():
    """Get IP threats data"""
    return jsonify({
        'ip_threats': api_data_store['ip_threats'],
        'total': len(api_data_store['ip_threats']),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/ips/block', methods=['POST'])
@require_auth
@require_admin
def block_ip():
    """Block an IP address"""
    data = request.get_json()
    ip_address = data.get('ip')
    if not ip_address:
        return jsonify({'error': 'IP address required'}), 400

    # In a real implementation, this would add to firewall rules
    api_data_store['ip_threats'][ip_address] = api_data_store['ip_threats'].get(ip_address, {})
    api_data_store['ip_threats'][ip_address]['blocked'] = True
    api_data_store['ip_threats'][ip_address]['blocked_at'] = datetime.datetime.now().isoformat()

    return jsonify({'status': 'success', 'message': f'IP {ip_address} blocked'})

@app.route('/api/v1/ips/unblock', methods=['POST'])
@require_auth
@require_admin
def unblock_ip():
    """Unblock an IP address"""
    data = request.get_json()
    ip_address = data.get('ip')
    if not ip_address:
        return jsonify({'error': 'IP address required'}), 400

    if ip_address in api_data_store['ip_threats']:
        api_data_store['ip_threats'][ip_address]['blocked'] = False
        api_data_store['ip_threats'][ip_address]['unblocked_at'] = datetime.datetime.now().isoformat()

    return jsonify({'status': 'success', 'message': f'IP {ip_address} unblocked'})

# AI Analysis

@app.route('/api/v1/ai/analysis', methods=['GET'])
@require_auth
def get_ai_analysis():
    """Get AI threat analysis results"""
    if not AI_AVAILABLE:
        return jsonify({'error': 'AI analysis not available'}), 503

    return jsonify({
        'ai_analysis': api_data_store['ai_analysis'],
        'total': len(api_data_store['ai_analysis']),
        'ai_enabled': True,
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/ai/predict', methods=['POST'])
@require_auth
def ai_predict():
    """Get AI prediction for packet data"""
    if not ai_detector:
        return jsonify({'error': 'AI detector not available'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Packet data required'}), 400

    try:
        prediction = ai_detector.predict_threat(data)
        result = {
            'prediction': prediction,
            'timestamp': datetime.datetime.now().isoformat(),
            'input_data': data
        }

        api_data_store['ai_analysis'].append(result)

        # Keep only last 500 AI analyses
        if len(api_data_store['ai_analysis']) > 500:
            api_data_store['ai_analysis'] = api_data_store['ai_analysis'][-500:]

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'AI prediction failed: {str(e)}'}), 500

# IoT Monitoring

@app.route('/api/v1/iot/devices', methods=['GET'])
@require_auth
def get_iot_devices():
    """Get IoT devices data"""
    if not IOT_AVAILABLE:
        return jsonify({'error': 'IoT monitoring not available'}), 503

    return jsonify({
        'iot_devices': api_data_store['iot_devices'],
        'total': len(api_data_store['iot_devices']),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/iot/scan', methods=['POST'])
@require_auth
@require_admin
def scan_iot_devices():
    """Trigger IoT network scan"""
    if not iot_monitor:
        return jsonify({'error': 'IoT monitor not available'}), 503

    try:
        network_range = request.get_json().get('network_range', '192.168.1.0/24')
        results = iot_monitor.scan_network_for_iot(network_range)

        # Update stored data
        api_data_store['iot_devices'].extend(results.get('devices', {}).values())

        return jsonify({
            'status': 'success',
            'results': results,
            'timestamp': datetime.datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': f'IoT scan failed: {str(e)}'}), 500

# Encryption Analysis

@app.route('/api/v1/encryption/analysis', methods=['GET'])
@require_auth
def get_encryption_analysis():
    """Get encryption analysis data"""
    if not ENCRYPTION_AVAILABLE:
        return jsonify({'error': 'Encryption analysis not available'}), 503

    return jsonify({
        'encryption_data': api_data_store['encryption_data'],
        'total': len(api_data_store['encryption_data']),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/encryption/analyze', methods=['POST'])
@require_auth
def analyze_encryption():
    """Analyze encryption for given data"""
    if not encryption_analyzer:
        return jsonify({'error': 'Encryption analyzer not available'}), 503

    data = request.get_json()
    if not data or not data.get('packet_data'):
        return jsonify({'error': 'Packet data required'}), 400

    try:
        analysis = encryption_analyzer.analyze_packet(data['packet_data'])
        result = {
            'analysis': analysis,
            'timestamp': datetime.datetime.now().isoformat(),
            'input_data': data
        }

        api_data_store['encryption_data'].append(result)

        # Keep only last 500 encryption analyses
        if len(api_data_store['encryption_data']) > 500:
            api_data_store['encryption_data'] = api_data_store['encryption_data'][-500:]

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Encryption analysis failed: {str(e)}'}), 500

# System Management

@app.route('/api/v1/system/info', methods=['GET'])
@require_auth
def get_system_info():
    """Get system information"""
    try:
        import psutil
        import platform
        import socket

        system_info = {
            'hostname': socket.gethostname(),
            'platform': platform.system(),
            'platform_version': platform.version(),
            'architecture': platform.architecture()[0],
            'processor': platform.processor(),
            'cpu_count': psutil.cpu_count(),
            'memory_total': round(psutil.virtual_memory().total / (1024**3), 2),
            'memory_used': round(psutil.virtual_memory().used / (1024**3), 2),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_total': round(psutil.disk_usage('/').total / (1024**3), 2),
            'disk_used': round(psutil.disk_usage('/').used / (1024**3), 2),
            'disk_percent': psutil.disk_usage('/').percent,
            'uptime': time.time() - psutil.boot_time(),
            'network_interfaces': list(psutil.net_if_addrs().keys())
        }

        return jsonify({
            'system_info': system_info,
            'timestamp': datetime.datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': f'System info retrieval failed: {str(e)}'}), 500

@app.route('/api/v1/system/logs', methods=['GET'])
@require_auth
def get_system_logs():
    """Get system logs"""
    limit = request.args.get('limit', 100, type=int)
    level = request.args.get('level')  # debug, info, warning, error

    logs = api_data_store['system_logs']

    if level:
        logs = [log for log in logs if log.get('level') == level]

    logs = logs[-limit:]  # Get last N logs

    return jsonify({
        'logs': logs,
        'total': len(logs),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/system/logs', methods=['POST'])
@require_auth
def add_system_log():
    """Add system log entry"""
    data = request.get_json()
    if not data or not data.get('message'):
        return jsonify({'error': 'Log message required'}), 400

    log_entry = {
        'id': len(api_data_store['system_logs']) + 1,
        'timestamp': datetime.datetime.now().isoformat(),
        'level': data.get('level', 'info'),
        'message': data['message'],
        'source': data.get('source', 'api'),
        'user': request.current_user.get('username', 'unknown')
    }

    api_data_store['system_logs'].append(log_entry)

    # Keep only last 1000 logs
    if len(api_data_store['system_logs']) > 1000:
        api_data_store['system_logs'] = api_data_store['system_logs'][-1000:]

    return jsonify({'status': 'success', 'log_id': log_entry['id']}), 201

# Data Export/Import

@app.route('/api/v1/export/data', methods=['GET'])
@require_auth
@require_admin
def export_data():
    """Export all system data"""
    try:
        export_data = {
            'export_timestamp': datetime.datetime.now().isoformat(),
            'version': API_CONFIG['api_version'],
            'data': api_data_store
        }

        # Create JSON response
        json_data = json.dumps(export_data, indent=2, ensure_ascii=False, default=str)

        # Create in-memory file
        buffer = io.BytesIO()
        buffer.write(json_data.encode('utf-8'))
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/json',
            as_attachment=True,
            download_name=f'secure_city_export_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        )

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

@app.route('/api/v1/import/data', methods=['POST'])
@require_auth
@require_admin
def import_data():
    """Import system data"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename.endswith('.json'):
        return jsonify({'error': 'Only JSON files are supported'}), 400

    try:
        data = json.loads(file.read().decode('utf-8'))

        if 'data' in data:
            # Merge imported data with existing data
            for key, value in data['data'].items():
                if key in api_data_store:
                    if isinstance(api_data_store[key], list):
                        api_data_store[key].extend(value)
                    elif isinstance(api_data_store[key], dict):
                        api_data_store[key].update(value)

        return jsonify({
            'status': 'success',
            'message': 'Data imported successfully',
            'imported_keys': list(data.get('data', {}).keys())
        })

    except Exception as e:
        return jsonify({'error': f'Import failed: {str(e)}'}), 500

@app.route('/api/v1/backup/create', methods=['POST'])
@require_auth
@require_admin
def create_backup():
    """Create system backup"""
    try:
        backup_data = {
            'backup_timestamp': datetime.datetime.now().isoformat(),
            'version': API_CONFIG['api_version'],
            'users': users_db,
            'data': api_data_store
        }

        # Create ZIP file in memory
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add main data
            zip_file.writestr('backup.json', json.dumps(backup_data, indent=2, ensure_ascii=False, default=str))

            # Add any additional files if needed
            # zip_file.writestr('config.json', json.dumps(API_CONFIG, indent=2))

        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'secure_city_backup_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.zip'
        )

    except Exception as e:
        return jsonify({'error': f'Backup creation failed: {str(e)}'}), 500

# Real-time streaming

@app.route('/api/v1/stream/threats')
@require_auth
def stream_threats():
    """Server-sent events for real-time threats"""
    def generate():
        last_count = len(api_data_store['threats'])
        while True:
            current_count = len(api_data_store['threats'])
            if current_count != last_count:
                data = {
                    'threat_count': current_count,
                    'new_threats': current_count - last_count,
                    'latest_threat': api_data_store['threats'][-1] if api_data_store['threats'] else None,
                    'timestamp': datetime.datetime.now().isoformat()
                }
                yield f"data: {json.dumps(data)}\n\n"
                last_count = current_count
            time.sleep(1)

    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/v1/stream/monitoring')
@require_auth
def stream_monitoring():
    """Server-sent events for monitoring data"""
    def generate():
        last_update = None
        while True:
            current_update = api_data_store['monitoring_data'].get('last_update')
            if current_update != last_update:
                data = {
                    'monitoring_data': api_data_store['monitoring_data'],
                    'timestamp': datetime.datetime.now().isoformat()
                }
                yield f"data: {json.dumps(data)}\n\n"
                last_update = current_update
            time.sleep(2)

    return Response(generate(), mimetype='text/event-stream')

# User Management (Admin only)

@app.route('/api/v1/users', methods=['GET'])
@require_auth
@require_admin
def get_users():
    """Get all users"""
    users = {}
    for username, user_data in users_db.items():
        users[username] = {
            'role': user_data['role'],
            'permissions': user_data['permissions'],
            'created_at': user_data['created_at']
        }

    return jsonify({'users': users, 'total': len(users)})

@app.route('/api/v1/users', methods=['POST'])
@require_auth
@require_admin
def create_user():
    """Create new user"""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400

    username = data['username']
    if username in users_db:
        return jsonify({'error': 'User already exists'}), 409

    users_db[username] = {
        'password_hash': hash_password(data['password']),
        'role': data.get('role', 'user'),
        'permissions': data.get('permissions', ['read']),
        'created_at': datetime.datetime.now().isoformat()
    }

    return jsonify({
        'status': 'success',
        'user': {
            'username': username,
            'role': users_db[username]['role'],
            'permissions': users_db[username]['permissions']
        }
    }), 201

@app.route('/api/v1/users/<username>', methods=['DELETE'])
@require_auth
@require_admin
def delete_user(username):
    """Delete user"""
    if username not in users_db:
        return jsonify({'error': 'User not found'}), 404

    if username == 'admin':
        return jsonify({'error': 'Cannot delete admin user'}), 403

    del users_db[username]

    # Remove user's active tokens
    tokens_to_remove = [token for token, payload in active_tokens.items() if payload.get('username') == username]
    for token in tokens_to_remove:
        del active_tokens[token]

    return jsonify({'status': 'success', 'message': f'User {username} deleted'})

# API Documentation

@app.route('/api/v1/docs', methods=['GET'])
def api_docs():
    """API documentation"""
    docs = {
        'version': API_CONFIG['api_version'],
        'base_url': '/api/v1',
        'authentication': {
            'type': 'Bearer Token',
            'login_endpoint': '/auth/login',
            'token_expiry': f'{API_CONFIG["token_expire_hours"]} hours'
        },
        'endpoints': {
            'health': {'method': 'GET', 'path': '/health', 'description': 'Health check'},
            'monitoring': {'method': 'GET', 'path': '/monitoring/status', 'description': 'Get monitoring status'},
            'threats': {'method': 'GET', 'path': '/threats', 'description': 'Get threats data'},
            'websites': {'method': 'GET', 'path': '/websites', 'description': 'Get websites data'},
            'iot_devices': {'method': 'GET', 'path': '/iot/devices', 'description': 'Get IoT devices'},
            'encryption': {'method': 'GET', 'path': '/encryption/analysis', 'description': 'Get encryption analysis'},
            'ai_analysis': {'method': 'GET', 'path': '/ai/analysis', 'description': 'Get AI analysis'},
            'system_info': {'method': 'GET', 'path': '/system/info', 'description': 'Get system information'},
            'export': {'method': 'GET', 'path': '/export/data', 'description': 'Export system data'},
            'backup': {'method': 'POST', 'path': '/backup/create', 'description': 'Create system backup'}
        },
        'rate_limits': {
            'window': f'{API_CONFIG["rate_limit_window"]} seconds',
            'max_requests': API_CONFIG['rate_limit_max_requests']
        }
    }

    return jsonify(docs)

def start_api_server(host='0.0.0.0', port=8000, debug=False):
    """Start the API server"""
    initialize_analyzers()

    print("🚀 Starting Secure City IQ API Server...")
    print(f"📊 API available at: http://{host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/api/v1/docs")
    print("🔧 Available endpoints:")
    print("   /api/v1/health - Health check")
    print("   /api/v1/auth/login - Authentication")
    print("   /api/v1/monitoring/* - Monitoring data")
    print("   /api/v1/threats/* - Threat management")
    print("   /api/v1/system/* - System management")
    print("   /api/v1/export/* - Data export/import")

    app.run(host=host, port=port, debug=debug, threaded=True)

if __name__ == '__main__':
    start_api_server(debug=True)
