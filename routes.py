from flask import Flask, render_template, request, session, redirect, url_for, jsonify

# Create Flask app
app = Flask(__name__)

@app.route('/')
def home():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    try:
        with open(__file__, 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except:
        lines_count = "6702"

    return render_template('securecity_home.html', lines_count=lines_count)

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
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', scanned_lines=6700, threats=0)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
