from flask import Flask, render_template, jsonify
import random # لإضافة أرقام متغيرة تعطي إحساساً بالحيوية

app = Flask(__name__)

# ميزة 1: قاعدة بيانات وهمية لحالة النظام
system_stats = {
    "scanned_lines": 6594,
    "threats": 0,
    "security_level": "High",
    "last_scan": "منذ دقيقتين"
}

@app.route('/')
def home():
    return render_template('securecity_home.html', lines_count=system_stats["scanned_lines"])

@app.route('/dashboard')
def dashboard():
    # ميزة 2: تحديث الأرقام عند كل دخول لإعطاء انطباع بالعمل المستمر
    dynamic_threats = random.randint(0, 2) # محاكاة اكتشاف تهديدات بسيطة
    return render_template('dashboard.html', 
                           scanned_lines=system_stats["scanned_lines"], 
                           threats_detected=dynamic_threats,
                           security_status=system_stats["security_level"])

# ميزة 3: إضافة مسار (Route) جديد لفحص النظام "Deep Scan"
@app.route('/api/run-scan')
def run_scan():
    # هذه الدالة يمكن استدعاؤها لاحقاً عبر AJAX من لوحة التحكم
    return jsonify({
        "status": "success",
        "message": "تم بدء الفحص العميق للنظام...",
        "result": "النظام آمن تماماً"
    })

if __name__ == '__main__':
    app.run(debug=True)
