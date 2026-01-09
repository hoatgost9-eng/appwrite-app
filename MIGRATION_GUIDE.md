# Firebase Migration Guide - Moving to New Account

## Step 1: Create New Firebase Account & Project

1. **Sign out** of your current Google account in browser
2. Go to https://console.firebase.google.com/
3. **Sign in with a different Google account** (create new Gmail if needed)
4. Click **"Add project"** or **"Create a project"**
5. Enter project name: `naran-precast-new` (or your choice)
6. **Disable Google Analytics** (optional, simpler setup)
7. Click **"Create project"**

## Step 2: Set Up Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **"Email/Password"** → **Enable** → **Save**
3. Go to **Users** tab → **Add user**
4. Add your admin email and password
5. **Copy the User UID** (you'll need this for Step 5)

## Step 3: Set Up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in production mode"** (we'll add rules next)
3. Select a location (closest to your users)
4. Click **"Enable"**

## Step 4: Deploy Security Rules

1. Open terminal in your project folder
2. Login to Firebase CLI:
   ```powershell
   firebase login
   ```
3. Initialize Firebase (select the NEW project):
   ```powershell
   firebase use --add
   ```
   - Select your new project from the list
   - Give it an alias like "production"
4. Deploy the existing rules:
   ```powershell
   firebase deploy --only firestore:rules
   ```

## Step 5: Get New Firebase Config

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click **Web** icon (</>) → **"Add app"**
4. Give it a nickname: "Naran Precast Web"
5. **Check** "Also set up Firebase Hosting" (optional)
6. Click **"Register app"**
7. **Copy the firebaseConfig object** - it looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
8. **Keep this handy** - you'll paste it into your app

## Step 6: Update Your App Config

**I'll help you update the config in index.html in the next step!**

## Step 7: Restore Your Data

1. Download your new project's service account key:
   - Firebase Console → **Project settings** → **Service accounts**
   - Click **"Generate new private key"**
   - Save as `service-account-new.json`

2. Run the restore script (I'll create this for you):
   ```powershell
   node scripts/restore_data.js
   ```

## Step 8: Create Your Admin User Profile

After restoring data, create your user profile in Firestore:
1. Go to **Firestore Database** in Firebase Console
2. Click **"Start collection"** → Collection ID: `users`
3. Add document with **Document ID = Your User UID from Step 2**
4. Add fields:
   - `email`: (string) your email
   - `name`: (string) your name  
   - `role`: (string) `admin`
5. Click **Save**

## Step 9: Test Everything

1. Open your app in browser
2. Sign in with the credentials from Step 2
3. Verify you can see and edit data
4. Test all major features

---

## Next Steps

Run this command to see your current Firebase project:
```powershell
firebase projects:list
```

**Ready to proceed? Let me know when you've:**
- Created the new Firebase project
- Got the new firebaseConfig
Then I'll update your app and create the restore script!
