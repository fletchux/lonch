# Firebase Firestore Indexes

This document lists all the composite indexes required for the Lonch application to function properly.

## Activity Logs Collection

The activity log filtering features require composite indexes to query efficiently.

### Required Indexes

#### 1. Filter by User
**Collection:** `activityLogs`
**Fields:**
- `projectId` (Ascending)
- `userId` (Ascending)
- `timestamp` (Descending)

**Index URL:** When you encounter the error, Firebase will provide a link like:
```
https://console.firebase.google.com/v1/r/project/lonch-cb672/firestore/indexes?create_composite=ClBwcm9qZWN0cy9sb25jaC1jYjY3Mi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvYWN0aXZpdHlMb2dzL2luZGV4ZXMvXxABGhQKDHByb2plY3RJZBgBIAEoAhIQCgh1c2VySWQYASABKAISFQoJdGltZXN0YW1wGAIgASgCGAE
```

Click the link to automatically create the index in the Firebase Console.

#### 2. Filter by Action
**Collection:** `activityLogs`
**Fields:**
- `projectId` (Ascending)
- `action` (Ascending)
- `timestamp` (Descending)

#### 3. Filter by Date Range
**Collection:** `activityLogs`
**Fields:**
- `projectId` (Ascending)
- `timestamp` (Ascending)
- `timestamp` (Descending)

**Note:** This index supports queries that filter by date ranges (between start and end dates).

## How to Create Indexes

### Method 1: Using Firebase Console Error Links (Recommended)
1. Try to use the filtering feature in the app
2. When you get an error, Firebase will display a link in the error message
3. Click the link to go directly to the Firebase Console
4. Click "Create Index"
5. Wait a few minutes for the index to build

### Method 2: Manual Creation via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (lonch-cb672)
3. Navigate to Firestore Database > Indexes
4. Click "Create Index"
5. Fill in the details from the tables above
6. Click "Create"

### Method 3: Using Firebase CLI (firestore.indexes.json)
Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "activityLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activityLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "action", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activityLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy with:
```bash
firebase deploy --only firestore:indexes
```

## Index Build Time

Composite indexes can take several minutes to build, depending on the amount of data in your collection. You can monitor the build progress in the Firebase Console under Firestore > Indexes.

## Troubleshooting

### "The query requires an index" Error
This error occurs when:
1. The required index hasn't been created yet
2. The index is still building (check status in Firebase Console)
3. The index was created for the wrong collection or fields

**Solution:** Click the link in the error message to create the index, or create it manually using the specifications above.

### Index Build Failed
If an index build fails:
1. Delete the failed index in the Firebase Console
2. Try creating it again
3. Ensure you have proper permissions in Firebase

## Related Files

- Activity filtering implementation: `src/components/project/ActivityLogPanel.tsx`
- Activity service with queries: `src/services/activityLogService.ts`
