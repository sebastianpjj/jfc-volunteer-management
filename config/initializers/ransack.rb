# Configure Ransack for ActiveAdmin
Ransack.configure do |config|
  # Raise errors for unknown search attributes and associations
  config.ignore_unknown_conditions = false
  
  # Configure sanitization
  config.sanitize_custom_scope_booleans = true
end
