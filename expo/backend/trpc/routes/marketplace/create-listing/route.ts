import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/trpc';
import type { ServiceListing, ServiceCategory, PriceType } from '../../../../../types';

const createListingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum([
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
  ] as const),
  priceType: z.enum(['free', 'fixed', 'hourly', 'donation'] as const),
  price: z.number().optional(),
  currency: z.string().default('USD'),
  duration: z.number().optional(),
  images: z.array(z.string()).max(5),
  tags: z.array(z.string()).max(10),
  location: z.object({
    type: z.enum(['online', 'in-person', 'hybrid']),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  availability: z.object({
    days: z.array(z.string()),
    timeSlots: z.array(z.object({
      start: z.string(),
      end: z.string()
    }))
  }).optional(),
  contactMethod: z.enum(['in-app', 'email', 'phone']),
  contactValue: z.string().optional(),
});

export const createListingProcedure = protectedProcedure
  .input(createListingSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('Creating service listing:', input);
    
    // Check if marketplace is enabled
    const marketplaceSettings = {
      enabled: true, // This would come from admin settings
      requireApproval: true,
      autoApproveVerifiedProviders: true,
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
      ] as ServiceCategory[]
    };
    
    if (!marketplaceSettings.enabled) {
      throw new Error('Marketplace is currently disabled');
    }
    
    if (!marketplaceSettings.allowedCategories.includes(input.category)) {
      throw new Error('This service category is not allowed');
    }
    
    // Validate price for non-free services
    if (input.priceType !== 'free' && input.priceType !== 'donation' && !input.price) {
      throw new Error('Price is required for fixed and hourly services');
    }
    
    // Mock user data (in real app, get from ctx.user)
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 23,
      verified: true
    };
    
    const shouldAutoApprove = !marketplaceSettings.requireApproval || 
      (marketplaceSettings.autoApproveVerifiedProviders && mockUser.verified);
    
    const newListing: ServiceListing = {
      id: `listing-${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category,
      priceType: input.priceType,
      price: input.price,
      currency: input.currency,
      duration: input.duration,
      providerId: mockUser.id,
      provider: mockUser,
      images: input.images,
      tags: input.tags,
      isActive: true,
      isApproved: shouldAutoApprove,
      approvalStatus: shouldAutoApprove ? 'approved' : 'pending_approval',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: input.location,
      availability: input.availability,
      contactMethod: input.contactMethod,
      contactValue: input.contactValue,
      rating: 0,
      reviewCount: 0
    };
    
    // Add to mock data for testing
    const { mockServiceListings } = await import('../../../../../mocks/marketplace');
    mockServiceListings.push(newListing);
    
    console.log('Created listing:', newListing);
    
    return {
      success: true,
      service: newListing,
      message: shouldAutoApprove 
        ? 'Service listing created and approved automatically!' 
        : 'Service listing submitted for approval. You will be notified once it is reviewed.'
    };
  });