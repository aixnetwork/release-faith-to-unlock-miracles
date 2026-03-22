import { router } from './trpc';
import { hiProcedure } from './routes/example/hi/route';
import { generateProcedure } from './routes/ai/generate/route';
import { testimonySuggestionsProcedure, testConnectionProcedure } from './routes/ai/testimony-suggestions/route';
import { testimonyOpenAISuggestionsProcedure } from './routes/ai/testimony-openai-suggestions/route';
import { createMeetingProcedure } from './routes/meetings/create-meeting/route';
import { getMeetingsProcedure } from './routes/meetings/get-meetings/route';
import { updateMeetingProcedure } from './routes/meetings/update-meeting/route';
import { deleteMeetingProcedure } from './routes/meetings/delete-meeting/route';
import { createCheckoutSessionProcedure } from './routes/stripe/create-checkout-session/route';
import { createSubscriptionProcedure as stripeCreateSubscriptionProcedure } from './routes/stripe/create-subscription/route';
import { updateSubscriptionProcedure } from './routes/stripe/update-subscription/route';
import { listPaymentMethodsProcedure } from './routes/stripe/list-payment-methods/route';
import { removePaymentMethodProcedure } from './routes/stripe/remove-payment-method/route';
import { setDefaultPaymentMethodProcedure } from './routes/stripe/set-default-payment-method/route';
import { listInvoicesProcedure } from './routes/stripe/list-invoices/route';
import { cancelSubscriptionProcedure } from './routes/stripe/cancel-subscription/route';
import { webhookProcedure } from './routes/stripe/webhook/route';
import { createPaymentProcedure } from './routes/paypal/create-payment/route';
import { executePaymentProcedure } from './routes/paypal/execute-payment/route';
import { createSubscriptionProcedure as paypalCreateSubscriptionProcedure } from './routes/paypal/create-subscription/route';
import { getPaymentMethodsProcedure } from './routes/payments/get-payment-methods/route';
import { addPaymentMethodProcedure } from './routes/payments/add-payment-method/route';
import { getSubscriptionStatusProcedure } from './routes/payments/get-subscription-status/route';
import { getAffiliateStatsProcedure } from './routes/affiliate/get-stats/route';
import { getReferralsProcedure } from './routes/affiliate/get-referrals/route';
import { getPayoutsProcedure } from './routes/affiliate/get-payouts/route';
import { requestPayoutProcedure } from './routes/affiliate/request-payout/route';
import { updatePaymentMethodProcedure } from './routes/affiliate/update-payment-method/route';
import { connectIntegrationProcedure } from './routes/integrations/connect/route';
import { disconnectIntegrationProcedure } from './routes/integrations/disconnect/route';
import { testIntegrationProcedure } from './routes/integrations/test/route';
import { listIntegrationsProcedure } from './routes/integrations/list/route';
import { createGroupProcedure } from './routes/groups/create-group/route';
import { getGroupsProcedure } from './routes/groups/get-groups/route';
import { sendMessageProcedure } from './routes/groups/send-message/route';
import { joinGroupProcedure } from './routes/groups/join-group/route';
import { addMemberProcedure } from './routes/groups/add-member/route';
import { removeMemberProcedure } from './routes/groups/remove-member/route';
import { getMembersProcedure } from './routes/groups/get-members/route';
import { getDatabaseStatsProcedure } from './routes/admin/database/stats/route';
import { createDatabaseBackupProcedure } from './routes/admin/database/backup/route';
import { optimizeDatabaseProcedure } from './routes/admin/database/optimize/route';
import { getAPIStatsProcedure } from './routes/admin/api/stats/route';
import { generateAPIKeyProcedure } from './routes/admin/api/generate-key/route';
import { revokeAPIKeyProcedure } from './routes/admin/api/revoke-key/route';
import { createListingProcedure } from './routes/marketplace/create-listing/route';
import { getListingsProcedure } from './routes/marketplace/get-listings/route';
import { updateMarketplaceSettingsProcedure, getMarketplaceSettingsProcedure } from './routes/marketplace/settings/route';
import { approveListingProcedure, getPendingListingsProcedure, getListingHistoryProcedure } from './routes/marketplace/approve-listing/route';
import { createCouponProcedure } from './routes/admin/coupons/create-coupon/route';
import { getCouponsProcedure } from './routes/admin/coupons/get-coupons/route';
import { validateCouponProcedure } from './routes/admin/coupons/validate-coupon/route';
import { updateCouponProcedure } from './routes/admin/coupons/update-coupon/route';
import { deleteCouponProcedure } from './routes/admin/coupons/delete-coupon/route';
import { couponAnalyticsProcedure } from './routes/admin/coupons/analytics/route';
import { getPrayersProcedure } from './routes/prayers/get-prayers/route';
import { getPrayerByIdProcedure } from './routes/prayers/get-by-id/route';
import { createPrayerProcedure } from './routes/prayers/create-prayer/route';
import { updatePrayerProcedure } from './routes/prayers/update-prayer/route';
import { deletePrayerProcedure } from './routes/prayers/delete-prayer/route';
import { getCommentsProcedure } from './routes/prayers/get-comments/route';
import { addCommentProcedure } from './routes/prayers/add-comment/route';
import { markPrayedProcedure } from './routes/prayers/mark-prayed/route';
import { likeCommentProcedure } from './routes/prayers/like-comment/route';
import { replyCommentProcedure } from './routes/prayers/reply-comment/route';
import { getHomeStatsProcedure } from './routes/home/get-stats/route';
import { getRecentActivityProcedure } from './routes/home/get-recent-activity/route';
import { createContentProcedure } from './routes/content/create-content/route';
import { getContentProcedure } from './routes/content/get-content/route';
import { updateContentProcedure } from './routes/content/update-content/route';
import { deleteContentProcedure } from './routes/content/delete-content/route';
import { getContentByIdProcedure } from './routes/content/get-content-by-id/route';
import { demoLoginProcedure } from './routes/auth/demo-login/route';


export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  auth: router({
    demoLogin: demoLoginProcedure,
  }),
  ai: router({
    generate: generateProcedure,
    testimonySuggestions: testimonySuggestionsProcedure,
    testimonyOpenAISuggestions: testimonyOpenAISuggestionsProcedure,
    testConnection: testConnectionProcedure,
  }),
  meetings: router({
    create: createMeetingProcedure,
    list: getMeetingsProcedure,
    update: updateMeetingProcedure,
    delete: deleteMeetingProcedure,
  }),
  stripe: router({
    createCheckoutSession: createCheckoutSessionProcedure,
    createSubscription: stripeCreateSubscriptionProcedure,
    updateSubscription: updateSubscriptionProcedure,
    listPaymentMethods: listPaymentMethodsProcedure,
    removePaymentMethod: removePaymentMethodProcedure,
    setDefaultPaymentMethod: setDefaultPaymentMethodProcedure,
    listInvoices: listInvoicesProcedure,
    cancelSubscription: cancelSubscriptionProcedure,
    webhook: webhookProcedure,
  }),
  paypal: router({
    createPayment: createPaymentProcedure,
    executePayment: executePaymentProcedure,
    createSubscription: paypalCreateSubscriptionProcedure,
  }),
  payments: router({
    getPaymentMethods: getPaymentMethodsProcedure,
    addPaymentMethod: addPaymentMethodProcedure,
    getSubscriptionStatus: getSubscriptionStatusProcedure,
  }),
  affiliate: router({
    getStats: getAffiliateStatsProcedure,
    getReferrals: getReferralsProcedure,
    getPayouts: getPayoutsProcedure,
    requestPayout: requestPayoutProcedure,
    updatePaymentMethod: updatePaymentMethodProcedure,
  }),
  integrations: router({
    connect: connectIntegrationProcedure,
    disconnect: disconnectIntegrationProcedure,
    test: testIntegrationProcedure,
    list: listIntegrationsProcedure,
  }),
  groups: router({
    create: createGroupProcedure,
    list: getGroupsProcedure,
    sendMessage: sendMessageProcedure,
    join: joinGroupProcedure,
    addMember: addMemberProcedure,
    removeMember: removeMemberProcedure,
    getMembers: getMembersProcedure,
  }),
  admin: router({
    database: router({
      stats: getDatabaseStatsProcedure,
      backup: createDatabaseBackupProcedure,
      optimize: optimizeDatabaseProcedure,
    }),
    api: router({
      stats: getAPIStatsProcedure,
      generateKey: generateAPIKeyProcedure,
      revokeKey: revokeAPIKeyProcedure,
    }),
    coupons: router({
      create: createCouponProcedure,
      list: getCouponsProcedure,
      validate: validateCouponProcedure,
      update: updateCouponProcedure,
      delete: deleteCouponProcedure,
      analytics: couponAnalyticsProcedure,
    }),
  }),
  marketplace: router({
    createListing: createListingProcedure,
    getListings: getListingsProcedure,
    updateSettings: updateMarketplaceSettingsProcedure,
    getSettings: getMarketplaceSettingsProcedure,
    approveListing: approveListingProcedure,
    getPendingListings: getPendingListingsProcedure,
    getListingHistory: getListingHistoryProcedure,
  }),
  prayers: router({
    list: getPrayersProcedure,
    getById: getPrayerByIdProcedure,
    create: createPrayerProcedure,
    update: updatePrayerProcedure,
    delete: deletePrayerProcedure,
    getComments: getCommentsProcedure,
    addComment: addCommentProcedure,
    markPrayed: markPrayedProcedure,
    likeComment: likeCommentProcedure,
    replyComment: replyCommentProcedure,
  }),
  home: router({
    getStats: getHomeStatsProcedure,
    getRecentActivity: getRecentActivityProcedure,
  }),
  content: router({
    create: createContentProcedure,
    list: getContentProcedure,
    getById: getContentByIdProcedure,
    update: updateContentProcedure,
    delete: deleteContentProcedure,
  }),
});

// Export individual procedures for easier testing
export {
  // Stripe procedures
  createCheckoutSessionProcedure,
  stripeCreateSubscriptionProcedure,
  updateSubscriptionProcedure,
  listPaymentMethodsProcedure,
  removePaymentMethodProcedure,
  setDefaultPaymentMethodProcedure,
  listInvoicesProcedure,
  cancelSubscriptionProcedure,
  webhookProcedure,
  
  // PayPal procedures
  createPaymentProcedure,
  executePaymentProcedure,
  paypalCreateSubscriptionProcedure,
  
  // General payment procedures
  getPaymentMethodsProcedure,
  addPaymentMethodProcedure,
  getSubscriptionStatusProcedure,
};

export type AppRouter = typeof appRouter;