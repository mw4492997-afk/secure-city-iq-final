#!/usr/bin/env python3
"""
Simple test to check if basic imports work
"""

print("Testing basic imports...")

try:
    import sys
    print("✅ sys imported")
except Exception as e:
    print(f"❌ sys import failed: {e}")

try:
    import os
    print("✅ os imported")
except Exception as e:
    print(f"❌ os import failed: {e}")

try:
    import json
    print("✅ json imported")
except Exception as e:
    print(f"❌ json import failed: {e}")

try:
    import datetime
    print("✅ datetime imported")
except Exception as e:
    print(f"❌ datetime import failed: {e}")

try:
    import flask
    print("✅ flask imported")
except Exception as e:
    print(f"❌ flask import failed: {e}")

try:
    import psutil
    print("✅ psutil imported")
except Exception as e:
    print(f"❌ psutil import failed: {e}")

try:
    import platform
    print("✅ platform imported")
except Exception as e:
    print(f"❌ platform import failed: {e}")

try:
    import sqlite3
    print("✅ sqlite3 imported")
except Exception as e:
    print(f"❌ sqlite3 import failed: {e}")

print("Basic imports test completed.")
