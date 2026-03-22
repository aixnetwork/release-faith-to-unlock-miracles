import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meeting } from '@/types';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';

interface MeetingState {
  meetings: Meeting[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Meeting actions
  fetchMeetings: () => Promise<void>;
  getMeeting: (id: string) => Meeting | undefined;
  createMeeting: (meeting: any) => Promise<boolean>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<boolean>;
  deleteMeeting: (id: string) => Promise<boolean>;
  joinMeeting: (id: string, userId: string) => void;
  leaveMeeting: (id: string, userId: string) => void;
  
  // Clear data
  clearMeetings: () => void;
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({
      meetings: [],
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      error: null,

      fetchMeetings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('📡 Fetching meetings from Directus...');
          const response = await fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/meetings?fields=*`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch meetings');
          }
          
          const result = await response.json();
          console.log('✅ Meetings fetched successfully:', result.data?.length || 0);
          
          set({
            meetings: result.data || [],
            isLoading: false,
          });
        } catch (err) {
          console.error('❌ Error fetching meetings:', err);
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch meetings',
            isLoading: false,
          });
        }
      },

      getMeeting: (id) => {
        const state = get();
        return state.meetings.find((meeting) => meeting.id === id);
      },

      createMeeting: async (meetingData) => {
        set({ isCreating: true, error: null });
        
        try {
          console.log('📡 Creating meeting in Directus...', meetingData);
          
          const directusMeetingData = {
            title: meetingData.title,
            description: meetingData.description || '',
            type: meetingData.type || 'prayer',
            platform: meetingData.platform || 'zoom',
            meetingLink: meetingData.link || '',
            location: meetingData.location || '',
            recurringType: meetingData.recurringType || null,
            host: meetingData.host || 'Unknown',
            invitees: meetingData.invitees || [],
            startTime: meetingData.startTime,
            endTime: meetingData.endTime,
            isRecurring: meetingData.isRecurring || false,
            isPublic: meetingData.isPublic !== undefined ? meetingData.isPublic : true,
            status: 'published',
          };
          
          console.log('📤 Sending to Directus:', directusMeetingData);
          
          const response = await fetchWithAuth(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/meetings`,
            {
              method: 'POST',
              body: JSON.stringify(directusMeetingData),
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Directus error:', errorData);
            throw new Error(errorData.errors?.[0]?.message || 'Failed to create meeting');
          }
          
          const result = await response.json();
          console.log('✅ Meeting created successfully:', result.data);
          
          const newMeeting: Meeting = {
            ...result.data,
            currentParticipants: 0,
            participants: [],
            resources: [],
            timezone: 'UTC',
            tags: [],
          };
          
          set((state) => ({
            meetings: [newMeeting, ...state.meetings],
            isCreating: false,
          }));
          
          return true;
        } catch (err) {
          console.error('❌ Error creating meeting:', err);
          set({
            error: err instanceof Error ? err.message : 'Failed to create meeting',
            isCreating: false,
          });
          return false;
        }
      },

      updateMeeting: async (id, updates) => {
        set({ isUpdating: true, error: null });
        try {
          console.log('📡 Updating meeting in Directus...', id, updates);
          
          const response = await fetchWithAuth(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/meetings/${id}`,
            {
              method: 'PATCH',
              body: JSON.stringify(updates),
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to update meeting');
          }
          
          const result = await response.json();
          console.log('✅ Meeting updated successfully:', result.data);
          
          set((state) => ({
            meetings: state.meetings.map((meeting) =>
              meeting.id === id 
                ? { ...meeting, ...result.data }
                : meeting
            ),
            isUpdating: false,
          }));
          
          return true;
        } catch (err) {
          console.error('❌ Error updating meeting:', err);
          set({
            error: err instanceof Error ? err.message : 'Failed to update meeting',
            isUpdating: false,
          });
          return false;
        }
      },

      deleteMeeting: async (id) => {
        try {
          console.log('📡 Deleting meeting from Directus...', id);
          
          const response = await fetchWithAuth(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/meetings/${id}`,
            {
              method: 'DELETE',
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to delete meeting');
          }
          
          console.log('✅ Meeting deleted successfully');
          
          set((state) => ({
            meetings: state.meetings.filter((meeting) => meeting.id !== id),
          }));
          
          return true;
        } catch (err) {
          console.error('❌ Error deleting meeting:', err);
          set({
            error: err instanceof Error ? err.message : 'Failed to delete meeting',
          });
          return false;
        }
      },

      joinMeeting: (id, userId) => {
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === id
              ? {
                  ...meeting,
                  currentParticipants: meeting.currentParticipants + 1,
                  updatedAt: new Date().toISOString(),
                }
              : meeting
          ),
        }));
      },

      leaveMeeting: (id, userId) => {
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === id
              ? {
                  ...meeting,
                  currentParticipants: Math.max(0, meeting.currentParticipants - 1),
                  updatedAt: new Date().toISOString(),
                }
              : meeting
          ),
        }));
      },

      clearMeetings: () => {
        console.log('🧹 Clearing meeting store...');
        set({
          meetings: [],
          isLoading: false,
          isCreating: false,
          error: null,
        });
      },
    }),
    {
      name: 'meeting-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        meetings: state.meetings,
        // Don't persist loading states
      }),
    }
  )
);