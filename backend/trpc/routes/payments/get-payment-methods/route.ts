import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// Get all payment methods for a user
export const getPaymentMethodsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      console.log('🔄 Fetching payment methods for user:', ctx.user?.id || 'anonymous');
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock payment methods data
      const paymentMethods = [
        {
          id: 'pm_stripe_1',
          type: 'card' as const,
          provider: 'stripe' as const,
          last4: '4242',
          brand: 'Visa',
          expMonth: 12,
          expYear: 2025,
          isDefault: true,
          createdAt: '2025-01-15T10:30:00Z',
        },
        {
          id: 'pm_paypal_1',
          type: 'paypal' as const,
          provider: 'paypal' as const,
          email: ctx.user?.email || 'user@example.com',
          isDefault: false,
          createdAt: '2025-02-01T14:20:00Z',
        },
        {
          id: 'pm_stripe_2',
          type: 'card' as const,
          provider: 'stripe' as const,
          last4: '1234',
          brand: 'Mastercard',
          expMonth: 8,
          expYear: 2026,
          isDefault: false,
          createdAt: '2025-02-10T09:15:00Z',
        },
      ];
      
      console.log('✅ Payment methods fetched:', {
        count: paymentMethods.length,
        userId: ctx.user?.id,
      });
      
      return {
        success: true,
        paymentMethods,
        defaultPaymentMethod: paymentMethods.find(pm => pm.isDefault),
      };
      
      /* 
      // Real implementation would look like this:
      
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paypal = require('@paypal/checkout-server-sdk');
      
      // Get Stripe payment methods
      const stripePaymentMethods = await stripe.paymentMethods.list({
        customer: ctx.user?.stripeCustomerId,
        type: 'card',
      });
      
      // Get PayPal payment methods (if stored)
      // PayPal doesn't store payment methods the same way, so this would be from your database
      const paypalPaymentMethods = await getPayPalPaymentMethodsFromDB(ctx.user?.id);
      
      const allPaymentMethods = [
        ...stripePaymentMethods.data.map(pm => ({
          id: pm.id,
          type: 'card',
          provider: 'stripe',
          last4: pm.card.last4,
          brand: pm.card.brand,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
          isDefault: pm.id === ctx.user?.defaultPaymentMethodId,
          createdAt: new Date(pm.created * 1000).toISOString(),
        })),
        ...paypalPaymentMethods.map(pm => ({
          id: pm.id,
          type: 'paypal',
          provider: 'paypal',
          email: pm.email,
          isDefault: pm.id === ctx.user?.defaultPaymentMethodId,
          createdAt: pm.createdAt,
        }))
      ];
      
      return {
        success: true,
        paymentMethods: allPaymentMethods,
        defaultPaymentMethod: allPaymentMethods.find(pm => pm.isDefault),
      };
      */
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to fetch payment methods: ${errorMessage}`,
        paymentMethods: [],
      };
    }
  });