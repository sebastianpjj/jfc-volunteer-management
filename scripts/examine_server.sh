#!/bin/bash

# Server examination script for 135.220.17.20
# Run this on your server to check the current setup

echo "=== Server Information ==="
echo "Hostname: $(hostname)"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME)"
echo "Architecture: $(uname -m)"
echo ""

echo "=== Ruby and RVM Setup ==="
echo "Current user: $(whoami)"
echo "RVM version: $(rvm --version 2>/dev/null || echo 'RVM not found in PATH')"
echo "RVM location: $(which rvm 2>/dev/null || echo 'RVM not in PATH')"
echo "Ruby version: $(ruby --version 2>/dev/null || echo 'Ruby not found')"
echo "Ruby location: $(which ruby 2>/dev/null || echo 'Ruby not in PATH')"
echo ""

echo "=== RVM Paths ==="
echo "Checking common RVM locations:"
ls -la ~/.rvm 2>/dev/null && echo "Found user RVM in ~/.rvm"
ls -la /usr/local/rvm 2>/dev/null && echo "Found system RVM in /usr/local/rvm"
ls -la /opt/rvm 2>/dev/null && echo "Found RVM in /opt/rvm"
echo ""

echo "=== Environment Variables ==="
echo "HOME: $HOME"
echo "PATH: $PATH"
echo "RVM_PATH: $RVM_PATH"
echo ""

echo "=== Nginx Setup ==="
echo "Nginx version: $(nginx -v 2>&1 | head -1)"
echo "Nginx config test: $(nginx -t 2>&1 | head -1)"
echo "Nginx sites-enabled:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Cannot access /etc/nginx/sites-enabled/"
echo ""

echo "=== Directory Structure ==="
echo "Checking /var/www:"
ls -la /var/www/ 2>/dev/null || echo "Cannot access /var/www/"
echo ""

echo "=== Database ==="
echo "PostgreSQL version: $(psql --version 2>/dev/null | head -1 || echo 'PostgreSQL not found')"
echo "MySQL version: $(mysql --version 2>/dev/null | head -1 || echo 'MySQL not found')"
echo ""

echo "=== Process Information ==="
echo "Running web servers:"
ps aux | grep -E "(nginx|apache|passenger)" | grep -v grep || echo "No web servers found"
echo ""

echo "=== Network ==="
echo "Listening ports:"
netstat -tlnp 2>/dev/null | grep -E ":(80|443|3000|8080)" || ss -tlnp | grep -E ":(80|443|3000|8080)"
