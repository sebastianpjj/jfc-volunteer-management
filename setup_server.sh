#!/bin/bash

# Server Setup Script for JFC Hands Deployment
# Run this script on the server as a user with sudo privileges

echo "🚀 Setting up deployment directory structure for JFC Hands..."

# Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p /var/www/jfc_hands
sudo chown azureuser:azureuser /var/www/jfc_hands

# Create shared directories
echo "📁 Creating shared directories..."
mkdir -p /var/www/jfc_hands/shared/config
mkdir -p /var/www/jfc_hands/shared/log
mkdir -p /var/www/jfc_hands/shared/tmp/pids
mkdir -p /var/www/jfc_hands/shared/tmp/cache
mkdir -p /var/www/jfc_hands/shared/tmp/sockets
mkdir -p /var/www/jfc_hands/shared/public/system
mkdir -p /var/www/jfc_hands/shared/vendor
mkdir -p /var/www/jfc_hands/shared/storage

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R azureuser:azureuser /var/www/jfc_hands
chmod -R 755 /var/www/jfc_hands

# Create database configuration
echo "🗄️ Creating database configuration..."
cat > /var/www/jfc_hands/shared/config/database.yml << EOF
production:
  adapter: mysql2
  encoding: utf8
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  username: root
  password: iopIOP890!!
  host: localhost
  database: jfc_hands_production
EOF

# Create master key placeholder
echo "🔑 Creating master key placeholder..."
touch /var/www/jfc_hands/shared/config/master.key
chmod 600 /var/www/jfc_hands/shared/config/master.key

# Create credentials placeholder
echo "🔐 Creating credentials placeholder..."
touch /var/www/jfc_hands/shared/config/credentials.yml.enc
chmod 600 /var/www/jfc_hands/shared/config/credentials.yml.enc

echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Add your Rails master key to: /var/www/jfc_hands/shared/config/master.key"
echo "2. Run deployment: bundle exec cap production deploy"
echo "3. MANUALLY add the helfer configuration to your existing Nginx setup"
echo "   - DO NOT overwrite your existing /etc/nginx/sites-enabled/default"
echo "   - Instead, add the helfer server block to your existing configuration"
echo "   - Reference: /var/www/jfc_hands/current/config/nginx_helfer.conf"
