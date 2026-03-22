import { publicProcedure } from '../../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const demoLoginProcedure = publicProcedure
  .input(z.object({
    email: z.string(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const { email, password } = input;
      const normalizedEmail = email.toLowerCase().trim();
      
      const isDynamicDemo = normalizedEmail.endsWith('@example.com') || normalizedEmail.endsWith('@test.com');
      
      // Allow demo password or any password for dynamic demo accounts
      if (email === 'family@gmail.com' || email === 'church@gmail.com') {
         if (password !== 'Prosper$18') {
           throw new TRPCError({
             code: 'UNAUTHORIZED',
             message: 'Invalid credentials',
           });
         }
      } else if (password !== 'demo123') {
        // If not standard demo password, check if it's dynamic demo which allows any password (for easier testing)
        // or check if it meets length requirement
        if (!isDynamicDemo || password.length === 0) {
           throw new TRPCError({
             code: 'UNAUTHORIZED',
             message: 'Invalid credentials',
           });
        }
      }

      const demoAccounts: Record<string, {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        plan: string;
        organizationId?: number;
        organizationRole?: 'admin' | 'member';
        organizationName?: string;
        roleId?: string;
      }> = {
        'john.doe@example.com': {
          id: 'demo-user-individual-001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          plan: 'individual',
        },
        'admin@admin.com': {
          id: 'demo-user-admin-generic',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@admin.com',
          plan: 'premium',
        },
        'test@test.com': {
          id: 'demo-user-test-generic',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@test.com',
          plan: 'premium',
        },
        'family.leader@example.com': {
          id: 'demo-user-family-001',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'family.leader@example.com',
          plan: 'group_family',
          organizationId: 888,
          organizationRole: 'admin',
          organizationName: 'Johnson Family',
          roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
        },
        'admin@gracechurch.com': {
          id: 'demo-user-church-001',
          first_name: 'Pastor',
          last_name: 'Michael',
          email: 'admin@gracechurch.com',
          plan: 'large_church',
          organizationId: 999,
          organizationRole: 'admin',
          organizationName: 'Grace Community Church',
          roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
        },
        'family@gmail.com': {
          id: 'demo-user-family-custom',
          first_name: 'Prosper',
          last_name: 'Family',
          email: 'family@gmail.com',
          plan: 'group_family',
          organizationId: 889,
          organizationRole: 'admin',
          organizationName: 'Prosper Family',
          roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
        },
        'church@gmail.com': {
          id: 'demo-user-church-custom',
          first_name: 'Church',
          last_name: 'Admin',
          email: 'church@gmail.com',
          plan: 'org_large',
          organizationId: 900,
          organizationRole: 'admin',
          organizationName: 'Prosper Church',
          roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
        },
      };

      let user = demoAccounts[normalizedEmail];

      if (!user) {
        if (isDynamicDemo) {
           // Create dynamic user
           const nameParts = normalizedEmail.split('@')[0].split('.');
           user = {
             id: `demo-user-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`,
             first_name: nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Demo',
             last_name: nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User',
             email: normalizedEmail,
             plan: 'individual',
           };
        } else {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          });
        }
      }

      const accessToken = `demo-token-${user.id}-${Date.now()}`;
      const refreshToken = `demo-refresh-${user.id}-${Date.now()}`;

      return {
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            plan: user.plan,
            organizationId: user.organizationId,
            organizationRole: user.organizationRole,
            roleId: user.roleId,
          },
          organization: user.organizationId ? {
            id: user.organizationId,
            name: user.organizationName || 'Grace Community Church',
            city: 'Austin',
            plan: user.plan,
            status: 'active' as const,
            organizer_id: user.id,
            created_at: new Date().toISOString(),
          } : null,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Demo login error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
