from flask import Flask, render_template, request, session, redirect, url_for, jsonify

app = Flask(__name__)
app.secret_key = 'secure_city_iq_secret_key' 

# بيانات الدخول التي طلبتها
ADMIN_USER = "admin"
ADMIN_PASS = "1234"

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
        if username == ADMIN_USER and password == ADMIN_PASS:
            session['logged_in'] = True
            return redirect(url_for('demo'))
        else:
            return render_template('login.html', error='بيانات الدخول غير صحيحة')
    return render_template('login.html')

@app.route('/demo') # هذا هو المسار الذي يحتوي على كودك الاحترافي
def demo():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('demo.html')

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

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)