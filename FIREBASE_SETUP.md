# Firebase Setup & Share Links Fix - Complete Instructions

## Overview
Your share links feature needs Firestore indexes to work. I've already added the index definitions to your code, but they need to be deployed to your Firebase project. Here's how to do it.

## Prerequisites
- You need access to your Firebase Console (https://console.firebase.google.com)
- You need to know your Firebase Project ID

---

## Step 1: Find Your Firebase Project ID

1. Go to https://console.firebase.google.com
2. Click on your lonch project
3. Click the gear icon (⚙️) next to "Project Overview"
4. Click "Project settings"
5. Copy your **Project ID** (it's under "General" tab)

---

## Step 2: Configure Firebase in Your Project

Open a terminal in the `lonch-app` directory and run:

```bash
cd lonch-app

# Login to Firebase
firebase login

# This will open a browser window - log in with your Google account
# that has access to your Firebase project
```

After logging in, initialize your Firebase project:

```bash
# Connect this directory to your Firebase project
firebase use --add

# When prompted:
# 1. Select your Firebase project from the list (or enter the Project ID)
# 2. Give it an alias (just press Enter to use "default")
```

This creates a `.firebaserc` file that tells Firebase which project to use.

---

## Step 3: Deploy the Firestore Indexes

Now deploy the indexes I created:

```bash
npm run deploy:indexes
```

You should see output like:
```
✔ Firestore indexes deployed successfully
```

**IMPORTANT:** The indexes will take 5-15 minutes to build. You'll see a message like:
```
Building index... This may take a few minutes.
```

---

## Step 4: Verify the Indexes Are Ready

1. Go to Firebase Console: https://console.firebase.google.com
2. Click your project
3. Go to **Firestore Database** → **Indexes** tab
4. You should see two new indexes for `inviteLinks`:
   - `inviteLinks`: projectId (Ascending), createdAt (Descending)
   - `inviteLinks`: projectId (Ascending), createdBy (Ascending), createdAt (Descending)
5. Wait until both show status **"Enabled"** (not "Building...")

---

## Step 5: Test the Share Links Feature

Once the indexes show "Enabled":

1. Start your dev server: `npm run dev`
2. Log into your lonch app
3. Open a project
4. Go to the "Share Links" tab in the Members panel
5. Try creating a new invite link

It should work now! 🎉

---

## Troubleshooting

### "Permission denied" error when deploying
- Make sure you're logged in: `firebase login --reauth`
- Make sure your Google account has Owner or Editor role in the Firebase project

### "Project not found" error
- Double-check your Project ID
- Run `firebase use --add` again and carefully select the correct project

### Indexes stuck on "Building"
- This is normal - large indexes can take up to 15 minutes
- You can continue working - the feature will work once they finish building

### Share links still not working after deployment
- Check the Firebase Console Indexes tab - make sure status is "Enabled", not "Building"
- Check browser console for errors
- Make sure you have the latest code: `git pull origin claude/fix-share-links-011CUPPVsrYB1bZ25U77MEk5`

---

## Alternative: Deploy via Firebase Console (No CLI needed)

If you prefer not to use the command line, you can manually create the indexes in Firebase Console:

1. Go to https://console.firebase.google.com
2. Click your project → **Firestore Database** → **Indexes** tab
3. Click **"Create Index"**
4. Create this index:
   - Collection ID: `inviteLinks`
   - Fields to index:
     - `projectId` - Ascending
     - `createdAt` - Descending
   - Query scope: Collection
   - Click **Create**

5. Create a second index:
   - Collection ID: `inviteLinks`
   - Fields to index:
     - `projectId` - Ascending
     - `createdBy` - Ascending
     - `createdAt` - Descending
   - Query scope: Collection
   - Click **Create**

6. Wait for both to finish building (status changes to "Enabled")

---

## Need More Help?

If you run into any issues, let me know:
- What command you ran
- The exact error message
- A screenshot if helpful

I'm here to help! 🚀
