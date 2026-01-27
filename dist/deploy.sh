#!/bin/bash

# Enable error handling (exit on error)
set -e

# Load the configuration file
source ./config.sh

# Prompt user to enter their username
echo "Please enter your username:"
read currentUser

echo "Current user: $currentUser"

# Default paths if user is not found
sourceFolder=$DEFAULT_SOURCE
destinationFolder=$DEFAULT_DEST
checkoutBranch=$DEFAULT_DEST_BRANCH
buildCommand=$DEFAULT_BUILD_CMD

# Check if the current username exists in the USER_CONFIG array
userFound=false

for userConfig in "${USER_CONFIG[@]}"; do
    userName=$(echo "$userConfig" | cut -d ':' -f 1)
    if [[ "$userName" == "$currentUser" ]]; then
        # If the user is found, extract the paths
        sourceFolder=$(echo "$userConfig" | cut -d ',' -f 1 | cut -d ':' -f 2)
        destinationFolder=$(echo "$userConfig" | cut -d ',' -f 2)
        
        echo "Found user configuration"
        echo "sourceFolder: $sourceFolder"
        echo "destinationFolder: $destinationFolder"
        
        userFound=true
        break
    fi
done

# If user is not found, use default paths
if ! $userFound; then
    echo "Error: No user configuration found"
    exit 1
fi



echo "Selected branch: $checkoutBranch"
echo "Build command: $buildCommand"

# Execute the build command
echo "---------------------npm run build start----------------------"
eval $buildCommand
echo "---------------------npm run build end------------------------"

# Switch to the destination folder
cd "$destinationFolder"

echo "---------------------push code start--------------------------"
# Get the current branch
currentBranch=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $currentBranch"

# Checkout and pull the selected branch
git checkout -f $checkoutBranch
if ! git pull --rebase --strategy=recursive -X theirs; then
    echo "Force pulling changes with override strategy..."
    git reset --hard origin/$checkoutBranch
fi

# Clean and copy dist files
rm -rf "$destinationFolder/dist/*"

echo "---------------------copy dist start--------------------------"
# Copy dist from source folder to destination folder
echo "Copying $sourceFolder/dist to $destinationFolder/dist ..."
cp -Rf "$sourceFolder/dist"/* "$destinationFolder/dist/"

echo "---------------------copy dist end----------------------------"

echo "git add . ..."
git add .

# Get current datetime for commit message
datetime=$(date "+%Y-%m-%d_%H-%M-%S")
formattedTime="build: $checkoutBranch $datetime"

# Commit changes
git status
echo "git commit -m \"$formattedTime\""
git commit -m "$formattedTime"

# Push changes to remote repository
echo "git push"
git push || {
    echo "Error: Git push failed!"
    exit 1
}

echo "---------------------push code end--------------------------"

echo "Pushed \"$formattedTime\" to $checkoutBranch branch successfully!"

echo "Done!"
