from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# بيانات الدخول (يمكنك تعديلها)
USER = "admin"
PASS = "1234"

@app.route('/')
def home():
    # عند فتح الموقع يظهر تسجيل الدخول
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    if username == USER and password == PASS:
        return redirect(url_for('dashboard'))
    else:
        return render_template('login.html', error="البيانات غير صحيحة!")

@app.route('/dashboard')
def dashboard():
    # سيعرض ملف demo.html الذي يحتوي على الرسوم البيانية
    return render_template('demo.html')

if __name__ == '__main__':
    app.run(debug=True)
