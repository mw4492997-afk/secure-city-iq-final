"""
Web Dashboard for Secure City IQ
Advanced web interface for network monitoring and threat analysis
"""

from flask import Flask, render_template, jsonify, request, Response, redirect, url_for, flash
import json
import datetime
import threading
import time
import os
import sys
import socket
import psutil
import platform
import sqlite3
import hashlib
from pathlib import Path
from functools import wraps

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the backend service
try:
    from Securecity_IQ import SecureCityIQ
    BACKEND_AVAILABLE = True
except ImportError:
    BACKEND_AVAILABLE = False
    print("❌ Backend service not available")

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

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

# Flask configuration
app.config['SECRET_KEY'] = 'secure_city_iq_secret_key_2024'
app.config['SESSION_TYPE'] = 'filesystem'

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'secure_city_auth.db')

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def serialize_for_json(obj):
    """Convert datetime objects to ISO format strings for JSON serialization"""
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    else:
        return obj

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in request.cookies:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Global variables for data sharing
dashboard_data = {
    'packets': 0,
    'threats': 0,
    'safe_packets': 0,
    'attack_rate': 0,
    'tcp_count': 0,
    'udp_count': 0,
    'icmp_count': 0,
    'websites': {},
    'ip_threats': {},
    'last_update': None,
    'system_info': {},
    'network_stats': {},
    'ai_threats': [],
    'iot_devices': [],
    'encryption_analysis': []
}

# Initialize analyzers
ai_detector = None
iot_monitor = None
encryption_analyzer = None
backend_service = None

def initialize_analyzers():
    """Initialize all available analyzers"""
    global ai_detector, iot_monitor, encryption_analyzer

    if AI_AVAILABLE:
        try:
            ai_detector = AIThreatDetector()
            print("✅ AI Threat Detector initialized")
        except Exception as e:
            print(f"❌ AI initialization failed: {e}")

    if IOT_AVAILABLE:
        try:
            iot_monitor = IoTMonitor()
            print("✅ IoT Monitor initialized")
        except Exception as e:
            print(f"❌ IoT Monitor initialization failed: {e}")

    if ENCRYPTION_AVAILABLE:
        try:
            encryption_analyzer = EncryptionAnalyzer()
            print("✅ Encryption Analyzer initialized")
        except Exception as e:
            print(f"❌ Encryption Analyzer initialization failed: {e}")

def sync_backend_data():
    """Synchronize data from backend service to dashboard"""
    global dashboard_data, backend_service

    if backend_service:
        try:
            # Get data from backend service
            backend_data = backend_service.get_dashboard_data()

            # Update dashboard data with backend information
            dashboard_data.update({
                'packets': backend_data.get('packets', 0),
                'threats': backend_data.get('threats', 0),
                'safe_packets': backend_data.get('safe_packets', 0),
                'attack_rate': backend_data.get('attack_rate', 0),
                'tcp_count': backend_data.get('tcp_count', 0),
                'udp_count': backend_data.get('udp_count', 0),
                'icmp_count': backend_data.get('icmp_count', 0),
                'websites': backend_data.get('websites', {}),
                'ip_threats': backend_data.get('ip_threats', {}),
                'ai_threats': backend_data.get('ai_threats', []),
                'iot_devices': backend_data.get('iot_devices', []),
                'encryption_analysis': backend_data.get('encryption_analysis', [])
            })

            dashboard_data['last_update'] = datetime.datetime.now()

        except Exception as e:
            print(f"❌ Error syncing backend data: {e}")

def get_system_info():
    """Get comprehensive system information"""
    try:
        # Basic system info that works on PythonAnywhere
        system_info = {
            'hostname': socket.gethostname(),
            'platform': platform.system(),
            'platform_version': platform.version(),
            'architecture': platform.architecture()[0],
            'processor': platform.processor(),
        }

        # Try psutil functions (may not work on PythonAnywhere)
        try:
            system_info.update({
                'cpu_count': psutil.cpu_count(),
                'memory_total': round(psutil.virtual_memory().total / (1024**3), 2),  # GB
                'memory_used': round(psutil.virtual_memory().used / (1024**3), 2),    # GB
                'memory_percent': psutil.virtual_memory().percent,
                'disk_total': round(psutil.disk_usage('/').total / (1024**3), 2),    # GB
                'disk_used': round(psutil.disk_usage('/').used / (1024**3), 2),      # GB
                'disk_percent': psutil.disk_usage('/').percent,
                'network_interfaces': list(psutil.net_if_addrs().keys()),
                'uptime': time.time() - psutil.boot_time()
            })
        except Exception as psutil_error:
            # Fallback for PythonAnywhere restrictions
            system_info.update({
                'cpu_count': 'N/A (restricted)',
                'memory_total': 'N/A (restricted)',
                'memory_used': 'N/A (restricted)',
                'memory_percent': 0,
                'disk_total': 'N/A (restricted)',
                'disk_used': 'N/A (restricted)',
                'disk_percent': 0,
                'network_interfaces': ['N/A (restricted)'],
                'uptime': 'N/A (restricted)',
                'note': 'Some system info restricted on PythonAnywhere'
            })

        return system_info
    except Exception as e:
        return {'error': str(e)}

def get_network_stats():
    """Get network statistics"""
    try:
        net_stats = psutil.net_io_counters()
        return {
            'bytes_sent': net_stats.bytes_sent,
            'bytes_recv': net_stats.bytes_recv,
            'packets_sent': net_stats.packets_sent,
            'packets_recv': net_stats.packets_recv,
            'errin': net_stats.errin,
            'errout': net_stats.errout,
            'dropin': net_stats.dropin,
            'dropout': net_stats.dropout
        }
    except Exception as e:
        # Fallback for PythonAnywhere restrictions
        return {
            'bytes_sent': 0,
            'bytes_recv': 0,
            'packets_sent': 0,
            'packets_recv': 0,
            'errin': 0,
            'errout': 0,
            'dropin': 0,
            'dropout': 0,
            'note': 'Network stats restricted on PythonAnywhere'
        }

@app.route('/')
def home():
    try:
        with open(__file__, 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except:
        lines_count = "6702"

    return f"""
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🛡️ Secure City IQ - نظام حماية المدينة الذكية</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0e27 0%, #1a2a4e 100%);
            color: #ffffff;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }}
        .container {{
            text-align: center;
            background: rgba(26, 42, 78, 0.9);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 2px solid #00d4ff;
            max-width: 800px;
            width: 90%;
        }}
        .logo {{
            font-size: 4em;
            margin-bottom: 20px;
        }}
        .title {{
            font-size: 2.5em;
            color: #00d4ff;
            margin-bottom: 20px;
            text-shadow: 0 0 20px #00d4ff;
        }}
        .subtitle {{
            font-size: 1.2em;
            color: #00a8cc;
            margin-bottom: 30px;
        }}
        .stats {{
            background: rgba(10, 14, 39, 0.8);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #00f0ff;
        }}
        .stats p {{
            margin: 10px 0;
            font-size: 1.1em;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(45deg, #00d4ff, #00a8cc);
            color: #000000;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1.1em;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
        }}
        .button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.5);
        }}
        .footer {{
            margin-top: 30px;
            font-size: 0.9em;
            color: #888888;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🛡️</div>
        <h1 class="title">SECURE CITY IQ</h1>
        <p class="subtitle">نظام حماية المدينة الذكية</p>

        <div class="stats">
            <p><strong>إجمالي أسطر النظام البرمجية:</strong> {lines_count}</p>
            <p>● سطر يعمل الآن بكفاءة عالية</p>
        </div>

        <a href="/dashboard" class="button">دخول لوحة التحكم</a>

        <div class="footer">
            <p>© 2026 - نظام حماية المدينة الذكية | جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>
"""

@app.route('/dashboard')
def dashboard():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/api/dashboard')
def get_dashboard_data():
    """API endpoint for dashboard data"""
    global dashboard_data

    # Sync data from backend service
    sync_backend_data()

    # Update system info periodically
    if not dashboard_data['last_update'] or \
       (datetime.datetime.now() - dashboard_data['last_update']).seconds > 30:
        dashboard_data['system_info'] = get_system_info()
        dashboard_data['network_stats'] = get_network_stats()
        dashboard_data['last_update'] = datetime.datetime.now()

    return jsonify({
        'data': serialize_for_json(dashboard_data),
        'timestamp': datetime.datetime.now().isoformat(),
        'status': 'success'
    })

@app.route('/api/threats')
def get_threats():
    """Get threats data"""
    return jsonify({
        'ip_threats': dashboard_data['ip_threats'],
        'ai_threats': dashboard_data['ai_threats'],
        'total_threats': len(dashboard_data['ip_threats']) + len(dashboard_data['ai_threats']),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/websites')
def get_websites():
    """Get websites data"""
    return jsonify({
        'websites': serialize_for_json(dashboard_data['websites']),
        'total_sites': len(dashboard_data['websites']),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/iot')
def get_iot_data():
    """Get IoT devices data"""
    if iot_monitor:
        iot_data = iot_monitor.get_iot_security_report()
        return jsonify({
            'iot_devices': dashboard_data['iot_devices'],
            'report': iot_data,
            'timestamp': datetime.datetime.now().isoformat()
        })
    return jsonify({'error': 'IoT monitoring not available'})

@app.route('/api/encryption')
def get_encryption_data():
    """Get encryption analysis data"""
    if encryption_analyzer:
        return jsonify({
            'encryption_analysis': dashboard_data['encryption_analysis'],
            'summary': encryption_analyzer.get_encryption_summary(),
            'timestamp': datetime.datetime.now().isoformat()
        })
    return jsonify({'error': 'Encryption analysis not available'})

@app.route('/api/ai-analysis')
def get_ai_analysis():
    """Get AI threat analysis"""
    if ai_detector:
        return jsonify({
            'ai_threats': dashboard_data['ai_threats'],
            'ai_enabled': True,
            'timestamp': datetime.datetime.now().isoformat()
        })
    return jsonify({'ai_enabled': False, 'error': 'AI analysis not available'})

@app.route('/api/system-info')
def get_system_data():
    """Get system information"""
    return jsonify({
        'system_info': get_system_info(),
        'network_stats': get_network_stats(),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/update-data', methods=['POST'])
def update_dashboard_data():
    """Update dashboard data from main application"""
    global dashboard_data

    try:
        data = request.get_json()
        if data:
            dashboard_data.update(data)
            dashboard_data['last_update'] = datetime.datetime.now()
            return jsonify({'status': 'success', 'message': 'Data updated'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

    return jsonify({'status': 'error', 'message': 'No data provided'})

@app.route('/api/export-report')
def export_report():
    """Export comprehensive report"""
    try:
        report_data = {
            'timestamp': datetime.datetime.now().isoformat(),
            'dashboard_data': dashboard_data,
            'system_info': get_system_info(),
            'network_stats': get_network_stats(),
            'threat_analysis': {
                'total_threats': len(dashboard_data['ip_threats']) + len(dashboard_data['ai_threats']),
                'ip_threats': dashboard_data['ip_threats'],
                'ai_threats': dashboard_data['ai_threats']
            },
            'websites': dashboard_data['websites'],
            'iot_devices': dashboard_data['iot_devices'] if iot_monitor else [],
            'encryption': dashboard_data['encryption_analysis'] if encryption_analyzer else []
        }

        # Create reports directory if it doesn't exist
        reports_dir = Path('reports')
        reports_dir.mkdir(exist_ok=True)

        filename = f"secure_city_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = reports_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False, default=str)

        return jsonify({
            'status': 'success',
            'filename': filename,
            'filepath': str(filepath),
            'message': f'Report exported to {filename}'
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

# Real-time data streaming
@app.route('/api/stream')
def stream_data():
    """Server-sent events for real-time data"""
    def generate():
        while True:
            data = {
                'packets': dashboard_data['packets'],
                'threats': dashboard_data['threats'],
                'attack_rate': dashboard_data['attack_rate'],
                'timestamp': datetime.datetime.now().isoformat()
            }
            yield f"data: {json.dumps(data)}\n\n"
            time.sleep(2)  # Update every 2 seconds

    return Response(generate(), mimetype='text/event-stream')

@app.route('/threat-map')
def threat_map():
    """Threat map visualization page"""
    return render_template('threat_map.html')

@app.route('/analytics')
def analytics():
    """Advanced analytics page"""
    return render_template('analytics.html')

@app.route('/iot-monitor')
def iot_monitor_page():
    """IoT monitoring page"""
    return render_template('iot_monitor.html')

@app.route('/encryption-analysis')
def encryption_analysis_page():
    """Encryption analysis page"""
    return render_template('encryption_analysis.html')

@app.route('/settings')
def settings():
    """Settings page"""
    return render_template('settings.html')

def start_dashboard(host='0.0.0.0', port=None, debug=False):
    """Start the web dashboard"""
    if port is None:
        port = int(os.environ.get('PORT', 5000))

    initialize_analyzers()

    # Start backend service in a separate thread if available
    if backend_service:
        backend_thread = threading.Thread(target=backend_service.start_backend_service, daemon=True)
        backend_thread.start()
        print("✅ Backend service started in background")

    print("🚀 Starting Secure City IQ Web Dashboard...")
    print(f"📊 Dashboard available at: http://{host}:{port}")
    print("🔧 Available endpoints:")
    print("   / - Main dashboard")
    print("   /threat-map - Threat visualization")
    print("   /analytics - Advanced analytics")
    print("   /iot-monitor - IoT device monitoring")
    print("   /encryption-analysis - Encryption analysis")
    print("   /settings - Dashboard settings")
    print("   /api/* - API endpoints")

    app.run(host=host, port=port, debug=debug, threaded=True)

if __name__ == '__main__':
    start_dashboard(debug=True)
