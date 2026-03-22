import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// Get current subscription status for a user
export const getSubscriptionStatusProcedure = protectedProcedure
  .input(
    z.object({
      currentPlan: z.string().optional(),
    }).optional()
  )
  .query(async ({ input, ctx }) => {
    try {
      console.log('🔄 Fetching subscription status for user:', ctx.user?.id || 'anonymous');
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Mock subscription data based on user's current plan
      // In a real app, this would come from your database or payment provider
      const mockSubscriptions = {
        free: null, // Free plan has no subscription
        individual: {
          id: 'sub_individual_mock_123',
          planId: 'individual',
          planName: 'Individual Plan',
          status: 'active' as const,
          amount: 599, // $5.99 in cents
          currency: 'usd',
          interval: 'month' as const,
          intervalCount: 1,
          provider: 'stripe' as const,
          currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
          trialStart: null,
          trialEnd: null,
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          paymentMethodId: 'pm_stripe_1',
        },
        group_family: {
          id: 'sub_group_family_mock_456',
          planId: 'group_family',
          planName: 'Group/Family Plan',
          status: 'active' as const,
          amount: 1900, // $19.00 in cents
          currency: 'usd',
          interval: 'month' as const,
          intervalCount: 1,
          provider: 'stripe' as const,
          currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          trialStart: null,
          trialEnd: null,
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethodId: 'pm_stripe_1',
        },
        small_church: {
          id: 'sub_small_church_mock_789',
          planId: 'small_church',
          planName: 'Small Church Plan',
          status: 'active' as const,
          amount: 9900, // $99.00 in cents
          currency: 'usd',
          interval: 'month' as const,
          intervalCount: 1,
          provider: 'stripe' as const,
          currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          trialStart: null,
          trialEnd: null,
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethodId: 'pm_stripe_1',
        },
        large_church: {
          id: 'sub_large_church_mock_101',
          planId: 'large_church',
          planName: 'Large Church Plan',
          status: 'active' as const,
          amount: 29900, // $299.00 in cents
          currency: 'usd',
          interval: 'month' as const,
          intervalCount: 1,
          provider: 'stripe' as const,
          currentPeriodStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          trialStart: null,
          trialEnd: null,
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethodId: 'pm_stripe_1',
        },
      };
      
      // Get user's current plan from input or context (this would come from your user store/database)
      // For now, we'll use the plan passed from the frontend or fallback to context
      // In a real app, you'd get this from your database based on ctx.user?.id
      const userPlan = input?.currentPlan || ctx.user?.plan || 'free';
      console.log('👤 User plan from input/context:', userPlan);
      
      const subscription = mockSubscriptions[userPlan as keyof typeof mockSubscriptions];
      console.log('📋 Mock subscription found:', !!subscription);
      
      // For paid plans, ensure we have a subscription
      const paidPlans = ['individual', 'group_family', 'small_church', 'large_church'];
      const shouldHaveSubscription = paidPlans.includes(userPlan);
      
      console.log('✅ Subscription status fetched:', {
        userPlan,
        hasSubscription: !!subscription,
        status: subscription?.status,
        userId: ctx.user?.id,
      });
      
      const result = {
        success: true,
        subscription,
        plan: userPlan,
        hasActiveSubscription: shouldHaveSubscription && (subscription?.status === 'active' || subscription?.status === 'completed'),
        isLifetime: userPlan === 'lifetime',
        nextBillingDate: subscription?.currentPeriodEnd,
        daysUntilBilling: subscription?.currentPeriodEnd 
          ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      };
      
      console.log('📤 Returning subscription status:', {
        plan: result.plan,
        hasActiveSubscription: result.hasActiveSubscription,
        subscriptionId: result.subscription?.id,
      });
      
      return result;
      
      /* 
      // Real implementation would look like this:
      
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paypal = require('@paypal/checkout-server-sdk');
      
      // Get user's subscription from database
      const userSubscription = await getUserSubscriptionFromDB(ctx.user?.id);
      
      if (!userSubscription) {
        return {
          success: true,
          subscription: null,
          plan: 'free',
          hasActiveSubscription: false,
          isLifetime: false,
        };
      }
      
      let subscriptionDetails;
      
      if (userSubscription.provider === 'stripe') {
        if (userSubscription.type === 'subscription') {
          subscriptionDetails = await stripe.subscriptions.retrieve(userSubscription.providerSubscriptionId);
        } else {
          // One-time payment (lifetime)
          subscriptionDetails = await stripe.paymentIntents.retrieve(userSubscription.providerPaymentId);
        }
      } else if (userSubscription.provider === 'paypal') {
        // Get PayPal subscription details
        const environment = process.env.NODE_ENV === 'production' 
          ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
          : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
        
        const client = new paypal.core.PayPalHttpClient(environment);
        const request = new paypal.subscriptions.SubscriptionsGetRequest(userSubscription.providerSubscriptionId);
        const response = await client.execute(request);
        subscriptionDetails = response.result;
      }
      
      return {
        success: true,
        subscription: {
          id: subscriptionDetails.id,
          planId: userSubscription.planId,
          planName: userSubscription.planName,
          status: subscriptionDetails.status,
          amount: userSubscription.amount,
          currency: userSubscription.currency,
          interval: userSubscription.interval,
          intervalCount: userSubscription.intervalCount,
          provider: userSubscription.provider,
          currentPeriodStart: subscriptionDetails.current_period_start ? new Date(subscriptionDetails.current_period_start * 1000).toISOString() : null,
          currentPeriodEnd: subscriptionDetails.current_period_end ? new Date(subscriptionDetails.current_period_end * 1000).toISOString() : null,
          cancelAtPeriodEnd: subscriptionDetails.cancel_at_period_end || false,
          canceledAt: subscriptionDetails.canceled_at ? new Date(subscriptionDetails.canceled_at * 1000).toISOString() : null,
          createdAt: new Date(subscriptionDetails.created * 1000).toISOString(),
        },
        plan: userSubscription.planId,
        hasActiveSubscription: ['active', 'trialing', 'completed'].includes(subscriptionDetails.status),
        isLifetime: userSubscription.planId === 'lifetime',
      };
      */
    } catch (error) {
      console.error('❌ Error fetching subscription status:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to fetch subscription status: ${errorMessage}`,
        subscription: null,
        plan: 'free',
        hasActiveSubscription: false,
      };
    }
  });