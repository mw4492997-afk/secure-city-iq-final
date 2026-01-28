from flask import Flask, render_template, request, redirect, url_for, jsonify
>>>>>>> aa92acbbca02eec1b67919b785c79cc3144cd25c

app = Flask(__name__)

# بيانات الدخول الأصلية
ADMIN_USER = "admin"
ADMIN_PASS = "1234"

@app.route('/')
def home():
<<<<<<< HEAD
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    try:
        with open(__file__, 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except:
        lines_count = "6702"
=======
    return render_template('login.html')
>>>>>>> aa92acbbca02eec1b67919b785c79cc3144cd25c

@app.route('/login', methods=['POST'])
def login():
    if request.form.get('username') == ADMIN_USER and request.form.get('password') == ADMIN_PASS:
        return redirect(url_for('dashboard'))
    return render_template('login.html', error="بيانات خاطئة")

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == 'admin' and password == 'Admin123':
            session['logged_in'] = True
            return redirect(url_for('home'))
        else:
            return render_template('login.html', error='بيانات الدخول غير صحيحة')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
<<<<<<< HEAD
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', scanned_lines=6700, threats=0)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))
=======
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
>>>>>>> aa92acbbca02eec1b67919b785c79cc3144cd25c

if __name__ == '__main__':
    app.run(debug=True)
=======
from flask import Flask, render_template, request, session, redirect, url_for, jsonify

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Add a secret key for session management

# بيانات الدخول الأصلية
ADMIN_USER = "admin"
ADMIN_PASS = "Admin123"

@app.route('/')
def home():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    try:
        with open(__file__, 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except:
        lines_count = "6702"
    return render_template('home.html', lines_count=lines_count)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USER and password == ADMIN_PASS:
            session['logged_in'] = True
            return redirect(url_for('home'))
        else:
            return render_template('login.html', error='بيانات الدخول غير صحيحة')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', scanned_lines=6700, threats=0)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))

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
=======
from flask import Flask, render_template, request, redirect, url_for, jsonify
>>>>>>> aa92acbbca02eec1b67919b785c79cc3144cd25c

app = Flask(__name__)

# بيانات الدخول الأصلية
ADMIN_USER = "admin"
ADMIN_PASS = "1234"

@app.route('/')
def home():
<<<<<<< HEAD
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    try:
        with open(__file__, 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except:
        lines_count = "6702"
=======
    return render_template('login.html')
>>>>>>> aa92acbbca02eec1b67919b785c79cc3144cd25c

@app.route('/login', methods=['POST'])
def login():
    if request.form.get('username') == ADMIN_USER and request.form.get('password') == ADMIN_PASS:
        return redirect(url_for('dashboard'))
    return render_template('login.html', error="بيانات خاطئة")

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == 'admin' and password == 'Admin123':
            session['logged_in'] = True
            return redirect(url_for('home'))
        else:
            return render_template('login.html', error='بيانات الدخول غير صحيحة')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
<<<<<<< HEAD
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', scanned_lines=6700, threats=0)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))
=======
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
>>>>>>> aa92acbbca02eec1b67919b785c79cc3144cd25c

if __name__ == '__main__':
    app.run(debug=True)
