export type ChurchAdminRole = 
  | 'owner' 
  | 'admin' 
  | 'content_manager' 
  | 'moderator' 
  | 'member';

export interface ChurchAdminPermissions {
  canManageMembers: boolean;
  canModerateContent: boolean;
  canCreateContent: boolean;
  canManageGroups: boolean;
  canManageMeetings: boolean;
  canManageFinances: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canManageRoles: boolean;
  canManageMarketplace: boolean;
  canManagePrayers: boolean;
  canManageTestimonials: boolean;
}

export const CHURCH_ADMIN_PERMISSIONS: Record<ChurchAdminRole, ChurchAdminPermissions> = {
  owner: {
    canManageMembers: true,
    canModerateContent: true,
    canCreateContent: true,
    canManageGroups: true,
    canManageMeetings: true,
    canManageFinances: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canManageRoles: true,
    canManageMarketplace: true,
    canManagePrayers: true,
    canManageTestimonials: true,
  },
  admin: {
    canManageMembers: true,
    canModerateContent: true,
    canCreateContent: true,
    canManageGroups: true,
    canManageMeetings: true,
    canManageFinances: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canManageRoles: false,
    canManageMarketplace: true,
    canManagePrayers: true,
    canManageTestimonials: true,
  },
  content_manager: {
    canManageMembers: false,
    canModerateContent: true,
    canCreateContent: true,
    canManageGroups: false,
    canManageMeetings: false,
    canManageFinances: false,
    canViewAnalytics: true,
    canManageSettings: false,
    canManageRoles: false,
    canManageMarketplace: false,
    canManagePrayers: true,
    canManageTestimonials: true,
  },
  moderator: {
    canManageMembers: false,
    canModerateContent: true,
    canCreateContent: false,
    canManageGroups: false,
    canManageMeetings: false,
    canManageFinances: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canManageRoles: false,
    canManageMarketplace: false,
    canManagePrayers: true,
    canManageTestimonials: false,
  },
  member: {
    canManageMembers: false,
    canModerateContent: false,
    canCreateContent: false,
    canManageGroups: false,
    canManageMeetings: false,
    canManageFinances: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canManageRoles: false,
    canManageMarketplace: false,
    canManagePrayers: false,
    canManageTestimonials: false,
  },
};

export interface ChurchMember {
  id: string;
  userId: string;
  organizationId: number;
  role: ChurchAdminRole;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive?: string;
  permissions: ChurchAdminPermissions;
}

export interface ContentModerationAction {
  id: string;
  contentType: 'prayer' | 'testimonial' | 'song' | 'quote' | 'promise' | 'comment';
  contentId: string;
  action: 'approve' | 'reject' | 'hide' | 'flag';
  reason?: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: string;
}

export interface ChurchContentStats {
  totalPrayers: number;
  activePrayers: number;
  answeredPrayers: number;
  totalTestimonials: number;
  approvedTestimonials: number;
  pendingTestimonials: number;
  totalSongs: number;
  totalQuotes: number;
  totalPromises: number;
  totalMembers: number;
  activeMembers: number;
  totalGroups: number;
  totalMeetings: number;
  upcomingMeetings: number;
}

export const getPermissions = (role: ChurchAdminRole): ChurchAdminPermissions => {
  return CHURCH_ADMIN_PERMISSIONS[role];
};

export const hasPermission = (
  role: ChurchAdminRole, 
  permission: keyof ChurchAdminPermissions
): boolean => {
  return CHURCH_ADMIN_PERMISSIONS[role][permission];
};
