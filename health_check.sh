#!/bin/bash

# JFC Hands - Health Check Script
# Usage: ./health_check.sh [production|staging]

ENVIRONMENT=${1:-production}
BASE_PATH="/var/www/jfc_hands"

echo "🏥 JFC Hands Health Check - $ENVIRONMENT Environment"
echo "=================================================="

# Check if application directory exists
if [ ! -d "$BASE_PATH" ]; then
    echo "❌ Application directory not found: $BASE_PATH"
    exit 1
fi

# Check current deployment
if [ -L "$BASE_PATH/current" ]; then
    CURRENT_RELEASE=$(readlink $BASE_PATH/current)
    echo "✅ Current deployment: $(basename $CURRENT_RELEASE)"
else
    echo "❌ No current deployment found"
fi

# Check Puma process
if pgrep -f "puma.*$BASE_PATH" > /dev/null; then
    echo "✅ Puma process is running"
    PUMA_PID=$(pgrep -f "puma.*$BASE_PATH")
    echo "   PID: $PUMA_PID"
else
    echo "❌ Puma process not found"
fi

# Check socket file
SOCKET_PATH="$BASE_PATH/shared/tmp/sockets/puma.sock"
if [ -S "$SOCKET_PATH" ]; then
    echo "✅ Puma socket exists: $SOCKET_PATH"
else
    echo "❌ Puma socket not found: $SOCKET_PATH"
fi

# Check systemd service (if exists)
if systemctl is-active --quiet jfc_hands; then
    echo "✅ Systemd service is active"
else
    echo "⚠️  Systemd service is not active (may be normal if using other process manager)"
fi

# Check Nginx configuration
if nginx -t 2>/dev/null; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
fi

# Check database connectivity
cd $BASE_PATH/current 2>/dev/null
if [ $? -eq 0 ]; then
    if bundle exec rails runner "ActiveRecord::Base.connection.execute('SELECT 1')" 2>/dev/null; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
    fi
else
    echo "⚠️  Cannot check database (current directory not found)"
fi

# Check disk space
DISK_USAGE=$(df $BASE_PATH | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo "✅ Disk usage: ${DISK_USAGE}%"
else
    echo "⚠️  High disk usage: ${DISK_USAGE}%"
fi

# Check recent logs for errors
if [ -f "$BASE_PATH/shared/log/production.log" ]; then
    ERROR_COUNT=$(tail -100 $BASE_PATH/shared/log/production.log | grep -i error | wc -l)
    if [ $ERROR_COUNT -eq 0 ]; then
        echo "✅ No recent errors in logs"
    else
        echo "⚠️  Found $ERROR_COUNT errors in recent logs"
    fi
fi

echo ""
echo "📊 Quick Stats:"
echo "   Releases kept: $(ls -1 $BASE_PATH/releases 2>/dev/null | wc -l)"
echo "   Uptime: $(ps -o etime= -p $PUMA_PID 2>/dev/null | tr -d ' ' || echo 'N/A')"

echo ""
echo "🔗 Useful Commands:"
echo "   View logs: tail -f $BASE_PATH/shared/log/production.log"
echo "   Restart app: sudo systemctl restart jfc_hands"
echo "   Deploy: ./deploy.sh $ENVIRONMENT"
