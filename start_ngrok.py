"""
Start ngrok tunnel to expose local Flask server to the internet.
Run this while your Flask server is running on port 5000.
"""

from pyngrok import ngrok
import time

print("=" * 60)
print(" Starting ngrok tunnel...")
print("=" * 60)

# Start tunnel to port 5000
public_url = ngrok.connect(5000, "http")

print(f"\n✅ Your local server is now PUBLIC!")
print(f"🔗 Public URL: {public_url}")
print(f"\n📋 Add this to Render Environment Variables:")
print(f"   FLASK_API_URL={public_url}")
print(f"\n⚠️  Keep this window open! Closing it will stop the tunnel.")
print(f"   Press CTRL+C to stop\n")

# Keep running
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n🛑 Stopping ngrok tunnel...")
    ngrok.kill()
    print("Done!")

