import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@/config/env';

export type AdminRole = 'admin' | 'superadmin' | null;

interface AdminCredentials {
  username: string;
  password: string;
  role: AdminRole;
}

interface AdminSettings {
  maintenanceMode?: boolean;
  debugMode?: boolean;
  apiRateLimit?: number;
  maxUploadSize?: number;
  autoApproveContent?: boolean;
  contentModeration?: boolean;
  enforceStrongPasswords?: boolean;
  twoFactorRequired?: boolean;
  sessionTimeout?: number;
  servicesModuleEnabled?: boolean;
}

interface AdminState {
  role: AdminRole;
  username: string;
  lastLogin: string | null;
  isAuthenticated: boolean;
  adminSettings: AdminSettings;
  directusToken: string | null;
  directusRefreshToken: string | null;
  directusUserId: string | null;
  directusRoleId: string | null;
  organizationId: number | null;
  
  // Actions
  setAdmin: (role: AdminRole, username?: string) => void;
  clearAdmin: () => void;
  logout: () => void;
  authenticateWithCredentials: (username: string, password: string) => Promise<{
    success: boolean;
    isSuperAdmin: boolean;
    role: AdminRole;
    userId?: string;
    userName?: string;
    userEmail?: string;
    accessToken?: string;
    refreshToken?: string;
  }>;
  updateAdminSettings: (settings: AdminSettings) => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  refreshAccessToken: () => Promise<string | null>;
  
  // Role checks
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  canAccessOrganizations: () => boolean;
  canManageUsers: () => boolean;
  canManageContent: () => boolean;
  canAccessDatabase: () => boolean;
  canAccessAPI: () => boolean;
  canManageMarketplace: () => boolean;
}

// Mock admin credentials - in production, this would be handled by backend
const ADMIN_CREDENTIALS: AdminCredentials[] = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin'
  },
  {
    username: 'superadmin',
    password: 'superadmin',
    role: 'superadmin'
  }
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      role: null,
      username: '',
      lastLogin: null,
      isAuthenticated: false,
      directusToken: null,
      directusRefreshToken: null,
      directusUserId: null,
      directusRoleId: null,
      organizationId: null,
      adminSettings: {
        maintenanceMode: false,
        debugMode: false,
        apiRateLimit: 100,
        maxUploadSize: 10,
        autoApproveContent: false,
        contentModeration: true,
        enforceStrongPasswords: true,
        twoFactorRequired: false,
        sessionTimeout: 30,
        servicesModuleEnabled: true
      },
      
      setAdmin: (role, username = '') => {
        console.log('🔐 Setting admin role:', role, 'username:', username);
        set({ 
          role, 
          username,
          isAuthenticated: role !== null,
          lastLogin: role !== null ? new Date().toISOString() : null
        });
      },
      
      clearAdmin: () => {
        console.log('🧹 Clearing admin store...');
        set({ 
          role: null, 
          username: '', 
          lastLogin: null, 
          isAuthenticated: false,
          directusToken: null,
          directusRefreshToken: null,
          directusUserId: null,
          directusRoleId: null,
          organizationId: null,
        });
      },
      
      logout: () => {
        console.log('🔄 Admin logout...');
        set({ 
          role: null, 
          username: '', 
          lastLogin: null, 
          isAuthenticated: false,
          directusToken: null,
          directusRefreshToken: null,
          directusUserId: null,
          directusRoleId: null,
          organizationId: null,
        });
      },
      
      authenticateWithCredentials: async (username: string, password: string) => {
        console.log('🔐 Authenticating admin:', username);
        
        try {
          // Try Directus authentication first
          const response = await fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: username,
              password: password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Directus authentication successful');
            
            // Get user details to check role
            const userResponse = await fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/users/me`, {
              headers: {
                'Authorization': `Bearer ${data.data.access_token}`,
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              const userRoleId = userData.data.role;
              const userOrgId = userData.data.organization_id;
              const userId = userData.data.id;
              const userEmail = userData.data.email;
              const userFirstName = userData.data.first_name || '';
              const userLastName = userData.data.last_name || '';
              const userName = userFirstName && userLastName ? `${userFirstName} ${userLastName}` : userEmail;
              
              console.log('👤 User role ID:', userRoleId);
              console.log('👤 User ID:', userId);
              console.log('👤 User Email:', userEmail);
              console.log('👤 User Name:', userName);
              console.log('🏢 Organization ID:', userOrgId);
              console.log('📋 Admin role ID:', ENV.EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID);
              console.log('📋 Organizer role ID:', ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID);
              
              const isAdministrator = userRoleId === ENV.EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID;
              const isOrganizer = userRoleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;
              
              if (isAdministrator || isOrganizer) {
                const now = new Date().toISOString();
                const role: AdminRole = isAdministrator ? 'superadmin' : 'admin';
                
                set({
                  role,
                  username: userEmail,
                  lastLogin: now,
                  isAuthenticated: true,
                  directusToken: data.data.access_token,
                  directusRefreshToken: data.data.refresh_token,
                  directusUserId: userId,
                  directusRoleId: userRoleId,
                  organizationId: userOrgId || null,
                });
                
                console.log('✅ Admin authenticated successfully:', role);
                
                return {
                  success: true,
                  isSuperAdmin: isAdministrator,
                  role,
                  userId,
                  userName,
                  userEmail,
                  accessToken: data.data.access_token,
                  refreshToken: data.data.refresh_token,
                };
              } else {
                console.log('❌ User is not an admin or organizer');
                return {
                  success: false,
                  isSuperAdmin: false,
                  role: null,
                };
              }
            }
          }
          
          // Fallback to mock credentials for testing
          console.log('🔄 Trying mock credentials...');
          const credential = ADMIN_CREDENTIALS.find(
            cred => cred.username === username && cred.password === password
          );
          
          if (credential) {
            const now = new Date().toISOString();
            set({
              role: credential.role,
              username: credential.username,
              lastLogin: now,
              isAuthenticated: true,
              directusToken: null,
              directusRefreshToken: null,
              directusUserId: null,
              directusRoleId: null,
              organizationId: null,
            });
            
            console.log('✅ Admin authenticated with mock credentials:', credential.role);
            
            return {
              success: true,
              isSuperAdmin: credential.role === 'superadmin',
              role: credential.role
            };
          }
        } catch (error) {
          console.error('❌ Authentication error:', error);
        }
        
        console.log('❌ Admin authentication failed');
        return {
          success: false,
          isSuperAdmin: false,
          role: null
        };
      },
      
      updateAdminSettings: (settings: AdminSettings) => {
        console.log('⚙️ Updating admin settings:', settings);
        set(state => ({
          adminSettings: {
            ...state.adminSettings,
            ...settings
          }
        }));
      },
      
      isAdmin: () => {
        const { role } = get();
        return role === 'admin' || role === 'superadmin';
      },
      
      isSuperAdmin: () => {
        const { role } = get();
        return role === 'superadmin';
      },
      
      canAccessOrganizations: () => {
        const { role } = get();
        return role === 'admin' || role === 'superadmin';
      },
      
      canManageUsers: () => {
        const { role } = get();
        return role === 'superadmin';
      },
      
      canManageContent: () => {
        const { role } = get();
        return role === 'admin' || role === 'superadmin';
      },
      
      canAccessDatabase: () => {
        const { role } = get();
        return role === 'superadmin';
      },
      
      canAccessAPI: () => {
        const { role } = get();
        return role === 'superadmin';
      },
      
      canManageMarketplace: () => {
        const { role } = get();
        return role === 'admin' || role === 'superadmin';
      },
      
      refreshAccessToken: async () => {
        const state = get();
        const refreshToken = state.directusRefreshToken;
        
        if (!refreshToken) {
          console.error('❌ No refresh token available for admin');
          state.logout();
          return null;
        }
        
        console.log('🔄 Refreshing admin access token...');
        
        try {
          const response = await fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
              mode: 'json',
            }),
          });
          
          if (!response.ok) {
            console.error('❌ Admin token refresh failed:', response.status);
            state.logout();
            return null;
          }
          
          const data = await response.json();
          const newAccessToken = data.data.access_token;
          const newRefreshToken = data.data.refresh_token;
          
          console.log('✅ Admin token refreshed successfully');
          
          set({
            directusToken: newAccessToken,
            directusRefreshToken: newRefreshToken,
          });
          
          return newAccessToken;
        } catch (error) {
          console.error('❌ Error refreshing admin token:', error);
          state.logout();
          return null;
        }
      },
      
      fetchWithAuth: async (url: string, options: RequestInit = {}) => {
        const state = get();
        let accessToken = state.directusToken;
        
        if (!accessToken) {
          throw new Error('No access token available');
        }
        
        const headers = {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        };
        
        let response = await fetch(url, {
          ...options,
          headers,
        });
        
        if (response.status === 401) {
          console.log('🔄 Got 401, attempting admin token refresh...');
          
          const newAccessToken = await state.refreshAccessToken();
          
          if (newAccessToken) {
            console.log('✅ Retrying request with new admin token...');
            
            const newHeaders = {
              ...options.headers,
              'Authorization': `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json',
            };
            
            response = await fetch(url, {
              ...options,
              headers: newHeaders,
            });
          } else {
            console.error('❌ Failed to refresh admin token');
          }
        }
        
        return response;
      },
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);