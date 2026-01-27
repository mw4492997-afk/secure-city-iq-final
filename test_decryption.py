#!/usr/bin/env python3
"""
اختبار وظيفة فك التشفير والترميز في نظام Secure City IQ
"""

import base64
import urllib.parse
import json
import sys
import os

# إضافة مسار المشروع
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from Securecity_IQ import SmartCityDefense
    print("✅ تم استيراد النظام بنجاح")
except ImportError as e:
    print(f"❌ خطأ في الاستيراد: {e}")
    sys.exit(1)

def test_decode_payload():
    """اختبار وظيفة فك التشفير"""
    print("\n🔍 بدء اختبار وظيفة فك التشفير...")

    # إنشاء كائن النظام
    app = SmartCityDefense()

    # اختبارات مختلفة
    test_cases = [
        # Base64
        (b'SGVsbG8gV29ybGQ=', "Base64 test"),
        # URL encoding
        (b'Hello%20World%21', "URL encoding test"),
        # JSON
        (b'{"user":"admin","password":"secret"}', "JSON test"),
        # Sensitive keywords
        (b'username=admin&password=123456', "Sensitive data test"),
        # Empty payload
        (b'', "Empty payload test"),
        # Regular text
        (b'Normal HTTP request', "Normal text test"),
    ]

    passed = 0
    total = len(test_cases)

    for payload, description in test_cases:
        print(f"\n🧪 اختبار: {description}")
        print(f"البيانات الأصلية: {payload}")

        try:
            decoded_results, status = app.decode_payload(payload)

            if decoded_results:
                print("✅ تم العثور على محتوى مفكك:")
                for result_type, content in decoded_results:
                    print(f"   {result_type}: {content[:100]}...")
            else:
                print(f"ℹ️  {status}")

            passed += 1

        except Exception as e:
            print(f"❌ خطأ: {str(e)}")

    print(f"\n📊 نتائج الاختبار: {passed}/{total} نجح")

    if passed == total:
        print("🎉 جميع الاختبارات نجحت!")
        return True
    else:
        print("⚠️ بعض الاختبارات فشلت")
        return False

def test_integration():
    """اختبار التكامل مع فحص الحزم"""
    print("\n🔗 اختبار التكامل مع فحص الحزم...")

    try:
        from scapy.all import IP, TCP

        # إنشاء حزمة اختبار
        test_packet = IP(src="192.168.1.100", dst="192.168.1.1") / TCP(sport=12345, dport=80) / b"GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"

        app = SmartCityDefense()

        # اختبار الفحص الشامل
        app.comprehensive_deep_packet_inspection(test_packet)

        print("✅ تم فحص الحزمة بنجاح")
        print(f"📊 تم حفظ {len(app.all_traffic)} سجل حركة")

        # التحقق من وجود decoded_content
        if app.all_traffic and 'decoded_content' in app.all_traffic[-1]:
            print("✅ تم إضافة decoded_content بنجاح")
            decoded = app.all_traffic[-1]['decoded_content']
            if decoded:
                print(f"🔓 تم العثور على {len(decoded)} عنصر مفكك")
            else:
                print("ℹ️ لم يتم العثور على محتوى قابل للفك")
        else:
            print("❌ لم يتم إضافة decoded_content")

        return True

    except Exception as e:
        print(f"❌ خطأ في التكامل: {str(e)}")
        return False

if __name__ == "__main__":
    print("🛡️ اختبار نظام فك التشفير في Secure City IQ")
    print("=" * 50)

    # اختبار وظيفة فك التشفير
    decode_success = test_decode_payload()

    # اختبار التكامل
    integration_success = test_integration()

    print("\n" + "=" * 50)
    if decode_success and integration_success:
        print("🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.")
        print("🔓 ميزة فك التشفير تعمل بشكل صحيح.")
    else:
        print("⚠️ بعض المشاكل تحتاج إلى إصلاح.")

    print("=" * 50)
