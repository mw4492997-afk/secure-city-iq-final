import subprocess
import datetime
import threading
from pathlib import Path
import platform
import re
import json
from urllib.parse import parse_qs, urlparse
import base64
import urllib.parse
import socket
import ipaddress
import sqlite3
import os
import hashlib

try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False
    print("⚠️ مكتبة bcrypt غير مثبتة - سيتم استخدام hashlib بدلاً منها")
    import hashlib

try:
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.backends import default_backend
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False
    print("⚠️ مكتبة cryptography غير مثبتة - بعض ميزات فك التشفير قد لا تعمل")

# 🌐 مكتبات التكامل مع وسائل التواصل الاجتماعي والخدمات الخارجية
try:
    import requests # للاتصال مع APIs الخارجية
except ImportError:
    print("⚠️ مكتبة requests غير مثبتة - بعض الميزات قد لا تعمل")
    requests = None

try:
    import smtplib # البريد الإلكتروني
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
except ImportError:
    pass

# 🤖 AI Threat Detection Module
try:
    from ai_threat_detector import AIThreatDetector, initialize_ai_detector
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("⚠️ مكتبة AI غير متوفرة - ميزات الذكاء الاصطناعي قد لا تعمل")

# 🛡️ محرك الحظر في Windows
def block_ip_windows(ip):
    """حظر IP تلقائياً عبر جدار حماية Windows"""
    try:
        cmd = [
        "netsh", "advfirewall", "firewall", "add", "rule",
        f"name=SmartCity_Block_{ip}",
        "dir=in", "action=block", f"remoteip={ip}"
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except:
        return False

def unblock_ip_windows(ip):
    """فك حظر IP من جدار حماية Windows"""
    try:
        cmd = [
        "netsh", "advfirewall", "firewall", "delete", "rule",
        f"name=SmartCity_Block_{ip}"
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except:
        return False

class SecurityCore:
    """نواة نظام الحماية والأمان"""

    def __init__(self):
        # متغيرات النظام
        self.safe_count = 0
        self.threat_count = 0
        self.is_monitoring = False
        self.total_packets = 0
        self.tcp_count = 0
        self.udp_count = 0
        self.icmp_count = 0
        self.other_count = 0
        self.decoded_content_count = 0
        self.detected_threats = []
        self.threat_details = []
        self.start_time = None
        self.attack_rate = 0

        # قاموس تتبع IP المهددة
        self.ip_threats = {} # {ip: {'count': 0, 'types': [], 'risk': 0, 'last_time': None}}
        self.blacklist_ips = set() # قائمة IP المحظورة

        # قاموس تتبع المواقع (Domains و URLs)
        self.websites = {} # {domain: {'count': 0, 'urls': [], 'ips': [], 'last_time': None}}
        self.visited_urls = [] # قائمة URLs المزارة

        # قاموس تتبع التفاصيل الكاملة
        self.detailed_activity = [] # قائمة جميع الأنشطة المفصلة

        # فحص شامل متقدم لكل شيء في الشبكة
        self.all_traffic = [] # جميع حركات الشبكة الخام
        self.protocol_stats = {} # إحصائيات البروتوكولات
        self.port_activity = {} # نشاط المنافذ
        self.connection_logs = [] # سجل جميع الاتصالات
        self.dns_queries = [] # استعلامات DNS المسجلة
        self.encryption_analysis = [] # تحليل الاتصالات المشفرة
        self.anomaly_detection = [] # كشف الأنشطة غير العادية

        # ===== 🆕 ميزات جديدة متقدمة =====
        # 🤖 AI Threat Detection Integration
        self.ai_detector = None
        self.ai_threats_detected = []
        self.ai_analysis_results = []
        self.ai_enabled = AI_AVAILABLE

        # 🔐 Brute Force Detection for WiFi
        self.brute_force_attempts = {} # {mac: {'count': 0, 'timestamps': [], 'last_alert': None}}
        self.brute_force_threshold = 5 # Number of attempts before alert
        self.brute_force_time_window = 60 # Time window in seconds
        self.brute_force_alert_cooldown = 300 # Cooldown between alerts for same MAC (5 minutes)

        # Initialize AI detector if available
        if self.ai_enabled:
            try:
                self.ai_detector = AIThreatDetector()
                initialize_ai_detector()
                self.log_message("🤖 تم تفعيل نظام الكشف عن التهديدات بالذكاء الاصطناعي")
            except Exception as e:
                self.log_message(f"⚠️ خطأ في تفعيل الذكاء الاصطناعي: {str(e)}")
                self.ai_enabled = False

        # Additional tracking variables
        self.login_activities = [] # سجل جميع محاولات التسجيل
        self.email_tracking = [] # البريد الإلكتروني والخدمات البريدية

    def log_message(self, message):
        """تسجيل رسالة مع الوقت والتنسيق الاحترافي"""
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        formatted_msg = f"[{timestamp}] {message}\n"
        print(formatted_msg.strip())

    def extract_domain_from_packet(self, packet):
        """استخراج اسم المجال و URL الكاملة من الحزمة"""
        try:
            if packet.haslayer(TCP):
                payload = bytes(packet[TCP].payload)

                # البحث عن HTTP Host header و Request Line
                domain = None
                url_path = None

                if b"Host: " in payload:
                    start = payload.find(b"Host: ") + 6
                    end = payload.find(b"\r\n", start)
                    if end > start:
                        domain = payload[start:end].decode('utf-8', errors='ignore').strip()

                        # البحث عن GET/POST request
                        if b"GET " in payload or b"POST " in payload:
                            if b"GET " in payload:
                                start = payload.find(b"GET ") + 4
                            else:
                                start = payload.find(b"POST ") + 5

                            end = payload.find(b" HTTP", start)
                            if end > start:
                                url_path = payload[start:end].decode('utf-8', errors='ignore').strip()

                                # اذا وجدنا URL كاملة
                                if domain and url_path:
                                    full_url = f"https://{domain}{url_path}" if url_path.startswith('/') else f"https://{domain}/{url_path}"
                                    return domain, full_url, url_path
                        elif domain:
                            return domain, None, None
        except:
            pass

        return None, None, None

    def detect_login_activity(self, packet, domain, url_path):
        """🔐 كشف عمليات التسجيل والمصادقة"""
        try:
            if not packet.haslayer(TCP):
                return

            src_ip = packet[IP].src
            dport = packet[TCP].dport
            payload = bytes(packet[TCP].payload) if packet[TCP].payload else b""

            # 1. كشف SSH Login (Port 22)
            if dport == 22:
                if b"SSH" in payload or b"OpenSSH" in payload:
                    self.log_message(f"🔐 [SSH] محاولة تسجيل SSH من {src_ip}")
                    self.record_login_attempt(src_ip, "SSH", "22", "pending")

            # 2. كشف FTP Login (Port 21)
            elif dport == 21:
                if b"USER " in payload or b"PASS " in payload:
                    username = self.extract_ftp_credentials(payload, "USER")
                    self.log_message(f"⚠️ [FTP] محاولة تسجيل FTP من {src_ip}")
                    self.record_login_attempt(src_ip, "FTP", "21", "pending", username)

            # 3. كشف HTTP Basic Auth (Port 80/443)
            elif dport in [80, 443]:
                if b"Authorization: Basic " in payload:
                    self.log_message(f"🔐 [HTTP Auth] محاولة مصادقة HTTP من {src_ip}")
                    self.record_login_attempt(src_ip, "HTTP_AUTH", str(dport), "detected")

            # 4. كشف Email Services (SMTP, POP3, IMAP)
            elif dport in [25, 110, 143, 465, 587, 993, 995]:
                service_map = {25: "SMTP", 110: "POP3", 143: "IMAP", 465: "SMTPS", 587: "SMTP_TLS", 993: "IMAPS", 995: "POP3S"}
                service = service_map.get(dport, "Email Service")
                if b"AUTH " in payload or b"USER " in payload:
                    self.log_message(f"📧 [{service}] محاولة مصادقة بريد من {src_ip}")
                    self.record_login_attempt(src_ip, service, str(dport), "pending")
                    self.email_tracking.append({
                        'timestamp': datetime.datetime.now(),
                        'ip': src_ip,
                        'service': service,
                        'port': dport
                    })

            # 5. كشف Database Logins
            elif dport in [3306, 1433, 5432, 27017, 6379]:
                db_map = {3306: "MySQL", 1433: "MSSQL", 5432: "PostgreSQL", 27017: "MongoDB", 6379: "Redis"}
                db_type = db_map.get(dport)
                self.log_message(f"🗄️ [{db_type}] محاولة اتصال قاعدة بيانات من {src_ip}")
                self.record_login_attempt(src_ip, f"DB_{db_type}", str(dport), "detected")

            # 6. كشف VPN Connections
            elif dport in [500, 1194, 443]: # IPSec, OpenVPN, HTTPS/VPN
                if b"VPN" in payload or dport == 1194:
                    self.log_message(f"🔒 [VPN] محاولة اتصال VPN من {src_ip}")
                    self.record_login_attempt(src_ip, "VPN", str(dport), "detected")

        except Exception as e:
            self.log_message(f"خطأ في كشف نشاط التسجيل: {str(e)}")

    def record_login_attempt(self, ip, service, port, status, username=None):
        """تسجيل محاولة تسجيل دخول"""
        attempt = {
            'timestamp': datetime.datetime.now(),
            'ip': ip,
            'service': service,
            'port': port,
            'status': status,
            'username': username
        }
        self.login_activities.append(attempt)

    def extract_ftp_credentials(self, payload, credential_type):
        """استخراج بيانات الاعتماد من حزمة FTP"""
        try:
            if credential_type == "USER":
                start = payload.find(b"USER ") + 5
            elif credential_type == "PASS":
                start = payload.find(b"PASS ") + 5
            else:
                return None

            end = payload.find(b"\r\n", start)
            if end > start:
                return payload[start:end].decode('utf-8', errors='ignore').strip()
        except:
            pass
        return None
