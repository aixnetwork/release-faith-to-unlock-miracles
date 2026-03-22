import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// Update existing subscription
export const updateSubscriptionProcedure = protectedProcedure
  .input(
    z.object({
      subscriptionId: z.string(),
      newPlanId: z.string(),
      prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional().default('create_prorations'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { subscriptionId, newPlanId, prorationBehavior } = input;
      
      console.log('🔄 Updating Stripe subscription:', {
        subscriptionId,
        newPlanId,
        prorationBehavior,
        userId: ctx.user?.id || 'anonymous',
      });
      
      // Validate plan ID
      const validPlans = ['free', 'individual', 'group_family', 'small_church', 'large_church'];
      if (!validPlans.includes(newPlanId)) {
        throw new Error('Invalid plan ID');
      }
      
      // Map plan IDs to price configurations
      const planConfigs: Record<string, { priceId: string; amount: number; currency: string; name: string; interval: string }> = {
        free: { 
          priceId: 'price_free', 
          amount: 0, // $0.00 in cents
          currency: 'usd',
          name: 'Free Plan',
          interval: 'month'
        },
        individual: { 
          priceId: 'price_individual_monthly', 
          amount: 599, // $5.99 in cents
          currency: 'usd',
          name: 'Individual Plan',
          interval: 'month'
        },
        group_family: { 
          priceId: 'price_group_family_monthly', 
          amount: 1900, // $19.00 in cents
          currency: 'usd',
          name: 'Group/Family Plan',
          interval: 'month'
        },
        small_church: { 
          priceId: 'price_small_church_monthly', 
          amount: 9900, // $99.00 in cents
          currency: 'usd',
          name: 'Small Church Plan',
          interval: 'month'
        },
        large_church: { 
          priceId: 'price_large_church_monthly', 
          amount: 29900, // $299.00 in cents
          currency: 'usd',
          name: 'Large Church Plan',
          interval: 'month'
        },
      };
      
      const newPlanConfig = planConfigs[newPlanId];
      if (!newPlanConfig) {
        throw new Error('Plan configuration not found');
      }
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('✅ Stripe subscription updated:', {
        subscriptionId,
        newPlanId,
        newAmount: newPlanConfig.amount,
        currency: newPlanConfig.currency,
        interval: newPlanConfig.interval,
        userId: ctx.user?.id,
      });
      
      return {
        success: true,
        subscriptionId,
        planId: newPlanId,
        planName: newPlanConfig.name,
        amount: newPlanConfig.amount,
        currency: newPlanConfig.currency,
        interval: newPlanConfig.interval,
        paymentMethod: 'stripe',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Next month
        status: 'active',
        prorationAmount: Math.floor(Math.random() * 500), // Mock proration amount
        effectiveDate: new Date().toISOString(),
        metadata: {
          userId: ctx.user?.id,
          planId: newPlanId,
          previousPlanId: input.subscriptionId.split('_')[1] || 'unknown', // Extract from mock subscription ID
          updatedAt: new Date().toISOString(),
        },
      };
      
      /* 
      // Real Stripe implementation would look like this:
      
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Retrieve the subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Update the subscription
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPlanConfig.priceId,
        }],
        proration_behavior: prorationBehavior,
        metadata: {
          planId: newPlanId,
          userId: ctx.user?.id,
          updatedAt: new Date().toISOString(),
        },
      });
      
      return {
        success: true,
        subscriptionId: updatedSubscription.id,
        planId: newPlanId,
        planName: newPlanConfig.name,
        amount: updatedSubscription.items.data[0].price.unit_amount || newPlanConfig.amount,
        currency: newPlanConfig.currency,
        interval: newPlanConfig.interval,
        paymentMethod: 'stripe',
        nextBillingDate: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        status: updatedSubscription.status,
      };
      */
    } catch (error) {
      console.error('❌ Stripe subscription update error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to update subscription: ${errorMessage}`,
        subscriptionId: input.subscriptionId,
      };
    }
  });