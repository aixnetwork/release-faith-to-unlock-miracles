# Mockup Mode - Full Demo Experience

## Completed
- [x] Prayer detail screen uses fetchWithAuth consistently (CORS fix)
- [x] Enhanced mockApi.ts with rich demo data (prayers, habits, achievements, stats, services, testimonials, meetings, prayer plans)
- [x] User-specific prayer filtering in mock API
- [x] Auto-login as demo individual account on app start
- [x] Mock data returns realistic stats for home dashboard (7-day streak, 450 points, 4 habits, completions)
- [x] Demo accounts still available on login screen (Individual, Family, Church)

## How it works
- App auto-logs in as "John Doe" (Individual plan) on first launch
- All API calls with demo tokens are intercepted by mockApi.ts
- Users can switch accounts via login screen demo buttons
- No backend required - fully self-contained demo
