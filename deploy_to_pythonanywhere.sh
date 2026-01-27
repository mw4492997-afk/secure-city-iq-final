#!/bin/bash
# Deployment script for Secure City IQ on PythonAnywhere
# Run this in your PythonAnywhere Bash console

echo "🚀 Starting Secure City IQ deployment to PythonAnywhere..."

# Navigate to home directory
cd ~

# Remove existing directory if it exists
if [ -d "secure-city-iq" ]; then
    echo "Removing existing secure-city-iq directory..."
    rm -rf secure-city-iq
fi

# Clone the repository (replace with your actual GitHub URL)
echo "Cloning repository from GitHub..."
git clone https://github.com/yourusername/secure-city-iq.git

# Navigate to project directory
cd secure-city-iq

# Create virtual environment
echo "Creating virtual environment..."
python3.11 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Make WSGI file executable
echo "Setting up WSGI file..."
chmod +x wsgi.py

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p web_dashboard/static
mkdir -p web_dashboard/templates
mkdir -p reports

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps in PythonAnywhere Web tab:"
echo "1. Source code: /home/Mustafa1999/secure-city-iq"
echo "2. Working directory: /home/Mustafa1999/secure-city-iq"
echo "3. WSGI configuration file: /home/Mustafa1999/secure-city-iq/wsgi.py"
echo "4. Virtualenv: /home/Mustafa1999/secure-city-iq/venv"
echo "5. Click 'Reload' to deploy"
echo ""
echo "🌐 Your app will be available at: http://mustafa1999.pythonanywhere.com"
