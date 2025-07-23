# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

server "135.220.17.20", user: "azureuser", roles: %w{app db web}

# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb
# These variables are then only loaded and set in this stage.

# Custom SSH Options
# ==================
set :ssh_options, {
  keys: %w(~/.ssh/id_rsa),
  forward_agent: true,
  auth_methods: %w(publickey)
}

# The server's domain or IP address
set :rails_env, :production
set :branch, 'main'

# Database configuration
set :database_name, 'jfc_hands_production'
