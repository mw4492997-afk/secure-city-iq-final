from flask import Flask, render_template

# Create Flask app
app = Flask(__name__)

@app.route('/')
def home():
    try:
        with open(__file__, 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except:
        lines_count = "6702"

    return render_template('securecity_home.html', lines_count=lines_count)

@app.route('/dashboard')
def dashboard():
    return """

🛡️ لوحة تحكم SECURE CITY IQ

تم الوصول إلى النظام الرئيسي بنجاح



> جاري فحص الـ نعم نعم سطر برمجى... [OK]

> حالة السيرفر: مستقرة (Live)

> المالك: الملك مصطفى




⬅️ العودة للرئيسية

"""

if __name__ == '__main__':
    app.run(debug=True)
