import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

const revokeAPIKeyInput = z.object({
  keyId: z.string().min(1, 'API key ID is required')
});

export const revokeAPIKeyProcedure = protectedProcedure
  .input(revokeAPIKeyInput)
  .mutation(async ({ input }: { input: z.infer<typeof revokeAPIKeyInput> }) => {
    // In a real implementation, this would revoke the API key in the database
    // For now, simulate the revocation
    
    return {
      success: true,
      keyId: input.keyId,
      revokedAt: new Date().toISOString(),
      message: 'API key revoked successfully'
    };
  });