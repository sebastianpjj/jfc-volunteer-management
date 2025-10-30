require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module JfcHands
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2

    # importmap configuration
    # This is where we configure importmap to cache our JavaScript files.
    # It allows us to use modern JavaScript features without needing a bundler.
    config.importmap.cache_sweepers << Rails.root.join("app/assets/javascripts")

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # Set timezone to Berlin/Germany (Central European Time)
    config.time_zone = "Berlin"

    # Make Active Record use the application time zone instead of UTC
    config.active_record.default_timezone = :local

    # Set German as default locale
    config.i18n.default_locale = :de
    config.i18n.available_locales = [:de, :en]

    # Force asset cache busting on each deployment
    # Use a simple timestamp that gets evaluated during asset compilation
    config.assets.version = Time.now.to_i.to_s

    # config.eager_load_paths << Rails.root.join("extras")
  end
end
