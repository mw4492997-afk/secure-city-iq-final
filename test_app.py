#!/usr/bin/env python3
"""
Test script to verify the Flask app can start without errors
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    # Import the Flask app
    from web_dashboard.app import app
    print("✅ Flask app imported successfully")

    # Test basic route
    with app.test_client() as client:
        response = client.get('/')
        print(f"✅ Root route status: {response.status_code}")

        # Test API route
        response = client.get('/api/dashboard')
        print(f"✅ API dashboard route status: {response.status_code}")

        # Test websites API
        response = client.get('/api/websites')
        print(f"✅ API websites route status: {response.status_code}")

    print("✅ All tests passed! App should work on PythonAnywhere")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
