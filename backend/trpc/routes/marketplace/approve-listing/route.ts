import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/trpc';
import type { ServiceListing, ServiceApprovalStatus } from '@/types';
import { mockServiceListings } from '@/mocks/marketplace';

const approveListingSchema = z.object({
  listingId: z.string(),
  action: z.enum(['approve', 'reject', 'request_changes']),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  changesRequested: z.string().optional(),
});

export const approveListingProcedure = protectedProcedure
  .input(approveListingSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('Processing listing approval:', input);
    
    // Mock admin check (in real app, check user role)
    const isAdmin = true; // ctx.user?.role === 'admin'
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Find the listing
    const listingIndex = mockServiceListings.findIndex(l => l.id === input.listingId);
    if (listingIndex === -1) {
      throw new Error('Service listing not found');
    }
    
    const listing = mockServiceListings[listingIndex];
    
    // Update listing based on action
    const now = new Date().toISOString();
    const adminId = 'admin-1'; // ctx.user?.id
    
    let approvalStatus: ServiceApprovalStatus;
    let isApproved = false;
    
    switch (input.action) {
      case 'approve':
        approvalStatus = 'approved';
        isApproved = true;
        break;
      case 'reject':
        approvalStatus = 'rejected';
        isApproved = false;
        break;
      case 'request_changes':
        approvalStatus = 'changes_requested';
        isApproved = false;
        break;
      default:
        throw new Error('Invalid action');
    }
    
    // Update the listing
    const updatedListing: ServiceListing = {
      ...listing,
      isApproved,
      approvalStatus,
      adminNotes: input.adminNotes,
      rejectionReason: input.rejectionReason,
      changesRequested: input.changesRequested,
      reviewedBy: adminId,
      reviewedAt: now,
      updatedAt: now,
    };
    
    // Update in mock data
    mockServiceListings[listingIndex] = updatedListing;
    
    console.log(`Listing ${input.listingId} ${input.action}d successfully`);
    
    return {
      success: true,
      listing: updatedListing,
      message: `Service listing ${input.action}d successfully`
    };
  });

export const getPendingListingsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log('Fetching pending service listings for admin review');
    
    // Mock admin check
    const isAdmin = true; // ctx.user?.role === 'admin'
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Filter listings that need review
    const pendingListings = mockServiceListings.filter(listing => 
      listing.approvalStatus === 'pending_approval' || 
      listing.approvalStatus === 'changes_requested'
    );
    
    // Sort by creation date (oldest first for review queue)
    pendingListings.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return {
      success: true,
      listings: pendingListings,
      total: pendingListings.length
    };
  });

export const getListingHistoryProcedure = protectedProcedure
  .input(z.object({ listingId: z.string() }))
  .query(async ({ input, ctx }) => {
    console.log('Fetching listing history:', input.listingId);
    
    // Mock admin check
    const isAdmin = true; // ctx.user?.role === 'admin'
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Find the listing
    const listing = mockServiceListings.find(l => l.id === input.listingId);
    if (!listing) {
      throw new Error('Service listing not found');
    }
    
    // Mock history data (in real app, this would come from audit logs)
    const history = [
      {
        id: 'history-1',
        action: 'created',
        timestamp: listing.createdAt,
        userId: listing.providerId,
        userName: listing.provider.name,
        details: 'Service listing created'
      },
      ...(listing.reviewedAt ? [{
        id: 'history-2',
        action: listing.approvalStatus,
        timestamp: listing.reviewedAt,
        userId: listing.reviewedBy || 'admin-1',
        userName: 'Admin User',
        details: listing.adminNotes || listing.rejectionReason || listing.changesRequested || 'No notes provided'
      }] : [])
    ];
    
    return {
      success: true,
      listing,
      history
    };
  });