import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Prayer, CommunityPrayer, MentalHealthContent } from '@/types';

// Simplified PrayerPlan interface that matches our mock data
export interface PrayerPlan {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  participants: number;
  tags: string[];
  prayers: Array<{
    id?: string;
    day: number;
    title: string;
    prayer: string;
    scripture: string;
    reflection: string;
  }>;
}
import { useUserStore } from './userStore';

interface PrayerState {
  prayers: Prayer[];
  communityPrayers: CommunityPrayer[];
  mentalHealthContent: MentalHealthContent[];
  prayerPlans: PrayerPlan[];
  isLoading: boolean;
  error: string | null;
  
  // Prayer actions
  addPrayer: (prayer: Omit<Prayer, 'id' | 'createdAt' | 'updatedAt' | 'prayerCount' | 'isAnswered'>) => void;
  updatePrayer: (id: string, updates: Partial<Prayer>) => void;
  deletePrayer: (id: string) => void;
  markPrayerAnswered: (id: string) => void;
  toggleAnswered: (id: string) => void;
  getPrayersByStatus: (status: 'active' | 'answered') => Prayer[];
  
  // Community prayer actions
  addCommunityPrayer: (prayer: Omit<CommunityPrayer, 'id' | 'date' | 'prayerCount' | 'hasPrayed'>) => void;
  prayForCommunityRequest: (id: string) => void;
  fetchCommunityPrayers: () => Promise<void>;
  
  // Mental health actions
  fetchMentalHealthContent: () => Promise<void>;
  
  // Prayer plan actions
  fetchPrayerPlans: () => Promise<void>;
  createPrayerPlan: (plan: Omit<PrayerPlan, 'id' | 'createdAt' | 'participants'>) => void;
  
  // Clear data
  clearPrayers: () => void;
}

// Mock community prayers
const mockCommunityPrayers: CommunityPrayer[] = [
  {
    id: '1',
    title: 'Healing for my mother',
    description: 'Please pray for my mother who is battling cancer. She starts chemotherapy next week.',
    author: 'Sarah M.',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    prayerCount: 47,
    hasPrayed: false,
    isAnonymous: false,
    category: 'health',
  },
  {
    id: '2',
    title: 'Job interview tomorrow',
    description: 'I have an important job interview tomorrow. Praying for Gods guidance and favor.',
    author: 'Anonymous',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    prayerCount: 23,
    hasPrayed: true,
    isAnonymous: true,
    category: 'work',
  },
  {
    id: '3',
    title: 'Marriage restoration',
    description: 'Please pray for healing and restoration in my marriage. We are going through a difficult time.',
    author: 'Michael K.',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    prayerCount: 89,
    hasPrayed: false,
    isAnonymous: false,
    category: 'family',
  },
];

// Mock mental health content with proper audio URLs
const mockMentalHealthContent: MentalHealthContent[] = [
  {
    id: '1',
    title: 'Peace in Anxiety',
    description: 'A guided meditation for finding calm in anxious moments',
    type: 'meditation',
    duration: 10,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    scriptureReferences: ['Philippians 4:6-7', 'Matthew 6:26'],
    tags: ['anxiety', 'peace', 'calm'],
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: 'Breathing with God',
    description: 'Simple breathing exercises combined with prayer',
    type: 'breathing',
    duration: 5,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    tags: ['breathing', 'prayer', 'stress'],
    difficulty: 'beginner',
  },
  {
    id: '3',
    title: 'Healing from Depression',
    description: 'Scripture-based affirmations for dark seasons',
    type: 'affirmation',
    duration: 15,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    scriptureReferences: ['Psalm 23', 'Isaiah 41:10'],
    tags: ['depression', 'healing', 'hope'],
    difficulty: 'intermediate',
  },
  {
    id: '4',
    title: 'Prayer for Overwhelm',
    description: 'A structured prayer for when life feels too much',
    type: 'prayer',
    duration: 8,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    scriptureReferences: ['1 Peter 5:7', 'Psalm 55:22'],
    tags: ['overwhelm', 'stress', 'surrender'],
    difficulty: 'beginner',
  },
  {
    id: '5',
    title: 'Scripture Meditation on Joy',
    description: 'Meditative reading of joy-filled Bible passages',
    type: 'scripture',
    duration: 12,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    scriptureReferences: ['Nehemiah 8:10', 'Psalm 16:11'],
    tags: ['joy', 'scripture', 'meditation'],
    difficulty: 'intermediate',
  },
  {
    id: '6',
    title: 'Morning Gratitude',
    description: 'Start your day with thankfulness and praise',
    type: 'affirmation',
    duration: 7,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    scriptureReferences: ['Psalm 118:24', '1 Thessalonians 5:18'],
    tags: ['gratitude', 'morning', 'praise'],
    difficulty: 'beginner',
  },
  {
    id: '7',
    title: 'Evening Peace',
    description: 'End your day in Gods peace and rest',
    type: 'meditation',
    duration: 12,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    scriptureReferences: ['Psalm 4:8', 'Matthew 11:28'],
    tags: ['peace', 'evening', 'rest'],
    difficulty: 'beginner',
  },
  {
    id: '8',
    title: 'Strength in Trials',
    description: 'Find Gods strength during difficult times',
    type: 'prayer',
    duration: 10,
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    scriptureReferences: ['Isaiah 40:31', '2 Corinthians 12:9'],
    tags: ['strength', 'trials', 'perseverance'],
    difficulty: 'intermediate',
  },
];

// Mock prayer plans
const mockPrayerPlans: PrayerPlan[] = [
  {
    id: '1',
    title: '30 Days of Gratitude',
    description: 'A month-long journey of thankfulness and praise',
    duration: 30,
    category: 'Gratitude',
    isPublic: true,
    createdBy: 'Release Faith Team',
    createdAt: '2024-01-01T00:00:00Z',
    participants: 1250,
    tags: ['gratitude', 'thanksgiving', 'praise'],
    prayers: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Grateful Heart`,
      prayer: `Today I thank You, Lord, for...`,
      scripture: 'Psalm 100:4',
      reflection: 'What are three things you are grateful for today?',
    })),
  },
  {
    id: '2',
    title: 'Healing and Restoration',
    description: 'Prayers for physical, emotional, and spiritual healing',
    duration: 21,
    category: 'Healing',
    isPublic: true,
    createdBy: 'Pastor Sarah Johnson',
    createdAt: '2024-01-15T00:00:00Z',
    participants: 890,
    tags: ['healing', 'restoration', 'health'],
    prayers: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: God's Healing Touch`,
      prayer: `Lord, I come to You seeking healing...`,
      scripture: 'Jeremiah 30:17',
      reflection: 'Where do you need God\'s healing touch in your life?',
    })),
  },
  {
    id: '3',
    title: 'Wisdom for Decisions',
    description: 'Seeking God\'s guidance in life\'s important choices',
    duration: 14,
    category: 'Guidance',
    isPublic: true,
    createdBy: 'Dr. Michael Chen',
    createdAt: '2024-02-01T00:00:00Z',
    participants: 567,
    tags: ['wisdom', 'guidance', 'decisions'],
    prayers: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Seeking Divine Wisdom`,
      prayer: `Father, grant me wisdom to...`,
      scripture: 'James 1:5',
      reflection: 'What decision are you seeking God\'s wisdom for?',
    })),
  },
  {
    id: '4',
    title: 'Mental Health & Faith',
    description: 'Prayers and reflections for mental wellness',
    duration: 28,
    category: 'Mental Health',
    isPublic: true,
    createdBy: 'Hope Counseling Ministry',
    createdAt: '2024-02-10T00:00:00Z',
    participants: 723,
    tags: ['mental health', 'anxiety', 'depression', 'peace'],
    prayers: Array.from({ length: 28 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Peace for the Mind`,
      prayer: `Lord, calm my anxious thoughts...`,
      scripture: 'Philippians 4:6-7',
      reflection: 'How can you practice God\'s peace today?',
    })),
  },
  {
    id: '5',
    title: 'Strength for Parents',
    description: 'Daily prayers for parents raising children in faith',
    duration: 40,
    category: 'Family',
    isPublic: true,
    createdBy: 'Family Life Ministry',
    createdAt: '2024-02-20T00:00:00Z',
    participants: 445,
    tags: ['parenting', 'family', 'children', 'wisdom'],
    prayers: Array.from({ length: 40 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Parenting with Grace`,
      prayer: `God, help me to parent with Your love...`,
      scripture: 'Proverbs 22:6',
      reflection: 'How can you show God\'s love to your children today?',
    })),
  },
];

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      prayers: [],
      communityPrayers: [],
      mentalHealthContent: [],
      prayerPlans: [],
      isLoading: false,
      error: null,

      addPrayer: (prayerData) => {
        const newPrayer: Prayer = {
          ...prayerData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          prayerCount: 0,
          isAnswered: false,
          userId: prayerData.userId || 'current-user',
          userName: prayerData.userName || 'Current User',
          tags: prayerData.tags || [],
          category: prayerData.category || 'other',
          isPrivate: prayerData.isPrivate ?? true,
        };
        
        set((state) => ({
          prayers: [newPrayer, ...state.prayers],
        }));
        
        // Update prayer streak
        useUserStore.getState().updatePrayerStreak();
      },

      updatePrayer: (id, updates) => {
        set((state) => ({
          prayers: state.prayers.map((prayer) =>
            prayer.id === id ? { ...prayer, ...updates, updatedAt: new Date().toISOString() } : prayer
          ),
        }));
      },

      deletePrayer: (id) => {
        set((state) => ({
          prayers: state.prayers.filter((prayer) => prayer.id !== id),
        }));
      },

      markPrayerAnswered: (id) => {
        set((state) => ({
          prayers: state.prayers.map((prayer) =>
            prayer.id === id ? { ...prayer, isAnswered: true } : prayer
          ),
        }));
      },

      toggleAnswered: (id) => {
        set((state) => ({
          prayers: state.prayers.map((prayer) =>
            prayer.id === id ? { ...prayer, isAnswered: !prayer.isAnswered } : prayer
          ),
        }));
      },

      getPrayersByStatus: (status: 'active' | 'answered') => {
        const state = get();
        return state.prayers.filter((prayer) => 
          status === 'answered' ? prayer.isAnswered : !prayer.isAnswered
        );
      },

      addCommunityPrayer: (prayerData) => {
        const newPrayer: CommunityPrayer = {
          ...prayerData,
          id: Date.now().toString(),
          date: new Date().toISOString(),
          prayerCount: 0,
          hasPrayed: false,
        };
        
        set((state) => ({
          communityPrayers: [newPrayer, ...state.communityPrayers],
        }));
        
        console.log('✅ Community prayer added:', newPrayer.title);
      },

      prayForCommunityRequest: (id) => {
        set((state) => ({
          communityPrayers: state.communityPrayers.map((prayer) =>
            prayer.id === id
              ? {
                  ...prayer,
                  prayerCount: prayer.prayerCount + 1,
                  hasPrayed: true,
                }
              : prayer
          ),
        }));
      },

      fetchCommunityPrayers: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get current community prayers and merge with mock data
          const currentState = get();
          const existingPrayers = currentState.communityPrayers;
          
          // Only add mock prayers if we don't have any community prayers yet
          const prayersToSet = existingPrayers.length > 0 ? existingPrayers : mockCommunityPrayers;
          
          set({
            communityPrayers: prayersToSet,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: 'Failed to fetch community prayers',
            isLoading: false,
          });
        }
      },

      fetchMentalHealthContent: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            mentalHealthContent: mockMentalHealthContent,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: 'Failed to fetch mental health content',
            isLoading: false,
          });
        }
      },

      fetchPrayerPlans: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { ENV } = await import('@/config/env');
          const { useUserStore } = await import('./userStore');
          const { fetchWithAuth } = await import('@/utils/authUtils');
          const { getDirectusApiUrl } = await import('@/utils/api');
          const userState = useUserStore.getState();
          const accessToken = userState.user?.accessToken;
          const organizationId = userState.user?.organizationId;

          if (!accessToken) {
            console.log('No access token, using mock data');
            set({
              prayerPlans: mockPrayerPlans,
              isLoading: false,
            });
            return;
          }

          if (!organizationId) {
            console.log('No organization ID, showing empty list');
            set({
              prayerPlans: [],
              isLoading: false,
            });
            return;
          }

          const filterQuery = `filter[organization_id][_eq]=${organizationId}`;
          const response = await fetchWithAuth(`${getDirectusApiUrl()}/items/prayer_plans?fields=*,prayer_days.*&sort=-date_created&${filterQuery}`);

          if (!response.ok) {
            throw new Error(`Failed to fetch prayer plans: ${response.status}`);
          }

          const data = await response.json();
          
          const plans: PrayerPlan[] = (data.data || []).map((plan: any) => {
            const prayerDays = (plan.prayer_days || []).map((day: any) => ({
              id: day.id,
              day: day.day_number,
              title: day.title || '',
              prayer: day.prayer_context || '',
              scripture: day.scripture_reference || '',
              reflection: day.reflection_prompt || '',
            }));

            return {
              id: plan.id,
              title: plan.title || 'Untitled Plan',
              description: plan.description || '',
              duration: plan.duration_days || 0,
              category: plan.category || 'General',
              isPublic: plan.visibility === 'public',
              createdBy: plan.user_id || 'Unknown',
              createdAt: plan.date_created || new Date().toISOString(),
              participants: 0,
              tags: Array.isArray(plan.tags) ? plan.tags : [],
              prayers: prayerDays,
            };
          });
          
          set({
            prayerPlans: plans,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error fetching prayer plans:', error);
          set({
            prayerPlans: [],
            error: 'Failed to fetch prayer plans',
            isLoading: false,
          });
        }
      },

      createPrayerPlan: (planData) => {
        const newPlan: PrayerPlan = {
          ...planData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          participants: 0,
        };
        
        set((state) => ({
          prayerPlans: [newPlan, ...state.prayerPlans],
        }));
      },

      clearPrayers: () => {
        console.log('🧹 Clearing prayer store...');
        set({
          prayers: [],
          communityPrayers: [],
          mentalHealthContent: [],
          prayerPlans: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'prayer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        prayers: state.prayers,
        communityPrayers: state.communityPrayers,
        // Don't persist loading states or fetched content
      }),
    }
  )
);