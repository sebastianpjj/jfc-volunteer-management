#!/bin/bash

# Quick deployment script
# Usage: ./scripts/deploy.sh "Your commit message"

if [ "$#" -eq 0 ]; then
    COMMIT_MESSAGE="Quick deployment - $(date)"
else
    COMMIT_MESSAGE="$1"
fi

echo "🚀 Starting deployment with message: $COMMIT_MESSAGE"

# Add all changes
git add .

# Commit with provided or default message
git commit -m "$COMMIT_MESSAGE"

# Push to remote
git push

# Wait for git push to complete
sleep 5

# Deploy to production
bundle exec cap production deploy

echo "✅ Deployment complete!"
