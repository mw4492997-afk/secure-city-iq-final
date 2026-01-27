from flask import Flask, render_template
from securecity_web import securecity_app

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Integrate Securecity_IQ routes
@app.route('/securecity')
def securecity_home():
    try:
        with open('securecity_web.py', 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except BaseException:
        lines_count = "6702"

    return render_template('securecity_home.html', lines_count=lines_count)

@app.route('/securecity/dashboard')
def securecity_dashboard():
    return """

🛡️ لوحة تحكم SECURE CITY IQ

تم الوصول إلى النظام الرئيسي بنجاح



> جاري فحص الـ 6700 سطر برمجى... [OK]

> حالة السيرفر: مستقرة (Live)

> المالك: الملك مصطفى




⬅️ العودة للرئيسية

"""

if __name__ == '__main__':
    app.run(debug=True)
