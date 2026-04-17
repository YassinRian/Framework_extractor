#!/bin/bash

# 1. Define paths to keep things clean
SOURCE_DIR="./js/"
DEST_DIR="/home/yrian/Coding/Cognos/YassinRian.github.io/framework_xml_extractie/js/"
TARGET_FILE="${DEST_DIR}App.js"
BASE_URL="https://yassinrian.netlify.app/framework_xml_extractie/js"

# 2. Run the rsync command
echo "Syncing files..."
rsync -av --delete "$SOURCE_DIR" "$DEST_DIR"

# 3. Use sed to replace the dependency array
# This looks for the line starting with 'define([' and replaces the content inside the brackets
echo "Updating App.js dependencies..."

if [ -f "$TARGET_FILE" ]; then
    sed -i 's|define(\["jquery", "./UI", "./Extractor", "./Styles", "./TimeMachine"\]|define(["jquery", "'$BASE_URL'/UI.js", "'$BASE_URL'/Extractor.js", "'$BASE_URL'/Styles.js", "'$BASE_URL'/TimeMachine.js"]|' "$TARGET_FILE"
    echo "Done! App.js has been updated."
else
    echo "Error: App.js not found in destination."
fi
