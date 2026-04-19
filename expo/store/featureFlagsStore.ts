import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeatureKey =
  | 'prayers'
  | 'prayer_wall'
  | 'prayer_plans'
  | 'testimonials'
  | 'songs'
  | 'bible_games'
  | 'ai_assistant'
  | 'groups'
  | 'meetings'
  | 'devotional'
  | 'habits'
  | 'achievements'
  | 'marketplace'
  | 'services'
  | 'chat'
  | 'announcements';

export interface FeatureDefinition {
  key: FeatureKey;
  label: string;
  description: string;
  defaultEnabled: boolean;
}

export const FEATURE_CATALOG: FeatureDefinition[] = [
  { key: 'prayers', label: 'Prayers', description: 'Personal prayer tracking', defaultEnabled: true },
  { key: 'prayer_wall', label: 'Prayer Wall', description: 'Community prayer requests', defaultEnabled: true },
  { key: 'prayer_plans', label: 'Prayer Plans', description: 'Guided prayer plans', defaultEnabled: true },
  { key: 'testimonials', label: 'Testimonials', description: 'User testimonies sharing', defaultEnabled: true },
  { key: 'songs', label: 'Worship Songs', description: 'Worship song library', defaultEnabled: true },
  { key: 'bible_games', label: 'Bible Games', description: 'Interactive Bible games', defaultEnabled: true },
  { key: 'ai_assistant', label: 'AI Assistant', description: 'AI-powered spiritual assistant', defaultEnabled: true },
  { key: 'groups', label: 'Groups', description: 'Community group discussions', defaultEnabled: true },
  { key: 'meetings', label: 'Meetings', description: 'Live video meetings', defaultEnabled: true },
  { key: 'devotional', label: 'Devotional', description: 'Daily devotional content', defaultEnabled: true },
  { key: 'habits', label: 'Habits', description: 'Spiritual habit tracker', defaultEnabled: true },
  { key: 'achievements', label: 'Achievements', description: 'Gamified spiritual milestones', defaultEnabled: true },
  { key: 'marketplace', label: 'Marketplace', description: 'Service marketplace', defaultEnabled: false },
  { key: 'services', label: 'Services', description: 'Professional services', defaultEnabled: false },
  { key: 'chat', label: 'Chat', description: 'Real-time chat between members', defaultEnabled: true },
  { key: 'announcements', label: 'Announcements', description: 'Church announcements', defaultEnabled: true },
];

export type Scope = 'organization' | 'group';

export type FlagMap = Partial<Record<FeatureKey, boolean>>;

interface FeatureFlagsState {
  organizationFlags: Record<string, FlagMap>;
  groupFlags: Record<string, FlagMap>;

  setFlag: (scope: Scope, id: string, key: FeatureKey, enabled: boolean) => void;
  setManyFlags: (scope: Scope, id: string, flags: FlagMap) => void;
  resetFlags: (scope: Scope, id: string) => void;
  getFlags: (scope: Scope, id: string) => FlagMap;
  isFeatureEnabled: (
    key: FeatureKey,
    opts?: { organizationId?: string | number | null; groupId?: string | number | null }
  ) => boolean;
}

const getDefault = (key: FeatureKey): boolean => {
  const def = FEATURE_CATALOG.find((f) => f.key === key);
  return def ? def.defaultEnabled : true;
};

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      organizationFlags: {},
      groupFlags: {},

      setFlag: (scope, id, key, enabled) => {
        console.log('🚩 setFlag', { scope, id, key, enabled });
        const state = get();
        const bucket = scope === 'organization' ? state.organizationFlags : state.groupFlags;
        const current = bucket[id] ?? {};
        const next = { ...current, [key]: enabled };
        if (scope === 'organization') {
          set({ organizationFlags: { ...state.organizationFlags, [id]: next } });
        } else {
          set({ groupFlags: { ...state.groupFlags, [id]: next } });
        }
      },

      setManyFlags: (scope, id, flags) => {
        console.log('🚩 setManyFlags', { scope, id, flags });
        const state = get();
        if (scope === 'organization') {
          set({
            organizationFlags: {
              ...state.organizationFlags,
              [id]: { ...(state.organizationFlags[id] ?? {}), ...flags },
            },
          });
        } else {
          set({
            groupFlags: {
              ...state.groupFlags,
              [id]: { ...(state.groupFlags[id] ?? {}), ...flags },
            },
          });
        }
      },

      resetFlags: (scope, id) => {
        console.log('🚩 resetFlags', { scope, id });
        const state = get();
        if (scope === 'organization') {
          const copy = { ...state.organizationFlags };
          delete copy[id];
          set({ organizationFlags: copy });
        } else {
          const copy = { ...state.groupFlags };
          delete copy[id];
          set({ groupFlags: copy });
        }
      },

      getFlags: (scope, id) => {
        const state = get();
        const bucket = scope === 'organization' ? state.organizationFlags : state.groupFlags;
        return bucket[id] ?? {};
      },

      isFeatureEnabled: (key, opts) => {
        const state = get();
        const orgId = opts?.organizationId != null ? String(opts.organizationId) : null;
        const groupId = opts?.groupId != null ? String(opts.groupId) : null;

        if (groupId && state.groupFlags[groupId]?.[key] !== undefined) {
          return state.groupFlags[groupId][key] as boolean;
        }
        if (orgId && state.organizationFlags[orgId]?.[key] !== undefined) {
          return state.organizationFlags[orgId][key] as boolean;
        }
        return getDefault(key);
      },
    }),
    {
      name: 'feature-flags-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useFeatureEnabled(
  key: FeatureKey,
  opts?: { organizationId?: string | number | null; groupId?: string | number | null }
): boolean {
  return useFeatureFlagsStore((s) =>
    s.isFeatureEnabled(key, opts)
  );
}
