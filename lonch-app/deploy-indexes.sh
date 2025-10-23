#!/bin/bash

# Firebase Indexes Deployment Script
# This script helps you deploy the Firestore indexes needed for share links

set -e  # Exit on error

echo "================================================"
echo "Firebase Indexes Deployment for Share Links"
echo "================================================"
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed globally."
    echo ""
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed!"
    echo ""
fi

echo "Step 1: Firebase Login"
echo "-----------------------"
echo "This will open a browser window for authentication."
echo "Log in with the Google account that has access to your Firebase project."
echo ""
read -p "Press Enter to continue..."

firebase login

echo ""
echo "✅ Logged in successfully!"
echo ""

# Check if .firebaserc exists
if [ ! -f ".firebaserc" ]; then
    echo "Step 2: Connect to Firebase Project"
    echo "------------------------------------"
    echo "Select your Firebase project from the list."
    echo ""

    firebase use --add

    echo ""
    echo "✅ Project connected!"
else
    echo "Step 2: Firebase Project Already Connected"
    echo "-------------------------------------------"
    cat .firebaserc
    echo ""
    read -p "Is this the correct project? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Run 'firebase use --add' to change projects"
        exit 1
    fi
fi

echo ""
echo "Step 3: Deploy Firestore Indexes"
echo "---------------------------------"
echo "This will deploy the indexes needed for share links."
echo ""
read -p "Press Enter to deploy..."

npm run deploy:indexes

echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "IMPORTANT: The indexes are now building in Firebase."
echo "This process takes 5-15 minutes."
echo ""
echo "To check status:"
echo "1. Go to: https://console.firebase.google.com"
echo "2. Click your project → Firestore Database → Indexes"
echo "3. Wait until both 'inviteLinks' indexes show 'Enabled'"
echo ""
echo "Once enabled, your share links feature will work! 🎉"
echo ""
