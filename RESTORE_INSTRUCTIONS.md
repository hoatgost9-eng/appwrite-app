# Restore Firebase Data to Appwrite

## Prerequisites

Before running the restore script, you need to:

### 1. Create an API Key in Appwrite Console

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io/)
2. Open your project: `myfirstproject` (ID: 69356b960013d2a9d1d8)
3. Click **Overview** → **Integrations** → **API keys** tab
4. Click **Create API key**
5. Configure:
   - **Name**: Data Restore Key
   - **Expiration**: Never (or set a date after restoration)
   - **Scopes**: Check ALL database permissions:
     - ✅ `databases.read`
     - ✅ `databases.write`
     - ✅ `collections.read`
     - ✅ `collections.write`
     - ✅ `documents.read`
     - ✅ `documents.write`
6. Click **Create**
7. **IMPORTANT**: Copy the API key immediately (you won't see it again!)

### 2. Create Collections in Appwrite

Your backup contains these collections. You need to create them in Appwrite first:

#### Collection: `elements`
- Collection ID: `elements`
- Attributes (add these in Appwrite Console):
  - `elementId` (string, required)
  - `projectNumber` (string, required)
  - `projectName` (string)
  - `type` (string)
  - `length` (string)
  - `widthHeight` (string)
  - `volume` (string or number)
  - `status` (string)
  - `castingDate` (string)
  - `deliveryDate` (string)
  - `villa` (string)
  - `cluster` (string)
  - `dwgDate` (string)

#### Collection: `projects`
- Collection ID: `projects`
- Attributes:
  - `projectId` (string, required)
  - `name` (string)
  - `archived` (boolean)
  - Add other fields as needed

#### Collection: `delivery_notes`
- Collection ID: `delivery_notes`
- Attributes:
  - `date` (string)
  - Add other fields from your Firebase schema

#### Collection: `logs`
- Collection ID: `logs`
- Attributes:
  - `timestamp` (string or datetime)
  - `action` (string)
  - `user` (string)

#### Collection: `users`
- Collection ID: `users`
- Attributes:
  - `email` (string, required)
  - `role` (string)
  - `name` (string)

#### Collection: `recycle`
- Collection ID: `recycle`
- Attributes:
  - `deletedAt` (string)
  - Add other fields

**NOTE**: If you're not sure about all the attributes, you can run the script and it will show you what fields are in your data. Then create the collections with those attributes.

---

## Running the Restore Script

### Step 1: Install Dependencies

Open PowerShell in your project folder and run:

```powershell
npm install
```

### Step 2: Update the API Key

Edit `scripts/restore_to_appwrite.js` and replace:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
```

With your actual API key from step 1.

### Step 3: Run the Restore

```powershell
npm run restore
```

OR

```powershell
node scripts/restore_to_appwrite.js
```

---

## What the Script Does

1. Reads your Firebase backup: `backups/firestore-backup-2025-12-10 Latest.json`
2. For each collection in the backup:
   - Maps it to the corresponding Appwrite collection
   - Converts the data format (Firebase → Appwrite)
   - Creates documents in Appwrite
3. Shows progress for each collection
4. Reports success/error counts

---

## Troubleshooting

### Error: "Collection not found"
- Make sure you created the collection in Appwrite Console
- Check that the Collection ID matches exactly (case-sensitive)

### Error: "Invalid document structure"
- You need to add the required attributes to the collection in Appwrite
- Check the error message to see which field is missing

### Error: "Attribute not found"
- Add the missing attribute to the collection in Appwrite Console
- Go to: Your Collection → Settings → Attributes → Create Attribute

### Documents Already Exist
- The script will skip documents that already exist (409 error)
- This is normal if you run the script multiple times

---

## After Restoration

1. Refresh your app at `http://localhost:8000`
2. Log in with your Appwrite account
3. Your data should now be visible!

---

## Important Notes

- The script converts nested objects/arrays to JSON strings (Appwrite limitation)
- Your app code handles parsing these back to objects
- The script preserves document IDs from Firebase
- Run the script only once unless you need to re-import

