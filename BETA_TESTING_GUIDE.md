# Comprehensive Beta Testing Guide

## Testing Dashboard

A comprehensive beta testing dashboard has been created at `/full-beta-testing` that will systematically test all features and backend routes.

### How to Access

Navigate to `/full-beta-testing` in your app to run the comprehensive test suite.

### What It Tests

The testing dashboard checks:

1. **Authentication**
   - Token storage
   - User session management

2. **tRPC Routes**
   - Example routes (hi)
   - Home stats and recent activity
   - Prayers (list, create, update, delete)
   - Meetings (list, create, update, delete)
   - Groups (list, create, send messages, join)
   - Marketplace listings
   - Content management

3. **Navigation Routes**
   - All main tab routes
   - Settings pages
   - Auth pages (login, register)
   - Feature pages (prayers, meetings, etc.)

4. **Data Fetching**
   - Network connectivity
   - tRPC client initialization

5. **UI Components**
   - Verifies presence of key components

## Manual Testing Areas

### 1. Authentication & User Management
- [ ] **Login** - Test with valid/invalid credentials
- [ ] **Register** - Create new account
- [ ] **Logout** - Sign out and verify session cleared
- [ ] **Password Reset** - Test forgot password flow
- [ ] **User Profile** - Update profile information

### 2. Prayers Feature
- [ ] **Create Prayer** - Add new prayer request
- [ ] **View Prayers** - List active, answered, and community prayers
- [ ] **Mark as Answered** - Toggle prayer status
- [ ] **Delete Prayer** - Remove prayer
- [ ] **Prayer Comments** - Add and view comments
- [ ] **Prayer Wall** - Share prayers with community
- [ ] **Prayer Assistance** - Access biblical prayer templates

### 3. Meetings Feature
- [ ] **Create Meeting** - Schedule new prayer meeting
- [ ] **View Meetings** - List upcoming and past meetings
- [ ] **Join Meeting** - Join virtual meeting
- [ ] **Edit Meeting** - Update meeting details
- [ ] **Delete Meeting** - Remove meeting

### 4. Community Features
- [ ] **Prayer Wall** - View and interact with community prayers
- [ ] **Groups** - Create and join prayer groups
- [ ] **Group Messages** - Send and receive messages
- [ ] **Community Stats** - View engagement metrics

### 5. Content Management (Admin/Organizer)
- [ ] **Create Content** - Add sermons, bible studies, etc.
- [ ] **Edit Content** - Update existing content
- [ ] **Delete Content** - Remove content
- [ ] **View Content** - Access content library
- [ ] **Content Categories** - Filter by type

### 6. AI Features
- [ ] **AI Assistant** - Chat with AI for spiritual guidance
- [ ] **Prayer Generator** - Generate prayer templates
- [ ] **Devotional Generator** - Create daily devotionals
- [ ] **Scripture Insights** - Get biblical analysis

### 7. Habits & Tracking
- [ ] **Create Habit** - Set up daily spiritual practices
- [ ] **Track Habit** - Mark habits complete
- [ ] **View Streak** - Check current streak
- [ ] **Habit Stats** - View progress analytics

### 8. Services Marketplace
- [ ] **Browse Listings** - View available services
- [ ] **Create Listing** - Add service offering
- [ ] **Edit Listing** - Update service details
- [ ] **Approve Listings** (Admin) - Review pending services

### 9. Organization Features
- [ ] **Organization Dashboard** - View org stats
- [ ] **Manage Members** - Add/remove members
- [ ] **Manage Groups** - Create/edit groups
- [ ] **Content Library** - Org-specific content
- [ ] **Analytics** - Organization metrics

### 10. Admin Features
- [ ] **User Management** - View and manage users
- [ ] **Content Moderation** - Approve/reject content
- [ ] **Analytics Dashboard** - System-wide metrics
- [ ] **Database Management** - Backup, optimize
- [ ] **API Key Management** - Generate/revoke keys
- [ ] **Coupon Management** - Create/manage coupons

### 11. Subscription & Payments
- [ ] **View Plans** - Browse membership tiers
- [ ] **Subscribe** - Purchase subscription
- [ ] **Manage Subscription** - Upgrade/downgrade
- [ ] **Cancel Subscription** - End subscription
- [ ] **Payment Methods** - Add/remove cards
- [ ] **Invoice History** - View past payments

### 12. Affiliate Program
- [ ] **View Stats** - Check referral metrics
- [ ] **Get Referral Link** - Share affiliate link
- [ ] **Track Referrals** - See referred users
- [ ] **Request Payout** - Withdraw earnings
- [ ] **Payment Method** - Set payout details

### 13. Settings
- [ ] **Profile Settings** - Update personal info
- [ ] **Notification Settings** - Configure alerts
- [ ] **Language Settings** - Change app language
- [ ] **Privacy Settings** - Manage data preferences
- [ ] **Security Settings** - Update password
- [ ] **Billing Settings** - Manage payments

## Known Architecture Notes

### Backend Communication
- Most features use **direct Directus API calls** via `fetchWithAuth()`
- Some features use **tRPC** for backend communication
- Authentication uses **user store** with AsyncStorage persistence

### State Management
- **User State**: Zustand store (`useUserStore`)
- **Prayers**: Directus API + local state
- **Meetings**: Zustand store (`useMeetingStore`)
- **Habits**: Zustand store (`useHabitStore`)
- **Marketplace**: Zustand store (`useMarketplaceStore`)

### API Endpoints
- **Directus API**: `ENV.EXPO_PUBLIC_RORK_API_BASE_URL`
- **tRPC Backend**: `ENV.EXPO_PUBLIC_BACKEND_URL + '/api/trpc'`

## Testing Checklist Results

Run the automated testing dashboard at `/full-beta-testing` and document results:

- [ ] Authentication tests passed
- [ ] tRPC routes responding
- [ ] Navigation routes accessible
- [ ] Data fetching working
- [ ] UI components loading

## Common Issues to Watch For

1. **Token Expiration**: User sessions timing out
2. **Network Errors**: Failed API requests
3. **Empty States**: Missing data handling
4. **Navigation Errors**: Route not found
5. **Permission Errors**: Unauthorized access
6. **Data Sync**: State not updating after mutations

## Reporting Issues

When reporting issues, include:
- Feature/page where issue occurred
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)
- User role (admin, organizer, member)
- Device/platform (iOS, Android, Web)

## Next Steps After Testing

1. Review automated test results from `/full-beta-testing`
2. Complete manual testing checklist
3. Document all identified issues
4. Prioritize fixes by severity
5. Retest after fixes applied
