#!/bin/bash

# 1. Check if a commit message was provided
if [ -z "$1" ]; then
    echo "Error: Please provide a commit message."
    echo "Usage: ./gitsync.sh \"Your message here\""
    exit 1
fi

# 2. Add all changes (js, html, css, etc.)
git add .

# 3. Commit with the provided message
git commit -m "$1"

# 4. Push to the remote 'main' branch
# We use 'origin' and 'main' as they are the defaults you set up
git push origin main

echo "-------------------------------"
echo "Done! Changes synced to GitHub."
