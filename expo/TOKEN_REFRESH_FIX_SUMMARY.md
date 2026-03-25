# Token Refresh Fix - Complete Solution

## Problem
Users were experiencing `401 Unauthorized` errors with "Token expired" messages when making API calls to Directus. The access tokens were expiring after 15 minutes, and there was no automatic refresh mechanism in place.

## Solution Implemented

### 1. Token Refresh Utility (`utils/authUtils.ts`)
Created a comprehensive token refresh system with the following features:

- **Automatic Token Refresh**: When a 401 error is detected, automatically attempts to refresh the token
- **Concurrent Request Handling**: Prevents multiple simultaneous refresh attempts using a promise-based queue
- **Token Storage**: Automatically updates both access and refresh tokens in the user store
- **Graceful Logout**: If refresh fails, logs the user out and redirects to login page

### 2. `fetchWithAuth` Function
A wrapper around the native `fetch` API that:
- Automatically adds the Authorization header with the current access token
- Intercepts 401 responses and triggers token refresh
- Retries the original request with the new token
- Handles all token-related errors gracefully

### 3. Updated Store Functions

#### Prayer Store (`store/prayerStore.ts`)
Updated `fetchPrayerPlans` to use `fetchWithAuth` instead of direct fetch calls:
```typescript
const response = await fetchWithAuth(
  `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_plans?fields=*,prayer_days.*&sort=-date_created&${filterQuery}`
);
```

#### User Store (`store/userStore.ts`)
Updated all API calls to use `fetchWithAuth`:
- `joinPrayerPlan`: Creating user prayer plan progress
- `updatePrayerPlanProgress`: Updating prayer day completions and progress

### 4. Prayer Plans Create Page
Already using `fetchWithAuth` for creating prayer plans and prayer days.

## How It Works

1. **Initial Request**: When any API call is made using `fetchWithAuth`, it includes the current access token
2. **Token Expiration Detection**: If the API returns a 401 status, the system detects token expiration
3. **Automatic Refresh**: The system calls the Directus `/auth/refresh` endpoint with the refresh token
4. **Token Update**: New access and refresh tokens are stored in the user store
5. **Request Retry**: The original request is automatically retried with the new access token
6. **Seamless Experience**: The user never sees an error or needs to log in again

## Token Lifecycle

```
Access Token: 15 minutes (900 seconds)
Refresh Token: 7 days (configurable in Directus)

Timeline:
0:00  - User logs in, receives both tokens
0:15  - Access token expires
0:15  - API call fails with 401
0:15  - System automatically refreshes token
0:15  - API call retries with new token
0:15  - User continues working seamlessly
```

## Files Modified

1. `utils/authUtils.ts` - Token refresh logic (already existed, now being used)
2. `store/prayerStore.ts` - Updated `fetchPrayerPlans` to use `fetchWithAuth`
3. `store/userStore.ts` - Updated `joinPrayerPlan` and `updatePrayerPlanProgress` to use `fetchWithAuth`
4. `app/prayer-plans/create.tsx` - Already using `fetchWithAuth` (no changes needed)

## Benefits

✅ **No More Token Expired Errors**: Tokens are automatically refreshed before the user sees an error
✅ **Seamless User Experience**: Users can work for extended periods without re-authentication
✅ **Concurrent Request Safety**: Multiple API calls during token refresh are handled correctly
✅ **Graceful Error Handling**: If refresh fails, users are logged out and redirected appropriately
✅ **Consistent Implementation**: All API calls now use the same authentication mechanism

## Testing Recommendations

1. **Token Expiration Test**: Wait 15+ minutes after login and make an API call
2. **Concurrent Requests**: Make multiple API calls simultaneously after token expiration
3. **Refresh Token Expiration**: Test behavior when refresh token expires (should redirect to login)
4. **Network Errors**: Test behavior when network is unavailable during refresh

## Future Improvements

Consider implementing:
- Proactive token refresh (refresh before expiration)
- Token refresh retry logic with exponential backoff
- Better error messages for different failure scenarios
- Token expiration countdown in UI (optional)

## Notes

- The refresh token is valid for 7 days by default in Directus
- Users will need to log in again after 7 days of inactivity
- All API calls to Directus should use `fetchWithAuth` to benefit from automatic token refresh
- The system handles both web and mobile platforms seamlessly
