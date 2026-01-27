from flask import Flask, render_template
from routes import app as routes_app
from security_core import SecurityCore
from logic import GUILogic

# Initialize the main Flask app
app = routes_app

# Initialize security core and GUI logic
security_core = SecurityCore()
gui_logic = GUILogic()

# Additional routes can be added here if needed

if __name__ == '__main__':
    app.run(debug=True)
