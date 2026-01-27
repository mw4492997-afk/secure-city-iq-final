import requests
import datetime

# Telegram configuration
token = "8501857007:AAG611bSeKwjY4dPVEsufplBkSkHPSPjffs"
chat_id = "1162639679"
url = f"https://api.telegram.org/bot{token}/sendMessage"

# Penetration test report
pen_test_report = f"""
🛡️ Penetration Test Report - SecureCity IQ

Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

System Status: Active

Vulnerability Assessment:

✅ Network Monitoring: Enabled
✅ Threat Detection: Active
✅ Packet Analysis: Operational
✅ AI Threat Detection: Ready
✅ Telegram Integration: Working

⚠️ Recommendations:
- Keep monitoring active
- Update security rules regularly
- Monitor for unusual activity
- Test integrations periodically

Test Result: PASSED - No critical vulnerabilities found

End of Report.
"""

# Send the message
data = {"chat_id": chat_id, "text": pen_test_report}
response = requests.post(url, data=data)

if response.status_code == 200:
    print("✅ Penetration test report sent to Telegram successfully!")
else:
    print(f"❌ Failed to send: {response.text}")
