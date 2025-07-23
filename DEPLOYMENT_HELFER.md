# JFC Hands - Deployment Instructions for helfer subdomain

## Step 1: Prepare the Server

Run the setup script to create necessary directories and set permissions:

```bash
# Copy the setup script to your server
scp setup_server.sh azureuser@135.220.17.20:~/

# SSH to the server
ssh azureuser@135.220.17.20

# Run the setup script
chmod +x setup_server.sh
./setup_server.sh

# Copy the Rails master key to the server
# (Run this from your local machine)
scp config/master.key azureuser@135.220.17.20:/var/www/jfc_hands/shared/config/
```

## Step 2: Ensure MySQL Database

Make sure the MySQL database `jfc_hands_production` exists and the user has access:

```bash
# On the server, connect to MySQL
mysql -u root -p

# Create the database (if it doesn't exist)
CREATE DATABASE jfc_hands_production CHARACTER SET utf8 COLLATE utf8_general_ci;

# Verify the database exists
SHOW DATABASES;

# Exit MySQL
EXIT;
```

## Step 3: Deploy the Application

**For initial deployment:**

```bash
# From your local project directory
bundle exec cap production deploy:initial
```

**For subsequent deployments:**

```bash
bundle exec cap production deploy
```

The deployment will automatically:
- Run database migrations
- Compile assets
- Restart Passenger

## Step 4: Configure Nginx (MANUAL STEP - DO NOT AUTOMATE)

**⚠️ IMPORTANT: Do NOT overwrite your existing Nginx configuration!**

Your existing Nginx configuration at `/etc/nginx/sites-enabled/default` contains important settings for your WordPress site and `fussballdart.eintracht-feldberg.net`. 

**Manual steps:**

### 3.1 Update HTTP redirect block

First, add `helfer.eintracht-feldberg.net` to your existing HTTP redirect block:

```nginx
# UPDATE this existing block in your config:
server {
    if ($host = fussballdart.eintracht-feldberg.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = www.eintracht-feldberg.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = eintracht-feldberg.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    # ADD this new redirect:
    if ($host = helfer.eintracht-feldberg.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    # UPDATE this line to include helfer subdomain:
    server_name eintracht-feldberg.net www.eintracht-feldberg.net fussballdart.eintracht-feldberg.net helfer.eintracht-feldberg.net;
    return 301 https://$host$request_uri;
}
```

### 3.2 Add new server block for helfer

Add this new server block **after** your existing fussballdart server block:

```nginx
server {
    listen 443 ssl;
    server_name helfer.eintracht-feldberg.net;

    root /var/www/jfc_hands/current/public;
    ssl_certificate /etc/letsencrypt/live/eintracht-feldberg.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eintracht-feldberg.net/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Optional: Reuse Azure SMTP settings from fussballdart if needed
    # passenger_env_var SMTP_AZURE_SERVICE_DOMAIN "your-azure-service-domain";
    # passenger_env_var SMTP_AZURE_SERVICE_USERNAME "your-azure-service-username";
    # passenger_env_var SMTP_AZURE_SERVICE_PW "your-azure-service-password";    passenger_enabled on;
    passenger_ruby /usr/share/rvm/wrappers/ruby-3.1.4/ruby;
    passenger_app_env production;

    client_max_body_size 100M;

    add_header Content-Security-Policy "frame-ancestors 'self' https://www.eintracht-feldberg.de https://eintracht-feldberg.net;";
    add_header X-Content-Type-Options nosniff;

    error_page 500 502 503 504 /500.html;
    error_page 404 /404.html;

    location ~ ^/(assets|packs|uploads|images|fonts|favicon.ico) {
        expires max;
        add_header Cache-Control public;
    }

    location / {
        try_files $uri/index.html $uri @app;
    }

    location @app {
        passenger_enabled on;
        passenger_app_root /var/www/jfc_hands/current;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**After making these changes:**

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx only if test passes
sudo systemctl reload nginx
```

### 3.3 SSL Certificate

Your existing SSL certificate (`/etc/letsencrypt/live/eintracht-feldberg.net/`) should work for `helfer.eintracht-feldberg.net` if it's a wildcard certificate. If not, you may need to extend it:

```bash
# Check if helfer subdomain is covered
sudo certbot certificates

# If needed, add the subdomain (this will be handled automatically by certbot)
```

## Step 4: Deploy the Application

From your local machine:

```bash
# First deployment (this will take longer)
bundle exec cap production deploy

# For subsequent deployments
./deploy.sh production
```

## Step 5: Set up DNS (if using a custom domain)

Add a CNAME record for `helfer` pointing to your main domain, or an A record pointing to `135.220.17.20`.

## Step 6: Configure SSL (Optional but Recommended)

```bash
# On the server, install certbot if not already installed
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d helfer.your-domain.com

# Or if using IP address, you can skip SSL for now
```

## Useful Commands

### Check deployment status:
```bash
bundle exec cap production deploy:check
```

### View logs:
```bash
ssh azureuser@135.220.17.20 "tail -f /var/www/helfer/current/log/production.log"
```

### Restart application:
```bash
bundle exec cap production passenger:restart
```

### Check if site is accessible:
```bash
curl -I http://135.220.17.20  # or your domain
```

## Troubleshooting

### If deployment fails:
1. Check the deployment logs
2. Ensure all shared files exist
3. Verify database configuration
4. Check file permissions

### If the site doesn't load:
1. Check nginx error logs: `sudo tail -f /var/log/nginx/helfer_error.log`
2. Check passenger status: `sudo passenger-status`
3. Verify the application is running: `ps aux | grep ruby`

### Database issues:
1. Check if SQLite database file exists: `/var/www/helfer/shared/db/production.sqlite3`
2. Run migrations if needed: `bundle exec cap production rails:db:migrate`
