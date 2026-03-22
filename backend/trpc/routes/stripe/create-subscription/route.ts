import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// Create subscription for recurring payments
export const createSubscriptionProcedure = protectedProcedure
  .input(
    z.object({
      planId: z.string(),
      paymentMethodId: z.string(),
      couponCode: z.string().optional(),
      trialDays: z.number().optional().default(14),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { planId, paymentMethodId, couponCode, trialDays } = input;
      
      console.log('🔄 Creating Stripe subscription:', {
        planId,
        paymentMethodId,
        couponCode,
        trialDays,
        userId: ctx.user?.id || 'anonymous',
      });
      
      // Validate plan ID
      const validPlans = ['premium', 'pro', 'org_small', 'org_medium', 'org_large'];
      if (!validPlans.includes(planId)) {
        throw new Error('Invalid plan ID');
      }
      
      // Map plan IDs to price configurations
      const planConfigs: Record<string, { priceId: string; amount: number; currency: string; name: string; interval: string }> = {
        premium: { 
          priceId: 'price_premium_monthly', 
          amount: 999, // $9.99 in cents
          currency: 'usd',
          name: 'Premium Plan',
          interval: 'month'
        },
        pro: { 
          priceId: 'price_pro_monthly', 
          amount: 999, // $9.99 in cents
          currency: 'usd',
          name: 'Pro Plan',
          interval: 'month'
        },
        org_small: { 
          priceId: 'price_small_church_yearly', 
          amount: 29900, // $299.00 in cents
          currency: 'usd',
          name: 'Small Church Plan',
          interval: 'year'
        },
        org_medium: { 
          priceId: 'price_medium_church_yearly', 
          amount: 59900, // $599.00 in cents
          currency: 'usd',
          name: 'Medium Church Plan',
          interval: 'year'
        },
        org_large: { 
          priceId: 'price_large_church_yearly', 
          amount: 99900, // $999.00 in cents
          currency: 'usd',
          name: 'Large Church Plan',
          interval: 'year'
        },
      };
      
      const planConfig = planConfigs[planId];
      if (!planConfig) {
        throw new Error('Plan configuration not found');
      }

      // Apply coupon discount if provided
      let finalAmount = planConfig.amount;
      let discountInfo = null;

      if (couponCode) {
        const validCoupons: Record<string, { discount: number; type: 'percentage' | 'fixed'; description: string }> = {
          'LAUNCH50': { discount: 50, type: 'percentage', description: '50% off launch special' },
          'SAVE20': { discount: 20, type: 'fixed', description: '$20 off any plan' },
          'YEARLY25': { discount: 25, type: 'percentage', description: '25% off yearly plans' },
        };

        const coupon = validCoupons[couponCode.toUpperCase()];
        if (coupon) {
          if (coupon.type === 'percentage') {
            finalAmount = Math.round(planConfig.amount * (1 - coupon.discount / 100));
          } else {
            finalAmount = Math.max(0, planConfig.amount - (coupon.discount * 100)); // Convert dollars to cents
          }

          discountInfo = {
            code: couponCode.toUpperCase(),
            originalAmount: planConfig.amount,
            discountAmount: planConfig.amount - finalAmount,
            finalAmount,
            description: coupon.description,
          };
        }
      }
      
      // Generate a mock subscription ID
      const timestamp = Date.now();
      const subscriptionId = `sub_${planId}_${timestamp}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Stripe subscription created:', {
        subscriptionId,
        planId,
        originalAmount: planConfig.amount,
        finalAmount,
        currency: planConfig.currency,
        interval: planConfig.interval,
        couponApplied: !!discountInfo,
      });
      
      return {
        success: true,
        subscriptionId,
        planId,
        planName: planConfig.name,
        originalAmount: planConfig.amount,
        finalAmount,
        currency: planConfig.currency,
        interval: planConfig.interval,
        paymentMethod: 'stripe',
        discount: discountInfo,
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + (trialDays + (planConfig.interval === 'year' ? 365 : 30)) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'trialing',
        metadata: {
          userId: ctx.user?.id,
          planId,
          couponCode: couponCode || null,
          createdAt: new Date().toISOString(),
        },
      };
      
      /* 
      // Real Stripe implementation would look like this:
      
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Create or retrieve customer
      let customerId = ctx.user?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user?.email,
          name: ctx.user?.name,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
          metadata: {
            userId: ctx.user?.id,
          },
        });
        customerId = customer.id;
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Apply coupon if provided and valid
      let couponId = null;
      if (couponCode) {
        try {
          const coupon = await stripe.coupons.retrieve(couponCode);
          if (coupon.valid) {
            couponId = couponCode;
          }
        } catch (error) {
          console.warn('Invalid coupon code:', couponCode);
        }
      }
      
      const subscriptionConfig = {
        customer: customerId,
        items: [{
          price: planConfig.priceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: trialDays,
        metadata: {
          planId: planId,
          userId: ctx.user?.id,
          couponCode: couponCode || '',
        },
      };

      // Add coupon if valid
      if (couponId) {
        subscriptionConfig.coupon = couponId;
      }

      const subscription = await stripe.subscriptions.create(subscriptionConfig);
      
      return {
        success: true,
        subscriptionId: subscription.id,
        planId,
        planName: planConfig.name,
        originalAmount: planConfig.amount,
        finalAmount: subscription.items.data[0].price.unit_amount || planConfig.amount,
        currency: planConfig.currency,
        interval: planConfig.interval,
        paymentMethod: 'stripe',
        trialEndsAt: new Date(subscription.trial_end * 1000).toISOString(),
        nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      };
      */
    } catch (error) {
      console.error('❌ Stripe subscription creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to create subscription: ${errorMessage}`,
        planId: input.planId,
      };
    }
  });