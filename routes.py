from flask import Flask, render_template

# إنشاء تطبيق Flask
app = Flask(name)

@app.route('/')
def home():
    # الصفحة الرئيسية التي تظهر فيها "دخول لوحة التحكم"
    return render_template('securecity_home.html', lines_count=6700)

@app.route('/dashboard')
def dashboard():
    # هذا السطر هو الذي سيقتل الشاشة البيضاء ويستدعي الأزرار الأربعة
    return render_template('dashboard.html', scanned_lines=6700, threats_detected=0)

if name == 'main':
    app.run(debug=True)
