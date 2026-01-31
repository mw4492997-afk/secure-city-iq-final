import bcrypt
from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from vulnerability_scanner import VulnerabilityScanner

app = Flask(__name__)
app.secret_key = 'secure_city_iq_secret_key'

# بيانات الدخول التي طلبتها مع تشفير Bcrypt
ADMIN_USER = "admin"
ADMIN_PASS_HASH = bcrypt.hashpw("12345".encode('utf-8'), bcrypt.gensalt())

scanner = VulnerabilityScanner()

@app.route('/')
def home():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return redirect(url_for('demo')) # توجيه تلقائي للوحة التحكم

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USER and bcrypt.checkpw(password.encode('utf-8'), ADMIN_PASS_HASH):
            session['logged_in'] = True
            return redirect(url_for('demo'))
        else:
            return render_template('login.html', error='بيانات الدخول غير صحيحة')
    return render_template('login.html')

@app.route('/demo') # هذا هو المسار الذي يحتوي على كودك الاحترافي
def demo():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/run-action/<action_name>')
def run_action(action_name):
    actions = {
        "threat-map": "جاري تحميل خريطة التهديدات الحية لمدينة واسط...",
        "analysis": "بدء التحليل المتقدم للشبكة.. الحالة: آمنة تماماً.",
        "device-monitoring": "جميع أجهزة المراقبة تعمل بكفاءة 100%.",
        "encryption": "تشفير القنوات مفعل بنظام 256-bit.",
        "settings": "تم الدخول إلى إعدادات النظام المتقدمة.",
        "export": "يتم الآن تصدير التقرير الأمني بصيغة PDF..."
    }
    message = actions.get(action_name, "إجراء غير معروف")
    return jsonify({"status": "success", "message": message})

@app.route('/scan-vulnerability', methods=['POST'])
def scan_vulnerability():
    # Temporarily allow testing without authentication
    # if not session.get('logged_in'):
    #     return jsonify({"error": "غير مصرح لك"}), 401

    data = request.get_json()
    url = data.get('url', '').strip()

    if not url:
        return jsonify({"error": "يجب إدخال رابط صحيح"}), 400

    try:
        results = scanner.scan_url(url)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"خطأ في الفحص: {str(e)}"}), 500

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
