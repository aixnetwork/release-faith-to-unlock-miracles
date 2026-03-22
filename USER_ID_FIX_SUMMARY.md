# User ID Fix for Prayer Comments

## Problem
When logging in through admin/auth (`app/admin/auth.tsx`), the user ID was not being stored in `userStore`. This caused prayer comments to be inserted with a `null` or `undefined` `user_id` field in the `prayer_comments` collection.

## Root Cause
- Admin authentication was only updating `adminStore` with user information
- Prayer comment insertion code in both `app/prayer-wall.tsx` and `app/prayer/[id].tsx` retrieves the user ID from `userStore` (`user?.id`)
- Since admin login didn't populate `userStore`, `user?.id` was always `undefined` or `null`

## Solution
Updated the admin authentication flow to store user information in **both** stores:

### Changes Made

#### 1. Updated `store/adminStore.ts`
- Modified `authenticateWithCredentials` return type to include:
  - `userId?: string`
  - `userName?: string`
  - `userEmail?: string`
  - `accessToken?: string`
  - `refreshToken?: string`
  
- Updated the authentication function to extract and return user information:
  ```typescript
  const userId = userData.data.id;
  const userEmail = userData.data.email;
  const userFirstName = userData.data.first_name || '';
  const userLastName = userData.data.last_name || '';
  const userName = userFirstName && userLastName 
    ? `${userFirstName} ${userLastName}` 
    : userEmail;
  ```

#### 2. Updated `app/admin/auth.tsx`
- Imported `useUserStore` and its `login` function
- After successful admin authentication, also logs the user into `userStore`:
  ```typescript
  if (result.userId && result.userEmail && result.userName) {
    userLogin({
      id: result.userId,
      name: result.userName,
      email: result.userEmail,
      plan: 'individual',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }
  ```
- Applied the same logic for both direct authentication and SMS verification flow (iOS)

## Impact
Now when an admin or organizer logs in through admin auth:
1. Their user ID, name, email, and tokens are stored in `adminStore`
2. The same information is also stored in `userStore`
3. Prayer comment insertion works correctly with proper `user_id` values
4. Comments display with correct user information

## Testing Checklist
- [x] Login through admin/auth
- [x] Navigate to prayer wall
- [x] Click "Pray" button on a prayer
- [x] Submit a comment
- [x] Verify `user_id` is populated in `prayer_comments` table
- [x] Verify comment displays with correct user name
- [x] Navigate to prayer detail page
- [x] Add a comment there
- [x] Verify `user_id` is populated correctly

## Database Schema Reference

### prayers table
- `id` (char(36), PK)
- `title` (varchar(255))
- `content` (text)
- `user_id` (char(36))
- `organization_id` (int)
- `shareOnWall` (tinyint(1))
- `prayerCount` (int)
- Other fields...

### prayer_comments table
- `id` (char(36), PK)
- `prayer_id` (char(36)) - Foreign key to prayers.id
- `user_id` (char(36)) - **This field is now properly populated**
- `comments` (text)
- `liked` (tinyint(1))
- `comment_id` (char(36)) - For replies
- Other fields...

## API Endpoints Used
- Directus Auth: `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/auth/login`
- User Info: `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/users/me`
- Insert Comment: `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments`

## Notes
- The fix maintains backward compatibility with regular user login
- Admin users now have their information in both stores for maximum compatibility
- The `user_id` field is critical for:
  - Displaying comment author names
  - Tracking who prayed for what
  - Implementing features like "I already prayed"
  - User profile viewing in comments
