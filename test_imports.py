import sys
import traceback

libraries = [
    'flask',
    'customtkinter',
    'scapy',
    'requests',
    'PIL',  # pillow is imported as PIL
    'pyautogui',
    'telegram',  # python-telegram-bot is imported as telegram
    'slack_sdk',
    'discord',
    'facebook',  # facebook-sdk is imported as facebook
    'pytest',
    'psutil',
    'pandas',
    'numpy',
    'sklearn',
    'tensorflow',
    'joblib'
]

failed_imports = []

for lib in libraries:
    try:
        __import__(lib)
        print(f"{lib}: OK")
    except ImportError as e:
        print(f"{lib}: FAILED - {e}")
        failed_imports.append(lib)
    except Exception as e:
        print(f"{lib}: ERROR - {e}")
        failed_imports.append(lib)

if failed_imports:
    print(f"\nFailed imports: {', '.join(failed_imports)}")
    sys.exit(1)
else:
    print("\nAll libraries imported successfully.")
