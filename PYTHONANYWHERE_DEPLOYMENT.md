# 🚀 Secure City IQ - PythonAnywhere Deployment Guide

## Overview
This guide will help you deploy the Secure City IQ web dashboard to PythonAnywhere at `http://mustafa1999.pythonanywhere.com`.

## Prerequisites
- PythonAnywhere account (free tier works)
- Git repository access
- Basic knowledge of PythonAnywhere interface

## Step 1: Upload Files to PythonAnywhere

### Option A: Using Git (Recommended)
1. Go to your PythonAnywhere dashboard
2. Open a **Bash console**
3. Clone your repository:
```bash
git clone https://github.com/yourusername/secure-city-iq.git
cd secure-city-iq
```

### Option B: Manual Upload
1. Go to **Files** tab in PythonAnywhere
2. Create a new directory: `secure-city-iq`
3. Upload all project files manually

## Step 2: Set Up Virtual Environment

1. In the **Bash console**, create and activate a virtual environment:
```bash
python3.11 -m venv venv
source venv/bin/activate
```

2. Install requirements:
```bash
pip install -r requirements.txt
```

## Step 3: Configure the Web App

1. Go to **Web** tab in PythonAnywhere
2. Click **Add a new web app**
3. Choose **Manual configuration** (or **Flask** if available)
4. Select **Python 3.11** as the Python version

### Web App Configuration

1. **Source code**: Set to `/home/yourusername/secure-city-iq`
2. **Working directory**: Set to `/home/yourusername/secure-city-iq`
3. **WSGI configuration file**: Set to `/home/yourusername/secure-city-iq/wsgi.py`

### Virtual Environment
- **Virtualenv**: `/home/yourusername/secure-city-iq/venv`

### Static Files (Optional)
If you want to serve static files:
- URL: `/static/`
- Directory: `/home/yourusername/secure-city-iq/web_dashboard/static`

## Step 4: Database Setup

1. In the **Bash console**, create the database directory:
```bash
mkdir -p ~/secure-city-iq
```

2. The database file `secure_city_auth.db` will be created automatically when the app runs.

## Step 5: Environment Variables (Optional)

If you need to set environment variables:
1. Go to **Web** tab → **Environment variables**
2. Add any required variables (currently none are required)

## Step 6: Reload the Web App

1. Go back to **Web** tab
2. Click the **Reload** button for your app
3. Wait for the reload to complete

## Step 7: Access Your App

Your app should now be available at:
```
http://mustafa1999.pythonanywhere.com
```

## Troubleshooting

### Common Issues

#### 1. Import Errors
If you get import errors for modules like `ai_threat_detector`:
- These modules may not work on PythonAnywhere due to system restrictions
- The app is designed to handle missing modules gracefully

#### 2. System Monitoring Restrictions
- PythonAnywhere restricts access to system information
- The app includes fallbacks for restricted functionality
- System info will show "N/A (restricted)" for unavailable data

#### 3. Database Issues
- Ensure the database path is writable
- Check file permissions if needed

#### 4. Static Files Not Loading
- Verify the static files path in web app configuration
- Ensure the `web_dashboard/static/` directory exists

### Logs and Debugging

1. **Error logs**: Check **Web** tab → **Error log**
2. **Server logs**: Check **Web** tab → **Server log**
3. **Console debugging**: Use the Bash console to test imports:
```bash
cd ~/secure-city-iq
source venv/bin/activate
python -c "from web_dashboard.app import app; print('Import successful')"
```

## Features Available on PythonAnywhere

### ✅ Working Features
- Main dashboard with real-time updates
- API endpoints for data
- Report export functionality
- Basic system information (limited)
- Responsive web interface

### ⚠️ Limited/Restricted Features
- System monitoring (CPU, memory, disk) - shows "N/A"
- Network statistics - shows zeros
- AI threat detection - may not initialize
- IoT monitoring - may not work
- Real-time packet analysis - not available

### ❌ Unavailable Features
- Raw socket access
- Packet sniffing
- Low-level system monitoring
- Network interface enumeration

## Security Considerations

1. **Database Security**: The SQLite database is stored in your home directory
2. **Environment Variables**: Don't store sensitive data in code
3. **File Permissions**: Keep sensitive files private
4. **HTTPS**: PythonAnywhere provides free HTTPS

## Updating Your App

To update your deployed app:

1. **Using Git**:
```bash
cd ~/secure-city-iq
git pull origin main
```

2. **Manual Update**:
   - Upload new files via Files tab
   - Or use SFTP/SCP

3. **Reload**: Always click **Reload** in the Web tab after updates

## Performance Tips

- PythonAnywhere free tier has limitations
- Keep the app lightweight
- Use caching where possible
- Monitor resource usage

## Support

If you encounter issues:
1. Check the error logs
2. Test imports in the console
3. Verify file paths and permissions
4. Ensure all requirements are installed

---

**Note**: This deployment is optimized for PythonAnywhere's shared hosting environment. Some advanced monitoring features are disabled due to platform restrictions, but the core dashboard functionality remains intact.

**Last Updated**: January 2025
