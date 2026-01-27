#!/usr/bin/env python
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask application
from web_dashboard.app import app as application

if __name__ == '__main__':
    application.run()
