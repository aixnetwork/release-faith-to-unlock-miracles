import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/trpc';
import type { MarketplaceSettings, ServiceCategory } from '@/types';

const updateMarketplaceSettingsSchema = z.object({
  enabled: z.boolean(),
  commissionRate: z.number().min(0).max(100),
  requireApproval: z.boolean(),
  allowedCategories: z.array(z.enum([
    'spiritual-guidance',
    'counseling',
    'music-ministry',
    'event-planning',
    'education',
    'technology',
    'creative-services',
    'business-consulting',
    'financial-services',
    'health-wellness',
    'childcare',
    'home-repair',
    'cleaning',
    'transportation',
    'tutoring',
    'other'
  ] as const)),
  featuredListingPrice: z.number().min(0),
  maxImagesPerListing: z.number().min(1).max(10),
  autoApproveVerifiedProviders: z.boolean(),
  enableBookings: z.boolean(),
  enablePayments: z.boolean(),
  enableReviews: z.boolean(),
  moderationEnabled: z.boolean(),
});

export const updateMarketplaceSettingsProcedure = protectedProcedure
  .input(updateMarketplaceSettingsSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('🏪 [Backend] Updating marketplace settings:', input);
    
    // Check if user is admin (in real app, check ctx.user.role)
    const isAdmin = true; // Mock admin check
    
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const updatedSettings: MarketplaceSettings = {
      enabled: input.enabled,
      commissionRate: input.commissionRate,
      requireApproval: input.requireApproval,
      allowedCategories: input.allowedCategories,
      featuredListingPrice: input.featuredListingPrice,
      maxImagesPerListing: input.maxImagesPerListing,
      autoApproveVerifiedProviders: input.autoApproveVerifiedProviders,
      enableBookings: input.enableBookings,
      enablePayments: input.enablePayments,
      enableReviews: input.enableReviews,
      moderationEnabled: input.moderationEnabled,
    };
    
    // In a real app, save to database
    console.log('✅ [Backend] Updated marketplace settings:', updatedSettings);
    
    return {
      success: true,
      settings: updatedSettings
    };
  });

export const getMarketplaceSettingsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log('🏪 [Backend] Fetching marketplace settings');
    console.log('📄 [Backend] Context:', {
      hasUserId: !!ctx.user?.id,
      hasUserEmail: !!ctx.user?.email,
      isAdmin: ctx.user?.isAdmin,
    });
    
    // Check if user is admin (in real app, check ctx.user.role)
    const isAdmin = true; // Mock admin check
    
    if (!isAdmin) {
      console.log('❌ [Backend] Unauthorized access attempt');
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Mock settings - in real app, fetch from database
    const settings: MarketplaceSettings = {
      enabled: true,
      commissionRate: 5,
      requireApproval: true,
      allowedCategories: [
        'spiritual-guidance',
        'counseling',
        'music-ministry',
        'event-planning',
        'education',
        'technology',
        'creative-services',
        'business-consulting',
        'financial-services',
        'health-wellness',
        'childcare',
        'home-repair',
        'cleaning',
        'transportation',
        'tutoring',
        'other'
      ],
      featuredListingPrice: 25,
      maxImagesPerListing: 5,
      autoApproveVerifiedProviders: true,
      enableBookings: true,
      enablePayments: true,
      enableReviews: true,
      moderationEnabled: true,
    };
    
    console.log('✅ [Backend] Returning marketplace settings:', settings);
    
    return {
      success: true,
      settings
    };
  });