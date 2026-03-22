import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const disconnectIntegrationInput = z.object({
  integrationId: z.string(),
});

export const disconnectIntegrationProcedure = protectedProcedure
  .input(disconnectIntegrationInput)
  .mutation(async ({ input, ctx }) => {
    try {
      const { integrationId } = input;
      
      console.log('🔄 Disconnecting integration:', {
        integrationId,
        userId: ctx.user?.id || 'anonymous',
      });

      // Validate integration ID
      const validIntegrations = [
        'youversion', 'planning-center', 'spotify', 'facebook',
        'stripe', 'paypal', 'openai', 'anthropic', 'google', 'mistral'
      ];

      if (!validIntegrations.includes(integrationId)) {
        return {
          success: false,
          error: 'Invalid integration ID',
        };
      }

      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real app, you would:
      // 1. Revoke OAuth tokens
      // 2. Remove API keys from secure storage
      // 3. Update database to mark integration as disconnected
      // 4. Clean up any webhooks
      // 5. Remove any cached data

      console.log(`✅ ${integrationId} integration disconnected`);

      return {
        success: true,
        message: `${integrationId} disconnected successfully`,
        integrationId,
        disconnectedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Integration disconnection error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to disconnect integration: ${errorMessage}`,
      };
    }
  });