require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module JfcHands
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

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

    # Force asset cache busting on each deployment
    # Use a simple timestamp that gets evaluated during asset compilation
    config.assets.version = Time.now.to_i.to_s

    # config.eager_load_paths << Rails.root.join("extras")

    # Set a unique assets version for cache busting
    # Use REVISION file content if available (set by deployment), otherwise use timestamp
    revision_file = Rails.root.join("REVISION")
    if File.exist?(revision_file)
      config.assets.version = File.read(revision_file).strip[0..7] # Use first 8 chars of commit hash
    else
      config.assets.version = "1.0.0"
    end
  end
end
