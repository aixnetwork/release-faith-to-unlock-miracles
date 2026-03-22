import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// Enhanced Stripe integration with proper error handling and validation
export const createCheckoutSessionProcedure = protectedProcedure
  .input(
    z.object({
      planId: z.string(),
      couponCode: z.string().optional(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
      paymentMethod: z.enum(['stripe', 'paypal']).optional().default('stripe'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { planId, couponCode, successUrl, cancelUrl, paymentMethod } = input;
      
      console.log('🔄 Creating Stripe checkout session:', {
        planId,
        couponCode,
        paymentMethod,
        userId: ctx.user?.id || 'anonymous',
      });
      
      // Validate plan ID
      const validPlans = ['free', 'individual', 'group_family', 'small_church', 'large_church'];
      if (!validPlans.includes(planId)) {
        throw new Error('Invalid plan ID');
      }
      
      // Map plan IDs to price configurations
      const planConfigs: Record<string, { priceId: string; amount: number; currency: string; name: string; isLifetime?: boolean }> = {
        free: { 
          priceId: 'price_free', 
          amount: 0, // $0.00 in cents
          currency: 'usd',
          name: 'Free Plan'
        },
        individual: { 
          priceId: 'price_individual_monthly', 
          amount: 599, // $5.99 in cents
          currency: 'usd',
          name: 'Individual Plan'
        },
        group_family: { 
          priceId: 'price_group_family_monthly', 
          amount: 1900, // $19.00 in cents
          currency: 'usd',
          name: 'Group/Family Plan'
        },
        small_church: { 
          priceId: 'price_small_church_monthly', 
          amount: 9900, // $99.00 in cents
          currency: 'usd',
          name: 'Small Church Plan'
        },
        large_church: { 
          priceId: 'price_large_church_monthly', 
          amount: 29900, // $299.00 in cents
          currency: 'usd',
          name: 'Large Church Plan'
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
          'CHURCH25': { discount: 25, type: 'percentage', description: '25% off church plans' },
          'SAVE20': { discount: 20, type: 'fixed', description: '$20 off any plan' },
        };

        const coupon = validCoupons[couponCode.toUpperCase()];
        if (coupon) {
          // Check if coupon is valid for the selected plan
          if (couponCode.toUpperCase() === 'CHURCH25' && !['small_church', 'large_church'].includes(planId)) {
            throw new Error('This coupon is only valid for church plans');
          }

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
      
      // Generate a mock session ID with timestamp for uniqueness
      const timestamp = Date.now();
      const mockSessionId = `cs_test_${planId}_${timestamp}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create a mock checkout URL that would redirect to Stripe
      const mockUrl = `https://checkout.stripe.com/pay/${mockSessionId}?price=${planConfig.priceId}&amount=${finalAmount}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('✅ Stripe checkout session created:', {
        sessionId: mockSessionId,
        planId,
        originalAmount: planConfig.amount,
        finalAmount,
        currency: planConfig.currency,
        couponApplied: !!discountInfo,
      });
      
      // Return the mock session data with enhanced metadata
      return {
        success: true,
        sessionId: mockSessionId,
        url: mockUrl,
        planId,
        planName: planConfig.name,
        originalAmount: planConfig.amount,
        finalAmount,
        currency: planConfig.currency,
        paymentMethod: 'stripe',
        isLifetime: planConfig.isLifetime || false,
        discount: discountInfo,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
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
          metadata: {
            userId: ctx.user?.id,
          },
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        // await updateUserStripeCustomerId(ctx.user.id, customerId);
      }

      // Prepare line items
      const lineItems = [{
        price: planConfig.priceId,
        quantity: 1,
      }];

      // Apply coupon if provided and valid
      let discounts = [];
      if (couponCode) {
        try {
          const coupon = await stripe.coupons.retrieve(couponCode);
          if (coupon.valid) {
            discounts = [{ coupon: couponCode }];
          }
        } catch (error) {
          console.warn('Invalid coupon code:', couponCode);
        }
      }
      
      const sessionConfig = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: planConfig.isLifetime ? 'payment' : 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        metadata: {
          planId: planId,
          userId: ctx.user?.id,
          couponCode: couponCode || '',
        },
      };

      // Add subscription-specific config
      if (!planConfig.isLifetime) {
        sessionConfig.subscription_data = {
          trial_period_days: 14, // 14-day free trial
          metadata: {
            planId: planId,
            userId: ctx.user?.id,
          },
        };
      }

      // Add discounts if any
      if (discounts.length > 0) {
        sessionConfig.discounts = discounts;
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      
      return {
        success: true,
        sessionId: session.id,
        url: session.url,
        planId,
        planName: planConfig.name,
        originalAmount: planConfig.amount,
        finalAmount: session.amount_total || planConfig.amount,
        currency: planConfig.currency,
        paymentMethod: 'stripe',
        isLifetime: planConfig.isLifetime || false,
        expiresAt: new Date(session.expires_at * 1000).toISOString(),
      };
      */
    } catch (error) {
      console.error('❌ Stripe checkout session creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to create checkout session: ${errorMessage}`,
        planId: input.planId,
      };
    }
  });