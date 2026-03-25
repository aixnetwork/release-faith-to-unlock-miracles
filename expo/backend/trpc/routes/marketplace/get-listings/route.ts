import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/trpc';
import type { ServiceListing, ServiceCategory } from '@/types';
import { mockServiceListings } from '@/mocks/marketplace';

const getListingsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  priceType: z.enum(['free', 'fixed', 'hourly', 'donation']).optional(),
  location: z.string().optional(),
  featured: z.boolean().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export const getListingsProcedure = protectedProcedure
  .input(getListingsSchema)
  .query(async ({ input }) => {
    console.log('Fetching service listings:', input);
    
    // Use the centralized mock data
    const allListings = mockServiceListings;
    
    // Apply filters
    let filteredListings = allListings.filter(listing => listing.isActive && listing.isApproved);
    
    if (input.category) {
      filteredListings = filteredListings.filter(listing => listing.category === input.category);
      console.log(`Filtered by category '${input.category}': ${filteredListings.length} results`);
    }
    
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filteredListings = filteredListings.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (input.priceType) {
      filteredListings = filteredListings.filter(listing => listing.priceType === input.priceType);
    }
    
    if (input.featured !== undefined) {
      filteredListings = filteredListings.filter(listing => listing.featured === input.featured);
    }
    
    // Sort by featured first, then by creation date
    filteredListings.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Pagination
    const startIndex = (input.page - 1) * input.limit;
    const endIndex = startIndex + input.limit;
    const paginatedListings = filteredListings.slice(startIndex, endIndex);
    
    return {
      success: true,
      listings: paginatedListings,
      pagination: {
        page: input.page,
        limit: input.limit,
        total: filteredListings.length,
        totalPages: Math.ceil(filteredListings.length / input.limit)
      }
    };
  });