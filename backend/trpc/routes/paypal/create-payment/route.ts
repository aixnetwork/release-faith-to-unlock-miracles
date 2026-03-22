import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const createPaymentInput = z.object({
  planId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
  paymentType: z.enum(['subscription', 'one-time']).default('one-time'),
  couponCode: z.string().optional(),
});

export const createPaymentProcedure = protectedProcedure
  .input(createPaymentInput)
  .mutation(async ({ input, ctx }) => {
    try {
      const { planId, amount, currency, description, returnUrl, cancelUrl, paymentType, couponCode } = input;
      
      console.log('🔄 Creating PayPal payment:', {
        planId,
        amount,
        currency,
        paymentType,
        couponCode,
        userId: ctx.user?.id || 'anonymous',
      });
      
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Apply coupon discount if provided
      let finalAmount = amount;
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
          if (couponCode.toUpperCase() === 'CHURCH25' && planId && !['small_church', 'large_church'].includes(planId || '')) {
            throw new Error('This coupon is only valid for church plans');
          }

          const originalAmount = amount;
          if (coupon.type === 'percentage') {
            finalAmount = Math.round(amount * (1 - coupon.discount / 100));
          } else {
            finalAmount = Math.max(0, amount - (coupon.discount * 100)); // Convert dollars to cents
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
      
      // Generate a mock PayPal payment ID
      const timestamp = Date.now();
      const paymentId = `PAY-${timestamp}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Create mock approval URL that would redirect to PayPal
      const approvalUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${paymentId}&amount=${(finalAmount / 100).toFixed(2)}&currency=${currency}&return=${encodeURIComponent(returnUrl)}&cancel_return=${encodeURIComponent(cancelUrl)}`;
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Plan-specific descriptions
      const planDescriptions: Record<string, string> = {
        free: 'Free Plan - No Payment Required',
        individual: 'Individual Plan Subscription - Monthly',
        group_family: 'Group/Family Plan Subscription - Monthly',
        small_church: 'Small Church Plan Subscription - Monthly',
        large_church: 'Large Church Plan Subscription - Monthly',
      };
      
      const finalDescription = description || (planId ? planDescriptions[planId] : 'Payment') || 'Payment';
      
      console.log('✅ PayPal payment created:', {
        paymentId,
        originalAmount: amount,
        finalAmount,
        currency,
        paymentType,
        couponApplied: !!discountInfo,
      });
      
      return {
        success: true,
        paymentId,
        approvalUrl,
        originalAmount: amount,
        finalAmount,
        currency,
        description: finalDescription,
        paymentType,
        planId,
        discount: discountInfo,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
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
      
      // Create payment request
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      
      const orderRequest = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amountInDollars,
          },
          description: finalDescription,
        }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: 'Faith App',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
        },
      };

      // Add discount information to description if applicable
      if (discountInfo) {
        orderRequest.purchase_units[0].description += ` (${discountInfo.description})`;
      }

      request.requestBody(orderRequest);
      
      const response = await client.execute(request);
      const order = response.result;
      
      // Find approval URL
      const approvalLink = order.links.find(link => link.rel === 'approve');
      
      return {
        success: true,
        paymentId: order.id,
        approvalUrl: approvalLink?.href,
        originalAmount: amount,
        finalAmount,
        currency,
        description: finalDescription,
        paymentType,
        planId,
        discount: discountInfo,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      };
      */
    } catch (error) {
      console.error('❌ PayPal payment creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to create PayPal payment: ${errorMessage}`,
        planId: input.planId,
      };
    }
  });