# Auth & Roles — How to add users and configure read-only accounts

This project now supports role-based access with three roles:

- admin — Full access (create/update/delete, recycle management, user management).
- editor — Create and update content (elements, delivery notes) but cannot permanently delete projects or items.
- viewer / readonly — Read-only access (can view data but not write).

Where roles live
- Every user should have a Firestore document in `users/{uid}` with a `role` field. Example schema:
  {
    name: "Alice Admin",
    email: "alice@example.com",
    role: "admin"
  }

How the client behaves
- The app fetches the current user's profile (`/users/{uid}`) and sets the role. UI controls are disabled for users with `role: 'viewer'` or missing profiles.
- Write operations are guarded client-side and will display a friendly alert if the user lacks permissions. Always enforce server-side rules (see firestore.rules).

Adding a read-only user (Firestore console)
1. Open Firebase Console → Firestore → Data
2. Create a new document under `users` with the document ID equal to the user's `uid` (found in Authentication) and set `role` to `viewer` (or `readonly`) and provide `email` and `name` as extra metadata.

Example:
Collection: users
Document ID: U0a1b2c3d4e5...
Document data:
{
  "email": "viewer@company.com",
  "name": "Viewer User",
  "role": "viewer"
}

Deploy Firestore security rules
- A `firestore.rules` file exists in the repo. Deploy using Firebase CLI:

```powershell
# login and set project accordingly
firebase login;
firebase use --add # choose project if needed
firebase deploy --only firestore:rules
```

Notes & best practices
- Make sure the Authentication provider (email/password, SSO) creates the user first (check `Authentication` in Firebase console), then create a `users/{uid}` doc with role.
- For bulk user onboarding, you can create a small admin-only UI or a Cloud Function to seed user profiles.
 - This repo now includes an Admin-only "User Management" UI inside the app (available to users with `role: 'admin'`). That view lets admins:
   - Create a Firestore `users/{uid}` profile (UID must match an existing Authentication user). This lets you assign roles (viewer/editor/admin) without touching the Auth console.
   - Modify a user's role in Firestore immediately.
   - Create an `invitations` document (admin-only) which your server or automation can process to email an invitation or create an Authentication user.
 - If you want, I can add a server-side Cloud Function that watches `invitations` and automatically creates the Firebase Authentication user and sends them an email invite, or use Admin SDK for more controlled onboarding.
 - If you want, I can add a server-side Cloud Function that watches `invitations` and automatically creates the Firebase Authentication user and sends them an email invite, or use Admin SDK for more controlled onboarding.

## Scripted admin helper (local) — set roles by email
If the Firestore Console is showing "Quota exceeded" (see screenshot) you can still set roles using the Firebase Admin SDK locally with a service account.

Steps:
1. Go to Firebase Console → Project Settings → Service accounts → Generate new private key. Save the JSON as `service-account.json` at the repo root (DO NOT commit it).
2. In the repo, there is a helper script at `scripts/setRoles.js`. Edit the `targets` array in that file to contain the three emails / roles (keshab → admin; telal → editor; sri → editor) or run it as-is if correct.
3. Install dependencies and run the script (from repo root):

```powershell
npm init -y
npm install firebase-admin
node scripts/setRoles.js
```

Notes:
- This script uses the Admin SDK to look up the Authentication user by email and write a `users/{uid}` Firestore document with the requested role. It does not change or create Authentication accounts themselves.
- If the Firestore quota truly prevents writes, you will need to address billing / quotas (upgrade to Blaze) or run the script under an account with sufficient quotas. Use the Billing page in the Firebase Console to check your limits.

## Step-by-step: Console route (recommended)
If your Console UI is working (and you're not blocked by "Quota exceeded"), do this:

1. Sign into Firebase Console → Select your project.
2. Authentication → Users: locate each user (keshab, telal, sri). Click a user to see details and the UID. Copy each UID.
3. Firestore Database → Data → Create / Edit documents:
  - Collection: `users`
  - Document ID: paste the UID from step 2
  - Fields: `name` (string), `email` (string), `role` (string) — set `keshab` to `admin`, `telal` and `sri` to `editor`.
4. The app listens to `users/{uid}` and will change UI & permissions immediately after the document is saved.

If you see `Quota exceeded` in Firestore Console (like the screenshot you shared)
1. Open: Firebase Console → Usage / Billing or Project Overview → Billing (in left nav) and check your Firestore quotas and billing status.
2. If the project is on the Spark (free) plan and you are hitting free-tier limits, upgrade to Blaze (pay-as-you-go) or wait until quotas reset.
3. If you prefer not to upgrade, use the Admin SDK script (instructions above) from a machine that has service account credentials — but note programmatic writes may also be blocked if the project-wide quota is exceeded.

## Verify everything worked
1. In Firestore triple-check the `users/{uid}` documents show the expected `role` values.
2. Open the app in a browser and sign in as each user:
  - keshab: should see User Management in the sidebar and admin actions enabled.
  - telal / sri: should not see the Users menu, and admin-only buttons should be disabled.
3. Look at the `logs` collection for `UPDATE` or `CREATE` entries if you want an audit trail.

If you want I can remove the temporary hard-coded "admin123" confirmation in the project deletion flow (to rely only on role checks), or scaffold the Cloud Function for automated invites.
- Keep `admin` membership restricted and consider using Firebase custom claims for higher-trust server-side checks (optional).

If you want, I can:
- Add an admin-only "User Management" UI in the app to create/modify user roles.
- Add Firebase Cloud Functions to automatically create a `users/{uid}` document when a new auth user is created.
- Deploy the `firestore.rules` for you (if you give me permission or let me run the CLI in this environment).
