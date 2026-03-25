import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

const addPaymentMethodInput = z.object({
  provider: z.enum(['stripe', 'paypal']),
  paymentMethodId: z.string().optional(), // For Stripe
  email: z.string().email().optional(), // For PayPal
  setAsDefault: z.boolean().optional().default(false),
});

export const addPaymentMethodProcedure = protectedProcedure
  .input(addPaymentMethodInput)
  .mutation(async ({ input, ctx }) => {
    try {
      const { provider, paymentMethodId, email, setAsDefault } = input;
      
      console.log('🔄 Adding payment method:', {
        provider,
        paymentMethodId,
        email,
        setAsDefault,
        userId: ctx.user?.id || 'anonymous',
      });
      
      // Validate input based on provider
      if (provider === 'stripe' && !paymentMethodId) {
        throw new Error('Payment method ID is required for Stripe');
      }
      
      if (provider === 'paypal' && !email) {
        throw new Error('Email is required for PayPal');
      }
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock payment method data
      let newPaymentMethod;
      
      if (provider === 'stripe') {
        newPaymentMethod = {
          id: `pm_stripe_${Date.now()}`,
          type: 'card' as const,
          provider: 'stripe' as const,
          last4: '4242', // Mock data
          brand: 'Visa',
          expMonth: 12,
          expYear: 2027,
          isDefault: setAsDefault,
          createdAt: new Date().toISOString(),
        };
      } else {
        newPaymentMethod = {
          id: `pm_paypal_${Date.now()}`,
          type: 'paypal' as const,
          provider: 'paypal' as const,
          email: email!,
          isDefault: setAsDefault,
          createdAt: new Date().toISOString(),
        };
      }
      
      console.log('✅ Payment method added:', {
        id: newPaymentMethod.id,
        provider,
        isDefault: setAsDefault,
        userId: ctx.user?.id,
      });
      
      return {
        success: true,
        paymentMethod: newPaymentMethod,
        message: `${provider === 'stripe' ? 'Card' : 'PayPal account'} added successfully`,
      };
      
      /* 
      // Real implementation would look like this:
      
      if (provider === 'stripe') {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: ctx.user?.stripeCustomerId,
        });
        
        // Set as default if requested
        if (setAsDefault) {
          await stripe.customers.update(ctx.user?.stripeCustomerId, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
        }
        
        // Retrieve the payment method details
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        
        return {
          success: true,
          paymentMethod: {
            id: paymentMethod.id,
            type: 'card',
            provider: 'stripe',
            last4: paymentMethod.card.last4,
            brand: paymentMethod.card.brand,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
            isDefault: setAsDefault,
            createdAt: new Date(paymentMethod.created * 1000).toISOString(),
          },
        };
      } else {
        // For PayPal, store the email in your database
        // PayPal doesn't store payment methods the same way
        const paypalPaymentMethod = await storePayPalPaymentMethodInDB({
          userId: ctx.user?.id,
          email,
          isDefault: setAsDefault,
        });
        
        return {
          success: true,
          paymentMethod: {
            id: paypalPaymentMethod.id,
            type: 'paypal',
            provider: 'paypal',
            email,
            isDefault: setAsDefault,
            createdAt: paypalPaymentMethod.createdAt,
          },
        };
      }
      */
    } catch (error) {
      console.error('❌ Error adding payment method:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to add payment method: ${errorMessage}`,
      };
    }
  });