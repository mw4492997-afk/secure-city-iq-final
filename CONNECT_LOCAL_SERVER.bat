@echo off
chcp 65001 >nul
echo ============================================
echo  ربط السيرفر المحلي بالموقع المرفوع
echo ============================================
echo.
echo الخطوة 1: تأكد أن Flask يعمل على port 5000
echo الخطوة 2: سجل مجاناً على ngrok.com
echo الخطوة 3: احصل على Authtoken من لوحة التحكم
echo.
echo ملاحظة: ngrok يحتاج لتسجيل الدخول أولاً
echo.
pause

echo.
echo جاري تشغيل ngrok...
echo.

:: Check if ngrok exists
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo ngrok غير مثبت. جاري التحميل...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip'; Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force}"
    echo تم التحميل!
)

echo.
echo اكتب Authtoken الخاص بك (من ngrok.com):
set /p NGROK_TOKEN="Authtoken: "

ngrok config add-authtoken %NGROK_TOKEN%

echo.
echo ============================================
echo  جاري فتح النفق...
echo  اترك هذا النافذة مفتوحة!
echo ============================================
echo.

ngrok http 5000

pause

