# config valid for current version and releases of Capistrano
lock "~> 3.19.2"

# RVM settings
set :rvm_type, :system
set :rvm_ruby_version, '3.4.2'
set :rvm_custom_path, '/usr/share/rvm'

set :application, "jfc_hands"
set :repo_url, "git@github.com:sebastianpjj/jfc-volunteer-management.git"

# Default branch is :master
ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory
set :deploy_to, "/var/www/jfc_hands"

# Default value for :format is :airbrussh.
set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
set :pty, true

# Default value for :linked_files is []
append :linked_files, "config/master.key", "config/database.yml"

# Default value for linked_dirs is []
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system", "vendor"

# Default value for default_env is {}
set :default_env, { path: "/usr/share/rvm/bin:$PATH" }

# Default value for local_repository_cache is true
set :local_repository_cache, false

# Default value for keep_releases is 5
set :keep_releases, 5

# Uncomment the following to require manually verifying the host key before first deploy.
# set :ssh_options, verify_host_key: :secure

# bundler settings
set :bundle_flags, '--deployment --without development test'
set :bundle_path, -> { shared_path.join('vendor/bundle') }

# Passenger settings
set :passenger_restart_with_touch, true

namespace :deploy do
  desc "Make sure local git is in sync with remote."
  task :check_revision do
    on roles(:app) do
      unless `git rev-parse HEAD` == `git rev-parse origin/#{fetch(:branch)}`
        puts "WARNING: HEAD is not the same as origin/#{fetch(:branch)}"
        puts "Run `git push` to sync changes."
        exit
      end
    end
  end

  desc 'Run database migrations'
  task :migrate_database do
    on roles(:db) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'db:migrate'
        end
      end
    end
  end

  desc 'Clear importmap cache'
  task :clear_importmap_cache do
    on roles(:app) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'tmp:clear'
          execute :touch, 'tmp/restart.txt'
        end
      end
    end
  end

  desc 'Force complete asset rebuild'
  task :force_asset_rebuild do
    on roles(:app) do
      # Remove shared assets directory to force complete rebuild
      execute :rm, '-rf', shared_path.join('public/assets')
      execute :mkdir, '-p', shared_path.join('public/assets')
    end
  end

  desc 'Initial Deploy'
  task :initial do
    invoke 'deploy'
  end

  # before :starting, :check_revision
  before :deploy, :force_asset_rebuild
  after  :finishing, :cleanup
  after  :finishing, :clear_importmap_cache
  after  :finishing, 'passenger:restart'
end
