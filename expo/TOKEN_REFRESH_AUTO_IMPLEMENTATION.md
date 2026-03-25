# Automatic Token Refresh Implementation

## Overview
Implemented automatic token refresh mechanism that handles expired tokens transparently when making API requests. The system automatically detects 401 errors and refreshes the access token using the refresh token before retrying the failed request.

## Implementation Details

### Core Components

#### 1. `utils/authUtils.ts`
Contains the main token refresh logic:

- **`refreshAccessToken()`**: Handles token refresh using the refresh token
  - Prevents multiple simultaneous refresh requests
  - Updates user store with new tokens
  - Returns null and redirects to login if refresh fails

- **`fetchWithAuth()`**: Wrapper for fetch that automatically handles token refresh
  - Adds Authorization header with access token
  - Detects 401 errors (expired token)
  - Automatically calls `refreshAccessToken()` on 401
  - Retries the original request with new token
  - Redirects to login if refresh fails

#### 2. Updated API Calls
Replaced all direct `fetch()` calls with `fetchWithAuth()` in:

- **`app/prayer/new.tsx`**: Prayer creation
- **`app/(tabs)/prayers.tsx`**: Prayer fetching, updates, deletions, comments
- **`app/prayer-wall.tsx`**: Prayer wall fetching and interactions

### How It Works

```typescript
// Before (manual token management)
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${user.accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});

// After (automatic token refresh)
const response = await fetchWithAuth(url, {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### Flow Diagram

```
User Action (Save Prayer)
    ↓
Call fetchWithAuth()
    ↓
Make API request with current access token
    ↓
Response Status?
    ↓
├─ 200 OK → Return response ✓
│
└─ 401 Unauthorized (Token Expired)
        ↓
    Call refreshAccessToken()
        ↓
    POST to /auth/refresh with refresh_token
        ↓
    Response?
        ↓
    ├─ Success → Update tokens in store
    │               ↓
    │           Retry original request with new token
    │               ↓
    │           Return response ✓
    │
    └─ Failed → Clear user session
                    ↓
                Redirect to /login
                    ↓
                Show "Please login again"
```

### Key Features

1. **Transparent to Application Code**: No need to manually check for token expiration
2. **Prevents Race Conditions**: Only one token refresh happens at a time
3. **Automatic Retry**: Failed requests are automatically retried with new token
4. **Graceful Degradation**: Redirects to login if refresh fails
5. **Console Logging**: Comprehensive logs for debugging

### Security Considerations

- Refresh tokens are stored securely in Zustand with AsyncStorage persistence
- Access tokens are automatically updated in memory
- User is logged out and redirected if refresh token is invalid
- No tokens are exposed in console logs

### Usage Examples

```typescript
// Creating a prayer
const response = await fetchWithAuth(
  `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers`,
  {
    method: 'POST',
    body: JSON.stringify(prayerData),
  }
);

// Fetching prayers
const response = await fetchWithAuth(
  `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?filter=...`
);

// Updating a prayer
const response = await fetchWithAuth(
  `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}`,
  {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }
);

// Deleting a prayer
const response = await fetchWithAuth(
  `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}`,
  {
    method: 'DELETE',
  }
);
```

### Console Output Examples

**Successful Token Refresh:**
```
🔄 Got 401, attempting token refresh...
🔄 Refreshing access token...
✅ Token refreshed successfully
✅ Retrying request with new token...
```

**Failed Token Refresh:**
```
🔄 Got 401, attempting token refresh...
🔄 Refreshing access token...
❌ Token refresh failed: 401
🔄 Token expired, logging out...
```

## Testing

### Test Scenarios

1. **Normal Request**: Token is valid → Request succeeds
2. **Expired Token**: Token is expired → Auto-refresh → Request retried → Success
3. **Invalid Refresh Token**: Both tokens invalid → Logout → Redirect to login
4. **Multiple Simultaneous Requests**: Only one refresh happens, others wait

### Manual Testing Steps

1. Login to the app
2. Wait for access token to expire (or manually expire it)
3. Try to save/share a prayer
4. Observe automatic token refresh in console
5. Verify prayer is saved successfully
6. Check that no error messages are shown to user

## Benefits

1. **Better User Experience**: No interruptions due to token expiration
2. **Reduced Error Handling**: Token refresh is handled automatically
3. **Maintainable Code**: Centralized token refresh logic
4. **Reliable**: Handles edge cases and race conditions

## Future Improvements

1. Add token expiration time tracking to prevent unnecessary 401 errors
2. Implement token refresh before expiration (proactive refresh)
3. Add exponential backoff for failed refresh attempts
4. Implement token refresh queue for better performance
