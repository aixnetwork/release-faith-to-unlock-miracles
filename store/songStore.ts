import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '@/types';

interface SongState {
  songs: Song[];
  likedSongs: string[];
  recentlyPlayed: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSongs: (organizationId?: number) => Promise<void>;
  addSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  likeSong: (id: string) => void;
  unlikeSong: (id: string) => void;
  addToRecentlyPlayed: (id: string) => void;
  getSongById: (id: string) => Song | undefined;
  getLikedSongs: () => Song[];
  getRecentlyPlayedSongs: () => Song[];
  searchSongs: (query: string) => Song[];
  getSongsByCategory: (category: string) => Song[];
  clearAllSongs: () => void;
  resetToDefaults: () => void;
  setSongs: (songs: Song[]) => void;
}

export const useSongStore = create<SongState>()(
  persist(
    (set, get) => ({
      songs: [],
      likedSongs: [],
      recentlyPlayed: [],
      isLoading: false,
      error: null,
      
      fetchSongs: async (organizationId?: number) => {
        set({ isLoading: true, error: null });
        try {
          const { ENV } = await import('@/config/env');
          const { fetchWithAuth } = await import('@/utils/authUtils');
          
          let url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/songs?fields=*&sort=-date_created`;
          
          if (organizationId) {
            url += `&filter[organization_id][_eq]=${organizationId}`;
          }
          
          const response = await fetchWithAuth(url);
          
          if (!response.ok) {
            throw new Error('Failed to fetch songs');
          }
          
          const result = await response.json();
          const songsData = result.data || [];
          
          const formattedSongs: Song[] = songsData.map((song: any) => ({
            id: song.id,
            title: song.title || '',
            artist: song.artist || '',
            album: song.album,
            genre: song.genre || 'worship',
            category: song.category,
            duration: song.duration || 0,
            lyrics: song.lyrics,
            youtubeUrl: song.youtube_url,
            youtubeId: song.youtube_id,
            imageUrl: song.image_url,
            description: song.description,
            tags: song.tags ? (Array.isArray(song.tags) ? song.tags : []) : [],
            createdAt: song.date_created || new Date().toISOString(),
            updatedAt: song.date_updated || new Date().toISOString(),
            playCount: song.play_count || 0,
            likes: song.likes || 0,
            isLiked: false,
            organizationId: song.organization_id,
            status: song.status,
          }));
          
          set({ songs: formattedSongs, isLoading: false });
        } catch (error) {
          console.error('Error fetching songs:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch songs', isLoading: false });
        }
      },
      
      addSong: async (songData) => {
        try {
          const { ENV } = await import('@/config/env');
          const { fetchWithAuth } = await import('@/utils/authUtils');
          const { useUserStore } = await import('@/store/userStore');
          
          const userState = useUserStore.getState();
          const organizationId = userState.user?.organizationId;
          
          const payload = {
            title: songData.title,
            artist: songData.artist,
            album: songData.album,
            category: songData.category,
            genre: songData.genre,
            duration: songData.duration,
            lyrics: songData.lyrics,
            youtube_url: songData.youtubeUrl,
            youtube_id: songData.youtubeId,
            image_url: songData.imageUrl,
            description: songData.description,
            tags: songData.tags,
            play_count: 0,
            likes: 0,
            organization_id: organizationId ? (typeof organizationId === 'string' ? parseInt(organizationId) : organizationId) : null,
            status: 'published',
          };
          
          const response = await fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/songs`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to create song:', errorData);
            throw new Error('Failed to create song');
          }
          
          const result = await response.json();
          const newSong = result.data;
          
          const formattedSong: Song = {
            id: newSong.id,
            title: newSong.title,
            artist: newSong.artist,
            album: newSong.album,
            genre: newSong.genre || 'worship',
            category: newSong.category,
            duration: newSong.duration || 0,
            lyrics: newSong.lyrics,
            youtubeUrl: newSong.youtube_url,
            youtubeId: newSong.youtube_id,
            imageUrl: newSong.image_url,
            description: newSong.description,
            tags: newSong.tags || [],
            createdAt: newSong.date_created,
            updatedAt: newSong.date_updated,
            playCount: newSong.play_count || 0,
            likes: newSong.likes || 0,
            isLiked: false,
            organizationId: newSong.organization_id,
            status: newSong.status,
          };
          
          set((state) => ({
            songs: [formattedSong, ...state.songs],
          }));
        } catch (error) {
          console.error('Error adding song:', error);
          throw error;
        }
      },
      
      updateSong: (id, updates) => {
        try {
          set((state) => ({
            songs: state.songs.map(song =>
              song.id === id
                ? { ...song, ...updates, updatedAt: new Date().toISOString() }
                : song
            ),
          }));
        } catch (error) {
          console.error('Error updating song:', error);
          throw error;
        }
      },
      
      deleteSong: (id) => {
        try {
          set((state) => ({
            songs: state.songs.filter(song => song.id !== id),
            likedSongs: state.likedSongs.filter(songId => songId !== id),
            recentlyPlayed: state.recentlyPlayed.filter(songId => songId !== id),
          }));
        } catch (error) {
          console.error('Error deleting song:', error);
          throw error;
        }
      },
      
      likeSong: (id) => {
        try {
          set((state) => ({
            likedSongs: state.likedSongs.includes(id) 
              ? state.likedSongs 
              : [...state.likedSongs, id],
          }));
        } catch (error) {
          console.error('Error liking song:', error);
        }
      },
      
      unlikeSong: (id) => {
        try {
          set((state) => ({
            likedSongs: state.likedSongs.filter(songId => songId !== id),
          }));
        } catch (error) {
          console.error('Error unliking song:', error);
        }
      },
      
      addToRecentlyPlayed: (id) => {
        try {
          set((state) => {
            const filtered = state.recentlyPlayed.filter(songId => songId !== id);
            return {
              recentlyPlayed: [id, ...filtered].slice(0, 50), // Keep last 50
            };
          });
        } catch (error) {
          console.error('Error adding to recently played:', error);
        }
      },
      
      getSongById: (id) => {
        try {
          return get().songs.find(song => song.id === id);
        } catch (error) {
          console.error('Error getting song by ID:', error);
          return undefined;
        }
      },
      
      getLikedSongs: () => {
        try {
          const { songs, likedSongs } = get();
          return songs.filter(song => likedSongs.includes(song.id));
        } catch (error) {
          console.error('Error getting liked songs:', error);
          return [];
        }
      },
      
      getRecentlyPlayedSongs: () => {
        try {
          const { songs, recentlyPlayed } = get();
          return recentlyPlayed
            .map(id => songs.find(song => song.id === id))
            .filter(Boolean) as Song[];
        } catch (error) {
          console.error('Error getting recently played songs:', error);
          return [];
        }
      },
      
      searchSongs: (query) => {
        try {
          const { songs } = get();
          if (!query.trim()) return songs;
          
          const lowercaseQuery = query.toLowerCase();
          return songs.filter(song =>
            song.title.toLowerCase().includes(lowercaseQuery) ||
            song.artist.toLowerCase().includes(lowercaseQuery) ||
            (song.album && song.album.toLowerCase().includes(lowercaseQuery)) ||
            song.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
            (song.description && song.description.toLowerCase().includes(lowercaseQuery))
          );
        } catch (error) {
          console.error('Error searching songs:', error);
          return [];
        }
      },
      
      getSongsByCategory: (category) => {
        try {
          const { songs } = get();
          return category === 'all' 
            ? songs 
            : songs.filter(song => song.category === category);
        } catch (error) {
          console.error('Error getting songs by category:', error);
          return [];
        }
      },

      clearAllSongs: () => {
        try {
          set({
            songs: [],
            likedSongs: [],
            recentlyPlayed: [],
          });
        } catch (error) {
          console.error('Error clearing all songs:', error);
        }
      },

      resetToDefaults: () => {
        try {
          set({
            songs: [],
            likedSongs: [],
            recentlyPlayed: [],
          });
        } catch (error) {
          console.error('Error resetting to defaults:', error);
        }
      },
      
      setSongs: (songs: Song[]) => {
        set({ songs });
      },
    }),
    {
      name: 'song-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        songs: state.songs,
        likedSongs: state.likedSongs,
        recentlyPlayed: state.recentlyPlayed,
      }),
    }
  )
);