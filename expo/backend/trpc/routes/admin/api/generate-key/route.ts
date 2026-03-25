import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

const generateAPIKeyInput = z.object({
  name: z.string().min(1, 'API key name is required'),
  permissions: z.array(z.string()).optional()
});

export const generateAPIKeyProcedure = protectedProcedure
  .input(generateAPIKeyInput)
  .mutation(async ({ input }: { input: z.infer<typeof generateAPIKeyInput> }) => {
    // In a real implementation, this would generate a secure API key
    // For now, generate a mock key
    
    const apiKey = `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      success: true,
      apiKey: {
        id: Date.now().toString(),
        name: input.name,
        key: apiKey,
        requests: 0,
        lastUsed: null,
        status: 'active',
        createdAt: new Date().toISOString()
      },
      message: 'API key generated successfully'
    };
  });