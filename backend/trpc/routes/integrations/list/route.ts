import { publicProcedure } from '../../../trpc';

export const listIntegrationsProcedure = publicProcedure
  .query(async () => {
    try {
      console.log('Fetching integrations');
      
      // Mock integrations data
      const integrations = [
        {
          id: 'openai',
          name: 'OpenAI',
          type: 'ai',
          isConnected: false,
          connectedAt: null,
          settings: {},
        },
        {
          id: 'stripe',
          name: 'Stripe',
          type: 'payment',
          isConnected: false,
          connectedAt: null,
          settings: {},
        },
        {
          id: 'paypal',
          name: 'PayPal',
          type: 'payment',
          isConnected: false,
          connectedAt: null,
          settings: {},
        },
      ];
      
      return { integrations };
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw new Error('Failed to fetch integrations');
    }
  });