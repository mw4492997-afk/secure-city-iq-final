"""
Encryption Analyzer Module for Secure City IQ
Advanced TLS/SSL traffic analysis, certificate validation, and encrypted payload inspection
"""

import json
import datetime
import ssl
import socket
import threading
from typing import Dict, List, Optional, Tuple, Set
import re
import ipaddress
import hashlib
import base64
from urllib.parse import urlparse
import time

try:
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa, dsa, ec
    from cryptography.hazmat.backends import default_backend
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False
    print("⚠️ مكتبة cryptography غير متوفرة - بعض ميزات تحليل الشهادات قد لا تعمل")

try:
    from OpenSSL import SSL, crypto
    OPENSSL_AVAILABLE = True
except ImportError:
    OPENSSL_AVAILABLE = False
    print("⚠️ مكتبة OpenSSL غير متوفرة - بعض ميزات تحليل SSL قد لا تعمل")


class TLSAnalyzer:
    """TLS/SSL Traffic Analyzer Class"""

    def __init__(self):
        self.tls_sessions = {}  # {session_id: session_info}
        self.certificates = {}  # {domain: cert_info}
        self.encryption_stats = {
            'tls_versions': {},
            'cipher_suites': {},
            'cert_validity': {},
            'handshake_failures': 0,
            'protocol_downgrades': 0
        }
        self.vulnerabilities = []
        self.cert_cache = {}  # Cache for certificate validation

    def analyze_tls_handshake(self, packet_data: Dict) -> Dict:
        """Analyze TLS handshake packets"""
        analysis = {
            'tls_version': None,
            'cipher_suite': None,
            'server_name': None,
            'certificate_info': None,
            'vulnerabilities': [],
            'security_score': 0
        }

        try:
            # Extract TLS version from packet
            if 'payload' in packet_data:
                payload = packet_data['payload']

                # Check for TLS handshake
                if b'\x16\x03' in payload[:3]:  # TLS handshake
                    version_bytes = payload[1:3]
                    if version_bytes == b'\x03\x01':
                        analysis['tls_version'] = 'TLS 1.0'
                        analysis['vulnerabilities'].append('TLS 1.0 is deprecated')
                    elif version_bytes == b'\x03\x02':
                        analysis['tls_version'] = 'TLS 1.1'
                        analysis['vulnerabilities'].append('TLS 1.1 is deprecated')
                    elif version_bytes == b'\x03\x03':
                        analysis['tls_version'] = 'TLS 1.2'
                        analysis['security_score'] += 60
                    elif version_bytes == b'\x03\x04':
                        analysis['tls_version'] = 'TLS 1.3'
                        analysis['security_score'] += 100

                    # Extract Server Name Indication (SNI)
                    if b'\x00\x00' in payload:
                        sni_start = payload.find(b'\x00\x00') + 2
                        if sni_start < len(payload):
                            sni_length = int.from_bytes(payload[sni_start:sni_start+2], 'big')
                            if sni_start + 2 + sni_length < len(payload):
                                sni_data = payload[sni_start+2:sni_start+2+sni_length]
                                # Parse SNI extension
                                if len(sni_data) > 5:
                                    name_length = int.from_bytes(sni_data[3:5], 'big')
                                    if 5 + name_length <= len(sni_data):
                                        server_name = sni_data[5:5+name_length].decode('utf-8', errors='ignore')
                                        analysis['server_name'] = server_name

            # Update statistics
            if analysis['tls_version']:
                self.encryption_stats['tls_versions'][analysis['tls_version']] = \
                    self.encryption_stats['tls_versions'].get(analysis['tls_version'], 0) + 1

        except Exception as e:
            analysis['error'] = str(e)

        return analysis

    def validate_certificate(self, domain: str, port: int = 443, timeout: int = 10) -> Dict:
        """Validate SSL certificate for a domain"""
        validation_result = {
            'domain': domain,
            'valid': False,
            'issuer': None,
            'subject': None,
            'valid_from': None,
            'valid_until': None,
            'days_remaining': None,
            'fingerprint': None,
            'key_size': None,
            'signature_algorithm': None,
            'chain_length': 0,
            'vulnerabilities': [],
            'warnings': []
        }

        # Check cache first
        cache_key = f"{domain}:{port}"
        if cache_key in self.cert_cache:
            cached = self.cert_cache[cache_key]
            if time.time() - cached['timestamp'] < 3600:  # Cache for 1 hour
                return cached['result']

        try:
            # Create SSL context
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE

            with socket.create_connection((domain, port), timeout=timeout) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert_der = ssock.getpeercert(binary_form=True)

                    if cert_der and CRYPTOGRAPHY_AVAILABLE:
                        cert = x509.load_der_x509_certificate(cert_der, default_backend())

                        # Extract certificate information
                        validation_result['subject'] = cert.subject.rfc4514_string()
                        validation_result['issuer'] = cert.issuer.rfc4514_string()
                        validation_result['valid_from'] = cert.not_valid_before
                        validation_result['valid_until'] = cert.not_valid_after

                        # Calculate days remaining
                        now = datetime.datetime.now(cert.not_valid_before.tzinfo)
                        days_remaining = (cert.not_valid_after - now).days
                        validation_result['days_remaining'] = days_remaining

                        # Check validity
                        if now >= cert.not_valid_before and now <= cert.not_valid_after:
                            validation_result['valid'] = True
                        else:
                            validation_result['warnings'].append('Certificate is not currently valid')

                        # Certificate fingerprint
                        fingerprint = cert.fingerprint(hashes.SHA256())
                        validation_result['fingerprint'] = fingerprint.hex()

                        # Key size
                        public_key = cert.public_key()
                        if isinstance(public_key, rsa.RSAPublicKey):
                            validation_result['key_size'] = public_key.key_size
                            if public_key.key_size < 2048:
                                validation_result['vulnerabilities'].append('RSA key size too small (< 2048 bits)')
                        elif isinstance(public_key, ec.EllipticCurvePublicKey):
                            validation_result['key_size'] = 'ECDSA'
                        elif isinstance(public_key, dsa.DSAPublicKey):
                            validation_result['key_size'] = 'DSA'

                        # Signature algorithm
                        validation_result['signature_algorithm'] = cert.signature_algorithm_oid._name

                        # Check for vulnerabilities
                        if cert.signature_algorithm_oid._name == 'sha1WithRSAEncryption':
                            validation_result['vulnerabilities'].append('Weak signature algorithm (SHA-1)')

                        # Check certificate expiration
                        if days_remaining < 30:
                            validation_result['warnings'].append(f'Certificate expires soon ({days_remaining} days)')
                        elif days_remaining < 0:
                            validation_result['vulnerabilities'].append('Certificate has expired')

                        # Store certificate info
                        self.certificates[domain] = validation_result

        except Exception as e:
            validation_result['error'] = str(e)
            validation_result['warnings'].append(f'Certificate validation failed: {str(e)}')

        # Cache the result
        self.cert_cache[cache_key] = {
            'timestamp': time.time(),
            'result': validation_result
        }

        return validation_result

    def analyze_encrypted_payload(self, packet_data: Dict) -> Dict:
        """Analyze encrypted payload patterns and potential issues"""
        analysis = {
            'packet_size': packet_data.get('size', 0),
            'protocol': packet_data.get('protocol', 'Unknown'),
            'anomalies': [],
            'security_issues': [],
            'recommendations': []
        }

        try:
            size = analysis['packet_size']

            # Check for unusual packet sizes in encrypted traffic
            if size > 1500:
                analysis['anomalies'].append('Oversized encrypted packet')
                analysis['security_issues'].append('Potential data exfiltration')

            # Check for very small encrypted packets
            if size < 100 and analysis['protocol'] in ['TLS', 'SSL']:
                analysis['anomalies'].append('Unusually small encrypted packet')

            # Check for heartbeat-like patterns (potential Heartbleed)
            if size == 16384 or size == 16385:  # Common Heartbleed sizes
                analysis['security_issues'].append('Potential Heartbleed attack pattern')
                analysis['recommendations'].append('Update OpenSSL to patched version')

            # Check for BEAST attack patterns (predictable IVs)
            if analysis['protocol'] == 'TLS 1.0':
                analysis['security_issues'].append('TLS 1.0 vulnerable to BEAST attack')
                analysis['recommendations'].append('Upgrade to TLS 1.2 or higher')

        except Exception as e:
            analysis['error'] = str(e)

        return analysis

    def check_ssl_vulnerabilities(self, domain: str) -> List[Dict]:
        """Check for common SSL/TLS vulnerabilities"""
        vulnerabilities = []

        try:
            # Test for POODLE (SSLv3 fallback)
            if self._test_sslv3_fallback(domain):
                vulnerabilities.append({
                    'vulnerability': 'POODLE',
                    'severity': 'High',
                    'description': 'SSLv3 fallback enabled, vulnerable to POODLE attack',
                    'cve': 'CVE-2014-3566',
                    'recommendations': ['Disable SSLv3', 'Use TLS 1.2 or higher']
                })

            # Test for Heartbleed
            if self._test_heartbleed(domain):
                vulnerabilities.append({
                    'vulnerability': 'Heartbleed',
                    'severity': 'Critical',
                    'description': 'OpenSSL Heartbleed vulnerability detected',
                    'cve': 'CVE-2014-0160',
                    'recommendations': ['Update OpenSSL immediately', 'Regenerate certificates']
                })

            # Test for CRIME attack
            if self._test_crime(domain):
                vulnerabilities.append({
                    'vulnerability': 'CRIME',
                    'severity': 'Medium',
                    'description': 'CRIME attack vulnerability (compression enabled)',
                    'cve': 'CVE-2012-4929',
                    'recommendations': ['Disable TLS compression']
                })

        except Exception as e:
            vulnerabilities.append({
                'vulnerability': 'Test Error',
                'severity': 'Unknown',
                'description': f'Error during vulnerability testing: {str(e)}'
            })

        return vulnerabilities

    def _test_sslv3_fallback(self, domain: str) -> bool:
        """Test for SSLv3 fallback vulnerability"""
        try:
            context = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE

            with socket.create_connection((domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock) as ssock:
                    return ssock.version() == 'SSLv3'
        except:
            return False

    def _test_heartbleed(self, domain: str) -> bool:
        """Test for Heartbleed vulnerability (simplified check)"""
        # This is a simplified check - real Heartbleed testing requires
        # sending malformed heartbeat requests
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    # Check OpenSSL version (simplified)
                    version = ssock.version()
                    # Heartbleed affected OpenSSL 1.0.1 - 1.0.1f
                    return False  # Simplified - would need more complex checking
        except:
            return False

    def _test_crime(self, domain: str) -> bool:
        """Test for CRIME vulnerability (compression)"""
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    # Check if compression is enabled
                    return hasattr(ssock, 'compression') and ssock.compression() is not None
        except:
            return False

    def get_encryption_report(self) -> Dict:
        """Generate comprehensive encryption analysis report"""
        report = {
            'generated_at': datetime.datetime.now(),
            'tls_versions_usage': self.encryption_stats['tls_versions'],
            'cipher_suites_usage': self.encryption_stats['cipher_suites'],
            'certificates_analyzed': len(self.certificates),
            'vulnerabilities_found': len(self.vulnerabilities),
            'handshake_failures': self.encryption_stats['handshake_failures'],
            'protocol_downgrades': self.encryption_stats['protocol_downgrades'],
            'recommendations': []
        }

        # Generate recommendations based on analysis
        if 'TLS 1.0' in self.encryption_stats['tls_versions'] or 'TLS 1.1' in self.encryption_stats['tls_versions']:
            report['recommendations'].append('Disable TLS 1.0 and TLS 1.1, upgrade to TLS 1.2 or higher')

        if 'SSLv3' in self.encryption_stats['tls_versions']:
            report['recommendations'].append('Disable SSLv3 immediately - vulnerable to POODLE attack')

        if self.encryption_stats['handshake_failures'] > 0:
            report['recommendations'].append('Investigate TLS handshake failures')

        return report


class EncryptionAnalyzer:
    """Main Encryption Analysis System"""

    def __init__(self):
        self.tls_analyzer = TLSAnalyzer()
        self.encrypted_traffic = []
        self.analysis_results = []
        self.monitoring_active = False
        self.cert_validation_cache = {}

    def analyze_packet(self, packet_data: Dict) -> Optional[Dict]:
        """Analyze a network packet for encryption-related information"""
        try:
            analysis_result = {
                'timestamp': datetime.datetime.now(),
                'packet_info': packet_data,
                'encryption_analysis': None,
                'certificate_info': None,
                'vulnerabilities': [],
                'security_score': 0
            }

            # Check if packet is encrypted (HTTPS/TLS)
            if self._is_encrypted_packet(packet_data):
                # Analyze TLS handshake
                tls_analysis = self.tls_analyzer.analyze_tls_handshake(packet_data)
                analysis_result['encryption_analysis'] = tls_analysis
                analysis_result['security_score'] = tls_analysis.get('security_score', 0)

                # Analyze encrypted payload
                payload_analysis = self.tls_analyzer.analyze_encrypted_payload(packet_data)
                analysis_result['payload_analysis'] = payload_analysis

                # If we have a server name, validate certificate
                server_name = tls_analysis.get('server_name')
                if server_name:
                    cert_info = self.tls_analyzer.validate_certificate(server_name)
                    analysis_result['certificate_info'] = cert_info

                    # Check for certificate-related vulnerabilities
                    if cert_info.get('days_remaining', 0) < 30:
                        analysis_result['vulnerabilities'].append({
                            'type': 'Certificate Expiring Soon',
                            'severity': 'Medium',
                            'description': f"Certificate for {server_name} expires in {cert_info['days_remaining']} days"
                        })

                # Check for SSL/TLS vulnerabilities
                if server_name:
                    ssl_vulns = self.tls_analyzer.check_ssl_vulnerabilities(server_name)
                    analysis_result['vulnerabilities'].extend(ssl_vulns)

                # Store encrypted traffic
                self.encrypted_traffic.append(analysis_result)
                self.analysis_results.append(analysis_result)

                return analysis_result

        except Exception as e:
            return {
                'timestamp': datetime.datetime.now(),
                'error': str(e),
                'packet_info': packet_data
            }

        return None

    def _is_encrypted_packet(self, packet_data: Dict) -> bool:
        """Determine if a packet contains encrypted traffic"""
        try:
            # Check destination port (common encrypted ports)
            dport = packet_data.get('dport', 0)
            if dport in [443, 8443, 465, 993, 995, 636, 989, 990]:
                return True

            # Check for TLS handshake markers in payload
            payload = packet_data.get('payload', b'')
            if isinstance(payload, str):
                payload = payload.encode('utf-8', errors='ignore')

            # TLS handshake starts with 0x16
            if len(payload) >= 3 and payload[0] == 0x16:
                return True

            # Check for SSL/TLS version markers
            if b'\x16\x03' in payload[:2]:  # TLS handshake
                return True

            return False

        except Exception:
            return False

    def get_encryption_summary(self) -> Dict:
        """Get summary of encryption analysis"""
        summary = {
            'total_encrypted_packets': len(self.encrypted_traffic),
            'tls_versions': {},
            'certificates_validated': len(self.tls_analyzer.certificates),
            'vulnerabilities_found': 0,
            'average_security_score': 0,
            'protocol_distribution': {}
        }

        total_score = 0
        valid_scores = 0

        for result in self.analysis_results:
            # Count TLS versions
            tls_analysis = result.get('encryption_analysis', {})
            tls_version = tls_analysis.get('tls_version')
            if tls_version:
                summary['tls_versions'][tls_version] = summary['tls_versions'].get(tls_version, 0) + 1

            # Count vulnerabilities
            vulnerabilities = result.get('vulnerabilities', [])
            summary['vulnerabilities_found'] += len(vulnerabilities)

            # Calculate average security score
            security_score = result.get('security_score', 0)
            if security_score > 0:
                total_score += security_score
                valid_scores += 1

        if valid_scores > 0:
            summary['average_security_score'] = total_score / valid_scores

        return summary

    def export_encryption_report(self, filename: str = None) -> str:
        """Export comprehensive encryption analysis report"""
        if not filename:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"encryption_analysis_report_{timestamp}.json"

        report = {
            'export_time': datetime.datetime.now().isoformat(),
            'summary': self.get_encryption_summary(),
            'detailed_analysis': self.analysis_results,
            'certificates': self.tls_analyzer.certificates,
            'vulnerabilities': self.tls_analyzer.vulnerabilities,
            'encryption_stats': self.tls_analyzer.encryption_stats
        }

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False, default=str)
            return filename
        except Exception as e:
            return f"Error exporting report: {e}"

    def validate_domain_certificate(self, domain: str) -> Dict:
        """Validate SSL certificate for a specific domain"""
        return self.tls_analyzer.validate_certificate(domain)

    def check_domain_vulnerabilities(self, domain: str) -> List[Dict]:
        """Check SSL/TLS vulnerabilities for a domain"""
        return self.tls_analyzer.check_ssl_vulnerabilities(domain)


# Integration functions
def initialize_encryption_analyzer() -> EncryptionAnalyzer:
    """Initialize encryption analysis system"""
    return EncryptionAnalyzer()

def analyze_encrypted_packet(packet_data: Dict) -> Optional[Dict]:
    """Analyze a single encrypted packet"""
    analyzer = EncryptionAnalyzer()
    return analyzer.analyze_packet(packet_data)

def get_encryption_security_report() -> Dict:
    """Get encryption security report"""
    analyzer = EncryptionAnalyzer()
    # In a real implementation, this would analyze stored traffic
    return analyzer.get_encryption_summary()

def validate_ssl_certificate(domain: str) -> Dict:
    """Validate SSL certificate for a domain"""
    analyzer = EncryptionAnalyzer()
    return analyzer.validate_domain_certificate(domain)
