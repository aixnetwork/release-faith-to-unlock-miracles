# Fix prayer detail fetch errors (CORS issue)

## Problem
The prayer detail screen fails to load prayer data and comments with "Failed to fetch" errors. This happens because the screen makes direct API calls that get blocked by browser security (CORS) on the web preview.

## Fix
Replace all direct API calls in the prayer detail screen with the app's existing authenticated fetch helper, which automatically routes requests through a proxy on web to avoid CORS blocking. This also improves security by using the logged-in user's token instead of a hardcoded static token.

## What changes
- **Prayer loading**: Will use the proxy-aware fetch helper instead of direct calls
- **Comments loading**: Same fix applied
- **Adding comments**: Same fix applied  
- **Liking comments**: Same fix applied
- **Replying to comments**: Same fix applied
- **Marking prayer as answered**: Already uses the correct helper — no change needed
- **All other API calls in this screen**: Updated to use the proxy-aware helper

## Impact
- Prayer detail screen will load correctly on both web and mobile
- No visual or behavioral changes — just fixes the network errors
