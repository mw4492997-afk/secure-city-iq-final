from flask import Flask, render_template
from routes import app as routes_app
from security_core import SecurityCore
from logic import GUILogic

# Initialize the main Flask app
app = routes_app

# Initialize security core and GUI logic
security_core = SecurityCore()
gui_logic = GUILogic()

@app.route('/')
def home():
    try:
        with open('Securecity_IQ_fixed.py', 'r', encoding='utf-8') as f:
            lines_count = len(f.readlines())
    except:
        lines_count = "6702"

    return render_template('securecity_home.html', lines_count=lines_count)

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Additional routes can be added here if needed

if __name__ == '__main__':
    app.run(debug=True)
