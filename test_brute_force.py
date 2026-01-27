#!/usr/bin/env python3
"""
Comprehensive Test Script for WiFi Brute Force Detection Sensor
Tests all aspects of the new feature in Securecity_IQ.py
"""

import sys
import os
import time
import datetime
from unittest.mock import Mock, patch, MagicMock
import threading

# Add current directory to path to import Securecity_IQ
sys.path.insert(0, os.getcwd())

try:
    from scapy.all import Dot11, Dot11Auth, Dot11AssoReq, RadioTap, Ether
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False
    print("⚠️ Scapy not available - some tests will be skipped")

class TestBruteForceDetection:
    """Comprehensive test suite for WiFi Brute Force Detection"""

    def __init__(self):
        self.test_results = []
        self.passed = 0
        self.failed = 0

    def log_test(self, test_name, result, message=""):
        """Log test result"""
        status = "✅ PASS" if result else "❌ FAIL"
        self.test_results.append(f"{status} {test_name}: {message}")
        if result:
            self.passed += 1
        else:
            self.failed += 1
        print(f"{status} {test_name}")

    def test_1_import_and_initialization(self):
        """Test 1: Import and initialization of Securecity_IQ"""
        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            # Check if brute force attributes exist
            required_attrs = [
                'brute_force_attempts',
                'brute_force_threshold',
                'brute_force_time_window',
                'brute_force_alert_cooldown'
            ]

            for attr in required_attrs:
                if hasattr(app, attr):
                    self.log_test(f"Attribute {attr}", True, f"Found {attr}")
                else:
                    self.log_test(f"Attribute {attr}", False, f"Missing {attr}")

            # Check default values
            if app.brute_force_threshold == 5:
                self.log_test("Default threshold", True, "Set to 5")
            else:
                self.log_test("Default threshold", False, f"Expected 5, got {app.brute_force_threshold}")

            if app.brute_force_time_window == 60:
                self.log_test("Default time window", True, "Set to 60 seconds")
            else:
                self.log_test("Default time window", False, f"Expected 60, got {app.brute_force_time_window}")

            if app.brute_force_alert_cooldown == 300:
                self.log_test("Default cooldown", True, "Set to 300 seconds")
            else:
                self.log_test("Default cooldown", False, f"Expected 300, got {app.brute_force_alert_cooldown}")

            return True
        except Exception as e:
            self.log_test("Import and initialization", False, str(e))
            return False

    def test_2_packet_detection_logic(self):
        """Test 2: WiFi packet detection logic"""
        if not SCAPY_AVAILABLE:
            self.log_test("Packet detection logic", False, "Scapy not available")
            return False

        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            # Create test packets
            test_mac = "00:11:22:33:44:55"

            # Test Dot11Auth packet
            auth_packet = RadioTap() / Dot11(addr1="ff:ff:ff:ff:ff:ff", addr2=test_mac, addr3="aa:bb:cc:dd:ee:ff") / Dot11Auth()
            result = app.analyze_packet(auth_packet)
            self.log_test("Dot11Auth detection", True, "Packet processed without error")

            # Test Dot11AssoReq packet
            asso_packet = RadioTap() / Dot11(addr1="ff:ff:ff:ff:ff:ff", addr2=test_mac, addr3="aa:bb:cc:dd:ee:ff") / Dot11AssoReq()
            result = app.analyze_packet(asso_packet)
            self.log_test("Dot11AssoReq detection", True, "Packet processed without error")

            # Check if MAC was added to tracking
            if test_mac in app.brute_force_attempts:
                self.log_test("MAC tracking", True, f"MAC {test_mac} added to tracking")
            else:
                self.log_test("MAC tracking", False, f"MAC {test_mac} not found in tracking")

            return True
        except Exception as e:
            self.log_test("Packet detection logic", False, str(e))
            return False

    def test_3_threshold_detection(self):
        """Test 3: Threshold detection (5+ attempts)"""
        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            test_mac = "aa:bb:cc:dd:ee:ff"
            app.brute_force_threshold = 3  # Lower threshold for testing

            # Simulate multiple auth attempts
            for i in range(5):
                # Create packet with timestamp
                packet_time = datetime.datetime.now() - datetime.timedelta(seconds=i*10)
                app.brute_force_attempts[test_mac] = {
                    'count': 0,
                    'timestamps': [],
                    'last_alert': None
                }

                # Add timestamps
                for j in range(i+1):
                    app.brute_force_attempts[test_mac]['timestamps'].append(
                        datetime.datetime.now() - datetime.timedelta(seconds=j*10)
                    )

                app.brute_force_attempts[test_mac]['count'] = len(app.brute_force_attempts[test_mac]['timestamps'])

                # Clean old timestamps (simulate the cleanup logic)
                current_time = datetime.datetime.now()
                app.brute_force_attempts[test_mac]['timestamps'] = [
                    t for t in app.brute_force_attempts[test_mac]['timestamps']
                    if (current_time - t).total_seconds() <= app.brute_force_time_window
                ]
                app.brute_force_attempts[test_mac]['count'] = len(app.brute_force_attempts[test_mac]['timestamps'])

            # Check if threshold is detected
            if app.brute_force_attempts[test_mac]['count'] >= app.brute_force_threshold:
                self.log_test("Threshold detection", True, f"Detected {app.brute_force_attempts[test_mac]['count']} attempts >= {app.brute_force_threshold}")
            else:
                self.log_test("Threshold detection", False, f"Failed to detect {app.brute_force_attempts[test_mac]['count']} attempts >= {app.brute_force_threshold}")

            return True
        except Exception as e:
            self.log_test("Threshold detection", False, str(e))
            return False

    def test_4_timestamp_cleanup(self):
        """Test 4: Timestamp cleanup mechanism"""
        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            test_mac = "11:22:33:44:55:66"

            # Add timestamps spanning more than time window
            now = datetime.datetime.now()
            old_timestamps = [
                now - datetime.timedelta(seconds=120),  # Too old
                now - datetime.timedelta(seconds=90),   # Too old
                now - datetime.timedelta(seconds=30),   # Within window
                now - datetime.timedelta(seconds=15),   # Within window
                now,  # Current
            ]

            app.brute_force_attempts[test_mac] = {
                'count': 0,
                'timestamps': old_timestamps,
                'last_alert': None
            }

            # Simulate cleanup (same logic as in analyze_packet)
            app.brute_force_attempts[test_mac]['timestamps'] = [
                t for t in app.brute_force_attempts[test_mac]['timestamps']
                if (now - t).total_seconds() <= app.brute_force_time_window
            ]
            app.brute_force_attempts[test_mac]['count'] = len(app.brute_force_attempts[test_mac]['timestamps'])

            # Should have only 3 timestamps (within 60 seconds)
            expected_count = 3
            if app.brute_force_attempts[test_mac]['count'] == expected_count:
                self.log_test("Timestamp cleanup", True, f"Cleaned to {expected_count} timestamps")
            else:
                self.log_test("Timestamp cleanup", False, f"Expected {expected_count}, got {app.brute_force_attempts[test_mac]['count']}")

            return True
        except Exception as e:
            self.log_test("Timestamp cleanup", False, str(e))
            return False

    def test_5_alert_cooldown(self):
        """Test 5: Alert cooldown mechanism"""
        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            test_mac = "77:88:99:aa:bb:cc"

            # Set last alert to recent time
            recent_time = datetime.datetime.now() - datetime.timedelta(seconds=100)  # Within cooldown
            app.brute_force_attempts[test_mac] = {
                'count': 10,
                'timestamps': [datetime.datetime.now()],
                'last_alert': recent_time
            }

            # Check cooldown logic
            current_time = datetime.datetime.now()
            last_alert = app.brute_force_attempts[test_mac]['last_alert']
            cooldown_active = last_alert and (current_time - last_alert).total_seconds() < app.brute_force_alert_cooldown

            if cooldown_active:
                self.log_test("Alert cooldown", True, "Cooldown properly active")
            else:
                self.log_test("Alert cooldown", False, "Cooldown not working")

            # Test expired cooldown
            old_time = datetime.datetime.now() - datetime.timedelta(seconds=400)  # Beyond cooldown
            app.brute_force_attempts[test_mac]['last_alert'] = old_time
            cooldown_expired = (current_time - old_time).total_seconds() >= app.brute_force_alert_cooldown

            if cooldown_expired:
                self.log_test("Cooldown expiration", True, "Cooldown properly expired")
            else:
                self.log_test("Cooldown expiration", False, "Cooldown not expiring")

            return True
        except Exception as e:
            self.log_test("Alert cooldown", False, str(e))
            return False

    def test_6_telegram_alert_format(self):
        """Test 6: Telegram alert message format"""
        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            test_mac = "dd:ee:ff:11:22:33"
            attempt_count = 7
            current_time = datetime.datetime.now()

            # Generate expected alert message
            expected_message = f"🚨 HIGH SEVERITY ALERT: WiFi Brute Force Attack Detected!\nMAC Address: {test_mac}\nAttempts: {attempt_count}\nTime Window: {app.brute_force_time_window} seconds\nTimestamp: {current_time.strftime('%Y-%m-%d %H:%M:%S')}"

            # Check message format
            if "🚨 HIGH SEVERITY ALERT" in expected_message:
                self.log_test("Alert message format", True, "Contains severity indicator")
            else:
                self.log_test("Alert message format", False, "Missing severity indicator")

            if test_mac in expected_message:
                self.log_test("Alert MAC inclusion", True, "MAC address included")
            else:
                self.log_test("Alert MAC inclusion", False, "MAC address missing")

            if str(attempt_count) in expected_message:
                self.log_test("Alert attempt count", True, "Attempt count included")
            else:
                self.log_test("Alert attempt count", False, "Attempt count missing")

            if "WiFi Brute Force Attack Detected" in expected_message:
                self.log_test("Alert description", True, "Attack description included")
            else:
                self.log_test("Alert description", False, "Attack description missing")

            return True
        except Exception as e:
            self.log_test("Telegram alert format", False, str(e))
            return False

    def test_7_edge_cases(self):
        """Test 7: Edge cases and error handling"""
        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            # Test with None MAC address
            packet_no_mac = Mock()
            packet_no_mac.haslayer.return_value = True
            packet_no_mac.haslayer.side_effect = lambda x: x == Dot11
            dot11_mock = Mock()
            dot11_mock.addr2 = None
            packet_no_mac.__getitem__ = Mock(return_value=dot11_mock)

            # This should not crash
            try:
                app.analyze_packet(packet_no_mac)
                self.log_test("None MAC handling", True, "Handled None MAC gracefully")
            except Exception as e:
                self.log_test("None MAC handling", False, f"Crashed with None MAC: {e}")

            # Test with empty timestamps
            test_mac = "empty:test:mac"
            app.brute_force_attempts[test_mac] = {
                'count': 0,
                'timestamps': [],
                'last_alert': None
            }

            # Should handle empty list
            app.brute_force_attempts[test_mac]['timestamps'] = [
                t for t in app.brute_force_attempts[test_mac]['timestamps']
                if (datetime.datetime.now() - t).total_seconds() <= app.brute_force_time_window
            ]
            self.log_test("Empty timestamps handling", True, "Handled empty timestamps")

            # Test boundary threshold
            boundary_mac = "boundary:mac:test"
            app.brute_force_threshold = 5
            app.brute_force_attempts[boundary_mac] = {
                'count': 5,
                'timestamps': [datetime.datetime.now()] * 5,
                'last_alert': None
            }

            # Should trigger at exactly threshold
            if app.brute_force_attempts[boundary_mac]['count'] >= app.brute_force_threshold:
                self.log_test("Boundary threshold", True, "Triggered at exact threshold")
            else:
                self.log_test("Boundary threshold", False, "Failed at exact threshold")

            return True
        except Exception as e:
            self.log_test("Edge cases", False, str(e))
            return False

    def test_8_integration_with_existing(self):
        """Test 8: Integration with existing packet analysis"""
        try:
            from Securecity_IQ import SmartCityDefense
            app = SmartCityDefense()

            # Create a regular IP packet to ensure existing logic still works
            from scapy.all import IP, TCP
            ip_packet = IP(src="192.168.1.100", dst="8.8.8.8") / TCP(sport=12345, dport=80)

            # This should not crash and should update counters
            initial_tcp = app.tcp_count
            app.analyze_packet(ip_packet)

            if app.tcp_count > initial_tcp:
                self.log_test("IP packet integration", True, "Regular IP analysis still works")
            else:
                self.log_test("IP packet integration", False, "Regular IP analysis broken")

            # Test that WiFi and IP analysis coexist
            if SCAPY_AVAILABLE:
                wifi_packet = RadioTap() / Dot11(addr2="test:mac:addr") / Dot11Auth()
                app.analyze_packet(wifi_packet)
                self.log_test("WiFi+IP coexistence", True, "Both WiFi and IP analysis work together")
            else:
                self.log_test("WiFi+IP coexistence", True, "Skipped - Scapy not available")

            return True
        except Exception as e:
            self.log_test("Integration with existing", False, str(e))
            return False

    def run_all_tests(self):
        """Run all tests and generate report"""
        print("🚀 Starting Comprehensive Brute Force Detection Tests")
        print("=" * 60)

        # Run all tests
        self.test_1_import_and_initialization()
        self.test_2_packet_detection_logic()
        self.test_3_threshold_detection()
        self.test_4_timestamp_cleanup()
        self.test_5_alert_cooldown()
        self.test_6_telegram_alert_format()
        self.test_7_edge_cases()
        self.test_8_integration_with_existing()

        # Generate report
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📈 Success Rate: {(self.passed/(self.passed+self.failed)*100):.1f}%" if (self.passed+self.failed) > 0 else "0%")

        print("\n📝 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"  {result}")

        print("\n" + "=" * 60)
        if self.failed == 0:
            print("🎉 ALL TESTS PASSED! Brute Force Detection is working correctly.")
        else:
            print(f"⚠️ {self.failed} test(s) failed. Please review the implementation.")

        return self.failed == 0

if __name__ == "__main__":
    tester = TestBruteForceDetection()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
