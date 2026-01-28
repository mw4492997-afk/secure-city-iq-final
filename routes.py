from flask import Flask, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)

# بيانات الدخول الأصلية
ADMIN_USER = "admin"
ADMIN_PASS = "1234"

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    if request.form.get('username') == ADMIN_USER and request.form.get('password') == ADMIN_PASS:
        return redirect(url_for('dashboard'))
    return render_template('login.html', error="بيانات خاطئة")

@app.route('/dashboard')
def dashboard():
    return render_template('demo.html')

# --- تفعيل وظائف الأزرار ---

@app.route('/run-action/<action_name>')
def run_action(action_name):
    # هنا نحدد الرد لكل زر عند تفعيله
    actions = {
        "map": "جاري تحميل خريطة التهديدات الحية للمدينة...",
        "analyze": "بدء التحليل المتقدم للشبكة.. لا يوجد اختراقات حالياً.",
        "monitor": "جميع الأجهزة المتصلة تحت المراقبة الآمنة.",
        "export": "يتم الآن إعداد التقرير الأمني بصيغة PDF..."
    }
    message = actions.get(action_name, "إجراء غير معروف")
    return jsonify({"status": "success", "message": message})

if __name__ == '__main__':
    app.run(debug=True)
