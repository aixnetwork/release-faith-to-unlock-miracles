import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const createSubscriptionInput = z.object({
  planId: z.string(),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
  couponCode: z.string().optional(),
});

export const createSubscriptionProcedure = protectedProcedure
  .input(createSubscriptionInput)
  .mutation(async ({ input, ctx }) => {
    try {
      const { planId, returnUrl, cancelUrl, couponCode } = input;
      
      console.log('🔄 Creating PayPal subscription:', {
        planId,
        couponCode,
        userId: ctx.user?.id || 'anonymous',
      });
      
      // Validate plan ID
      const validPlans = ['premium', 'pro', 'org_small', 'org_medium', 'org_large'];
      if (!validPlans.includes(planId)) {
        throw new Error('Invalid plan ID');
      }
      
      // Map plan IDs to subscription configurations
      const planConfigs: Record<string, { planId: string; amount: number; currency: string; name: string; interval: string; intervalCount: number }> = {
        premium: { 
          planId: 'P-premium-monthly', 
          amount: 999, // $9.99 in cents
          currency: 'USD',
          name: 'Premium Plan',
          interval: 'MONTH',
          intervalCount: 1
        },
        pro: { 
          planId: 'P-pro-monthly', 
          amount: 999, // $9.99 in cents
          currency: 'USD',
          name: 'Pro Plan',
          interval: 'MONTH',
          intervalCount: 1
        },
        org_small: { 
          planId: 'P-small-church-yearly', 
          amount: 29900, // $299.00 in cents
          currency: 'USD',
          name: 'Small Church Plan',
          interval: 'YEAR',
          intervalCount: 1
        },
        org_medium: { 
          planId: 'P-medium-church-yearly', 
          amount: 59900, // $599.00 in cents
          currency: 'USD',
          name: 'Medium Church Plan',
          interval: 'YEAR',
          intervalCount: 1
        },
        org_large: { 
          planId: 'P-large-church-yearly', 
          amount: 99900, // $999.00 in cents
          currency: 'USD',
          name: 'Large Church Plan',
          interval: 'YEAR',
          intervalCount: 1
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
          const originalAmount = planConfig.amount;
          if (coupon.type === 'percentage') {
            finalAmount = Math.round(planConfig.amount * (1 - coupon.discount / 100));
          } else {
            finalAmount = Math.max(0, planConfig.amount - (coupon.discount * 100)); // Convert dollars to cents
          }

          discountInfo = {
            code: couponCode.toUpperCase(),
            originalAmount,
            discountAmount: originalAmount - finalAmount,
            finalAmount,
            description: coupon.description,
          };
        }
      }
      
      // Generate a mock PayPal subscription ID
      const timestamp = Date.now();
      const subscriptionId = `I-${planId.toUpperCase()}-${timestamp}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Create mock approval URL that would redirect to PayPal
      const approvalUrl = `https://www.sandbox.paypal.com/webapps/billing/subscriptions/create?plan_id=${planConfig.planId}&subscription_id=${subscriptionId}&return_url=${encodeURIComponent(returnUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      console.log('✅ PayPal subscription created:', {
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
        approvalUrl,
        planId,
        planName: planConfig.name,
        originalAmount: planConfig.amount,
        finalAmount,
        currency: planConfig.currency,
        interval: planConfig.interval.toLowerCase(),
        intervalCount: planConfig.intervalCount,
        paymentMethod: 'paypal',
        discount: discountInfo,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        nextBillingDate: new Date(Date.now() + (14 + (planConfig.interval === 'YEAR' ? 365 : 30)) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approval_pending',
        metadata: {
          userId: ctx.user?.id,
          planId,
          couponCode: couponCode || null,
          createdAt: new Date().toISOString(),
        },
      };
      
      /* 
      // Real PayPal implementation would look like this:
      
      const paypal = require('@paypal/checkout-server-sdk');
      
      // Configure PayPal environment
      const environment = process.env.NODE_ENV === 'production' 
        ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
        : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
      
      const client = new paypal.core.PayPalHttpClient(environment);
      
      // Calculate final amount in dollars
      const amountInDollars = (finalAmount / 100).toFixed(2);
      
      // Create subscription request
      const request = new paypal.subscriptions.SubscriptionsCreateRequest();
      request.prefer("return=representation");
      
      const subscriptionRequest = {
        plan_id: planConfig.planId,
        start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Start after trial
        quantity: "1",
        shipping_amount: {
          currency_code: planConfig.currency,
          value: "0.00"
        },
        subscriber: {
          name: {
            given_name: ctx.user?.name?.split(' ')[0] || 'User',
            surname: ctx.user?.name?.split(' ')[1] || 'Name'
          },
          email_address: ctx.user?.email || 'user@example.com'
        },
        application_context: {
          brand_name: "Faith App",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
          },
          return_url: returnUrl,
          cancel_url: cancelUrl
        }
      };

      // Add discount information if applicable
      if (discountInfo) {
        subscriptionRequest.plan = {
          ...subscriptionRequest.plan,
          billing_cycles: [{
            frequency: {
              interval_unit: planConfig.interval,
              interval_count: planConfig.intervalCount
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: amountInDollars,
                currency_code: planConfig.currency
              }
            }
          }]
        };
      }

      request.requestBody(subscriptionRequest);
      
      const response = await client.execute(request);
      const subscription = response.result;
      
      // Find approval URL
      const approvalLink = subscription.links.find(link => link.rel === 'approve');
      
      return {
        success: true,
        subscriptionId: subscription.id,
        approvalUrl: approvalLink?.href,
        planId,
        planName: planConfig.name,
        originalAmount: planConfig.amount,
        finalAmount,
        currency: planConfig.currency,
        interval: planConfig.interval.toLowerCase(),
        intervalCount: planConfig.intervalCount,
        paymentMethod: 'paypal',
        discount: discountInfo,
        status: subscription.status,
      };
      */
    } catch (error) {
      console.error('❌ PayPal subscription creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to create PayPal subscription: ${errorMessage}`,
        planId: input.planId,
      };
    }
  });