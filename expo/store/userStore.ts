import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPrayerPlan, Achievement, Badge } from '@/types';

export type PlanType = 'free' | 'individual' | 'individual_yearly' | 'group_family' | 'small_church' | 'large_church' | 'business_addon' | 'premium' | 'pro' | 'lifetime' | 'org_small' | 'org_medium' | 'org_large' | 'church';

export interface User {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  plan: PlanType;
  isAdmin?: boolean;
  organizationId?: number;
  organizationRole?: 'admin' | 'member';
  roleId?: string;
  accessToken?: string;
  refreshToken?: string;
  avatarText?: string;
}

export interface Organization {
  id: number;
  name: string;
  city?: string;
  plan: 'small_church' | 'large_church' | 'org_small' | 'org_medium' | 'org_large';
  memberCount: number;
  maxMembers: number;
  createdAt: string;
  adminId: string;
  status?: string;
  organizerId?: string;
}

export interface Integration {
  id: string;
  isConnected: boolean;
  settings?: Record<string, any>;
  connectedAt?: string;
}

export interface PrayerStreak {
  currentStreak: number;
  longestStreak: number;
  lastPrayerDate?: string;
  streakStartDate?: string;
}

export interface UserSettings {
  language: string;
  notifications: boolean;
  mentalHealthReminders: boolean;
  shareActivity?: boolean;
  showProfile?: boolean;
  allowDataCollection?: boolean;
  privacy: {
    profileVisible: boolean;
    prayersVisible: boolean;
    testimonialsVisible: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

interface UserState {
  // Hydration state
  _hasHydrated: boolean;
  
  // Auth state
  isLoggedIn: boolean;
  user: User | null;
  
  // Convenience getters
  name: string;
  email: string;
  plan: PlanType;
  isAdmin: boolean;
  
  // Organization state
  organization: Organization | null;
  
  // Settings
  settings: UserSettings;
  
  // Integrations
  integrations: Integration[];
  
  // Prayer streak
  prayerStreak: PrayerStreak;
  
  // Prayer plans
  activePrayerPlans: UserPrayerPlan[];
  
  // Achievements and gamification
  achievements: Achievement[];
  badges: Badge[];
  totalPoints: number;
  level: number;
  
  // Actions
  login: (userData: Partial<User> & { name: string; email: string; plan: PlanType }) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updatePlan: (newPlan: PlanType) => void;
  setPlan: (plan: PlanType) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  createOrganization: (name: string, plan: 'small_church' | 'large_church' | 'org_small' | 'org_medium' | 'org_large') => void;
  updateOrganization: (updates: Partial<Organization>) => void;
  setOrganization: (organization: Organization | null) => void;
  updateIntegration: (integrationId: string, updates: Partial<Integration>) => void;
  updatePrayerStreak: () => void;
  joinPrayerPlan: (planId: string) => void;
  leavePrayerPlan: (planId: string) => void;
  updatePrayerPlanProgress: (planId: string, day: number, completed: boolean, prayerDayId?: string, totalDays?: number, notes?: string, rating?: number) => Promise<void>;
}

const defaultSettings: UserSettings = {
  language: 'en',
  notifications: true,
  mentalHealthReminders: false,
  shareActivity: true,
  showProfile: true,
  allowDataCollection: true,
  privacy: {
    profileVisible: true,
    prayersVisible: true,
    testimonialsVisible: true,
  },
  theme: 'light',
};



const safeStateUpdate = (updateFn: () => void) => {
  try {
    updateFn();
  } catch (error) {
    console.error('State update failed:', error);
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state with safe defaults
      _hasHydrated: false,
      isLoggedIn: false,
      user: null,
      name: '',
      email: '',
      plan: 'individual' as PlanType,
      isAdmin: false,
      organization: null,
      settings: { ...defaultSettings },
      integrations: [],
      prayerStreak: {
        currentStreak: 0,
        longestStreak: 0,
        lastPrayerDate: undefined,
        streakStartDate: undefined,
      },
      activePrayerPlans: [],
      achievements: [],
      badges: [],
      totalPoints: 0,
      level: 1,
      
      // Actions
      login: (userData) => {
        safeStateUpdate(() => {
          const user: User = {
            id: userData.id || Math.random().toString(36).substring(2, 15),
            ...userData,
          };
          
          set({
            isLoggedIn: true,
            user,
            name: user.name || '',
            email: user.email || '',
            plan: user.plan || 'individual',
            isAdmin: user.isAdmin || false,
          });
        });
      },
      
      logout: () => {
        safeStateUpdate(() => {
          set({
            isLoggedIn: false,
            user: null,
            name: '',
            email: '',
            plan: 'individual',
            isAdmin: false,
            organization: null,
            integrations: [],
            prayerStreak: {
              currentStreak: 0,
              longestStreak: 0,
              lastPrayerDate: undefined,
              streakStartDate: undefined,
            },
            activePrayerPlans: [],
            achievements: [],
            badges: [],
            totalPoints: 0,
            level: 1,
          });
        });
      },
      
      updateProfile: (updates) => {
        safeStateUpdate(() => {
          const currentUser = get().user;
          if (!currentUser) return;
          
          const updatedUser = { ...currentUser, ...updates };
          set({
            user: updatedUser,
            name: updatedUser.name || '',
            email: updatedUser.email || '',
            plan: updatedUser.plan || 'individual',
            isAdmin: updatedUser.isAdmin || false,
          });
        });
      },
      
      updatePlan: (newPlan) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, plan: newPlan };
        set({
          user: updatedUser,
          plan: newPlan,
        });
      },
      
      setPlan: (plan) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, plan };
        set({
          user: updatedUser,
          plan,
        });
      },
      
      updateSettings: (updates) => {
        safeStateUpdate(() => {
          const currentSettings = get().settings || defaultSettings;
          const newSettings = { ...currentSettings, ...updates };
          set({ settings: newSettings });
        });
      },
      
      createOrganization: (name, plan) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const organization: Organization = {
          id: currentUser.organizationId || 0,
          name,
          plan,
          memberCount: 1,
          maxMembers: plan === 'small_church' ? 250 : plan === 'large_church' ? 999999 : plan === 'org_small' ? 100 : plan === 'org_medium' ? 500 : 999999,
          createdAt: new Date().toISOString(),
          adminId: currentUser.id,
        };
        
        const updatedUser = {
          ...currentUser,
          organizationId: organization.id,
          organizationRole: 'admin' as const,
          plan,
        };
        
        set({
          user: updatedUser,
          organization,
          plan,
        });
      },
      
      updateOrganization: (updates) => {
        const currentOrg = get().organization;
        if (!currentOrg) return;
        
        const updatedOrg = { ...currentOrg, ...updates };
        set({ organization: updatedOrg });
      },
      
      setOrganization: (organization: Organization | null) => {
        set({ organization });
        if (organization) {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              organizationId: organization.id,
            };
            set({ user: updatedUser });
          }
        }
      },
      
      updateIntegration: (integrationId, updates) => {
        try {
          const currentIntegrations = get().integrations || [];
          const existingIndex = currentIntegrations.findIndex(i => i.id === integrationId);
          
          if (existingIndex >= 0) {
            // Update existing integration
            const updatedIntegrations = [...currentIntegrations];
            updatedIntegrations[existingIndex] = {
              ...updatedIntegrations[existingIndex],
              ...updates,
            };
            set({ integrations: updatedIntegrations });
          } else {
            // Add new integration
            const newIntegration: Integration = {
              id: integrationId,
              isConnected: false,
              ...updates,
            };
            set({ integrations: [...currentIntegrations, newIntegration] });
          }
        } catch (error) {
          console.error('Error updating integration:', error);
        }
      },
      
      updatePrayerStreak: () => {
        try {
          const today = new Date().toDateString();
          const currentState = get();
          const { prayerStreak } = currentState;
          
          // If already prayed today, don't update
          if (prayerStreak?.lastPrayerDate === today) {
            return;
          }
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();
          
          let newCurrentStreak = 1;
          let newStreakStartDate = today;
          
          // If last prayer was yesterday, continue the streak
          if (prayerStreak?.lastPrayerDate === yesterdayString) {
            newCurrentStreak = (prayerStreak.currentStreak || 0) + 1;
            newStreakStartDate = prayerStreak.streakStartDate || today;
          }
          
          const newLongestStreak = Math.max(prayerStreak?.longestStreak || 0, newCurrentStreak);
          
          set({
            prayerStreak: {
              currentStreak: newCurrentStreak,
              longestStreak: newLongestStreak,
              lastPrayerDate: today,
              streakStartDate: newStreakStartDate,
            },
          });
        } catch (error) {
          console.error('Error updating prayer streak:', error);
        }
      },

      joinPrayerPlan: async (planId: string) => {
        const currentState = get();
        const existingPlan = currentState.activePrayerPlans.find(p => p.planId === planId);
        
        if (!existingPlan && currentState.user) {
          try {
            const { ENV } = await import('@/config/env');
            const { fetchWithAuth } = await import('@/utils/authUtils');
            const accessToken = currentState.user.accessToken;
            
            if (!accessToken) {
              console.error('No access token available');
              return;
            }

            const response = await fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_prayer_plan_progress`, {
              method: 'POST',
              body: JSON.stringify({
                user_id: currentState.user.id,
                prayer_plan_id: planId,
                joined_date: new Date().toISOString(),
                current_day: 1,
                total_days_completed: 0,
                is_completed: false,
                last_activity_date: new Date().toISOString(),
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to join prayer plan');
            }

            const result = await response.json();
            
            const newUserPlan: UserPrayerPlan = {
              planId,
              startDate: new Date().toISOString(),
              currentDay: 1,
              isCompleted: false,
              completedDays: [],
              lastAccessedAt: new Date().toISOString(),
              progressId: result.data.id,
            };
            
            set((state) => ({
              activePrayerPlans: [...state.activePrayerPlans, newUserPlan],
            }));
          } catch (error) {
            console.error('Error joining prayer plan:', error);
            throw error;
          }
        }
      },

      leavePrayerPlan: (planId: string) => {
        set((state) => ({
          activePrayerPlans: state.activePrayerPlans.filter(p => p.planId !== planId),
        }));
      },

      updatePrayerPlanProgress: async (planId: string, day: number, completed: boolean, prayerDayId?: string, totalDays?: number, notes?: string, rating?: number) => {
        const currentState = get();
        const userPlan = currentState.activePrayerPlans.find(p => p.planId === planId);
        
        if (!userPlan || !currentState.user) return;

        try {
          const { ENV } = await import('@/config/env');
          const accessToken = currentState.user.accessToken;
          
          if (!accessToken) {
            console.error('No access token available');
            return;
          }

          const { fetchWithAuth } = await import('@/utils/authUtils');

          if (completed && prayerDayId) {
            const completionData = {
              user_id: currentState.user.id,
              prayer_plan_id: planId,
              prayer_day_id: parseInt(prayerDayId),
              day_number: day,
              completed_date: new Date().toISOString(),
              is_skipped: false,
            };

            if (notes) {
              Object.assign(completionData, { notes });
            }
            if (rating) {
              Object.assign(completionData, { rating });
            }

            const completionResponse = await fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_prayer_day_completions`, {
              method: 'POST',
              body: JSON.stringify(completionData),
            });

            if (!completionResponse.ok) {
              const errorData = await completionResponse.json();
              console.error('Failed to create completion record:', errorData);
              throw new Error('Failed to mark day as completed');
            }
          }

          const completedDays = completed 
            ? [...userPlan.completedDays, day].filter((d, i, arr) => arr.indexOf(d) === i).sort((a, b) => a - b)
            : userPlan.completedDays.filter(d => d !== day);

          const nextDay = day + 1;
          const isLastDay = totalDays ? day >= totalDays : false;
          const isPlanCompleted = totalDays ? completedDays.length >= totalDays : false;
          
          const newCurrentDay = isLastDay ? day : Math.max(userPlan.currentDay, nextDay);

          if (userPlan.progressId) {
            const updateData: any = {
              current_day: newCurrentDay,
              total_days_completed: completedDays.length,
              last_activity_date: new Date().toISOString(),
            };

            if (isPlanCompleted) {
              updateData.is_completed = true;
              updateData.completed_date = new Date().toISOString();
            }

            await fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_prayer_plan_progress/${userPlan.progressId}`, {
              method: 'PATCH',
              body: JSON.stringify(updateData),
            });
          }

          set((state) => ({
            activePrayerPlans: state.activePrayerPlans.map(plan => {
              if (plan.planId === planId) {
                return {
                  ...plan,
                  completedDays,
                  currentDay: newCurrentDay,
                  isCompleted: isPlanCompleted,
                  lastAccessedAt: new Date().toISOString(),
                };
              }
              return plan;
            }),
          }));
        } catch (error) {
          console.error('Error updating prayer plan progress:', error);
          throw error;
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value;
          } catch (error) {
            console.error('AsyncStorage getItem error:', error);
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            await AsyncStorage.setItem(name, value);
          } catch (error) {
            console.error('AsyncStorage setItem error:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('AsyncStorage removeItem error:', error);
          }
        },
      })),
      // Only persist essential data, not computed values
      partialize: (state) => {
        try {
          return {
            isLoggedIn: state.isLoggedIn || false,
            user: state.user || null,
            organization: state.organization || null,
            settings: state.settings || defaultSettings,
            integrations: state.integrations || [],
            prayerStreak: state.prayerStreak || {
              currentStreak: 0,
              longestStreak: 0,
              lastPrayerDate: undefined,
              streakStartDate: undefined,
            },
            activePrayerPlans: state.activePrayerPlans || [],
            achievements: state.achievements || [],
            badges: state.badges || [],
            totalPoints: state.totalPoints || 0,
            level: state.level || 1,
          };
        } catch (error) {
          console.error('Error partializing state:', error);
          return {
            isLoggedIn: false,
            user: null,
            organization: null,
            settings: defaultSettings,
            integrations: [],
            prayerStreak: {
              currentStreak: 0,
              longestStreak: 0,
              lastPrayerDate: undefined,
              streakStartDate: undefined,
            },
            activePrayerPlans: [],
            achievements: [],
            badges: [],
            totalPoints: 0,
            level: 1,
          };
        }
      },
      // Rehydrate computed values with enhanced error handling
      onRehydrateStorage: () => (state) => {
        try {
          if (state) {
            // Mark as hydrated
            state._hasHydrated = true;
            
            // Safely rehydrate user-dependent values
            if (state.user && typeof state.user === 'object') {
              state.name = state.user.name || '';
              state.email = state.user.email || '';
              state.plan = state.user.plan || 'individual';
              state.isAdmin = Boolean(state.user.isAdmin);
            } else {
              // Ensure computed values are set even if user is null
              state.name = '';
              state.email = '';
              state.plan = 'individual';
              state.isAdmin = false;
            }
            
            // Ensure all required properties exist with safe defaults
            state.settings = { ...defaultSettings, ...(state.settings || {}) };
            state.integrations = Array.isArray(state.integrations) ? state.integrations : [];
            state.activePrayerPlans = Array.isArray(state.activePrayerPlans) ? state.activePrayerPlans : [];
            state.achievements = Array.isArray(state.achievements) ? state.achievements : [];
            state.badges = Array.isArray(state.badges) ? state.badges : [];
            state.totalPoints = typeof state.totalPoints === 'number' ? state.totalPoints : 0;
            state.level = typeof state.level === 'number' ? state.level : 1;
            state.isLoggedIn = Boolean(state.isLoggedIn);
            
            // Ensure prayer streak exists
            if (!state.prayerStreak || typeof state.prayerStreak !== 'object') {
              state.prayerStreak = {
                currentStreak: 0,
                longestStreak: 0,
                lastPrayerDate: undefined,
                streakStartDate: undefined,
              };
            } else {
              // Validate prayer streak properties
              state.prayerStreak.currentStreak = typeof state.prayerStreak.currentStreak === 'number' ? state.prayerStreak.currentStreak : 0;
              state.prayerStreak.longestStreak = typeof state.prayerStreak.longestStreak === 'number' ? state.prayerStreak.longestStreak : 0;
            }
          }
        } catch (error) {
          console.error('Error rehydrating state:', error);
          // Set safe defaults if rehydration fails completely
          if (state) {
            Object.assign(state, {
              _hasHydrated: true,
              isLoggedIn: false,
              user: null,
              name: '',
              email: '',
              plan: 'individual',
              isAdmin: false,
              organization: null,
              settings: { ...defaultSettings },
              integrations: [],
              activePrayerPlans: [],
              achievements: [],
              badges: [],
              totalPoints: 0,
              level: 1,
              prayerStreak: {
                currentStreak: 0,
                longestStreak: 0,
                lastPrayerDate: undefined,
                streakStartDate: undefined,
              },
            });
          }
        }
      },
    }
  )
);