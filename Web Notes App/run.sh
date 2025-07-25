#!/bin/bash

# Navigate to backend directory
cd "backend" || exit 1

# Ensure Python & pip exist
if ! command -v python3 &>/dev/null; then
  echo "Python3 is not installed! Please install it."
  exit 1
fi

if ! command -v pip3 &>/dev/null; then
  echo "pip3 is not installed! Installing..."
  python3 -m ensurepip --upgrade
fi

# Ensure virtualenv exists
if ! python3 -m virtualenv --version &>/dev/null; then
  echo "virtualenv not found, installing..."
  pip3 install virtualenv
fi

# Create venv if missing
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m virtualenv venv
fi

# Activate venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run Django migrations
python manage.py migrate

# Run Django server in background
python manage.py runserver &

# Give server a moment to start
sleep 3

# Launch frontend in browser
cd ../frontend || exit 1
if command -v xdg-open &>/dev/null; then
  xdg-open index.html
elif command -v open &>/dev/null; then  # macOS
  open index.html
else
  echo "Please open frontend/index.html manually."
fi
