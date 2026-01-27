from flask import Flask, render_template

# Create Flask app
app = Flask(name)

@app.route('/')
def home():
    try:
        # تأكد من تعريف مسار الملف بشكل صحيح أو استخدم قيمة افتراضية
        lines_count = 6700
    except:
        lines_count = "6702"
    return render_template('securecity_home.html', lines_count=lines_count)

@app.route('/dashboard')
def dashboard():
    # هنا قمنا بحذف النص اليدوي وربطنا الصفحة بملف القالب الجديد
    # المتغيرات هنا هي التي ستظهر داخل الأزرار (Cards)
    return render_template('dashboard.html', scanned_lines=6700, threats_detected=0)

if name == 'main':
    app.run(debug=True)
