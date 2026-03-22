import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Testimonial {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  date: string;
  likes: number;
  isLiked: boolean;
  suggestedScripture?: string;
  suggestedSong?: string;
  youtubeUrl?: string;
  type: 'text' | 'video';
}

interface TestimonialState {
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'date' | 'likes' | 'isLiked'>) => void;
  likeTestimonial: (id: string) => void;
  toggleLike: (id: string) => void;
  getTestimonialsByCategory: (category: string) => Testimonial[];
  getTestimonialById: (id: string) => Testimonial | undefined;
  fetchTestimonials: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTestimonials: () => void;
}

export const useTestimonialStore = create<TestimonialState>()(
  persist(
    (set, get) => ({
      testimonials: [],
      isLoading: false,
      error: null,
      
      addTestimonial: (testimonialData) => {
        const newTestimonial: Testimonial = {
          ...testimonialData,
          id: `testimony_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          likes: 0,
          isLiked: false,
        };
        
        set((state) => ({
          testimonials: [newTestimonial, ...state.testimonials]
        }));
      },
      
      likeTestimonial: (id) => {
        set((state) => ({
          testimonials: state.testimonials.map((testimonial) =>
            testimonial.id === id
              ? {
                  ...testimonial,
                  isLiked: !testimonial.isLiked,
                  likes: testimonial.isLiked ? testimonial.likes - 1 : testimonial.likes + 1
                }
              : testimonial
          )
        }));
      },
      
      toggleLike: (id) => {
        set((state) => ({
          testimonials: state.testimonials.map((testimonial) =>
            testimonial.id === id
              ? {
                  ...testimonial,
                  isLiked: !testimonial.isLiked,
                  likes: testimonial.isLiked ? testimonial.likes - 1 : testimonial.likes + 1
                }
              : testimonial
          )
        }));
      },
      
      getTestimonialsByCategory: (category) => {
        const { testimonials } = get();
        return testimonials.filter((testimonial) => testimonial.category === category);
      },
      
      getTestimonialById: (id) => {
        const { testimonials } = get();
        return testimonials.find((testimonial) => testimonial.id === id);
      },

      fetchTestimonials: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate API call - in a real app, this would fetch from your backend
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // For now, we'll just use the testimonials already in the store
          // In a real app, you would fetch from your API here
          const { testimonials } = get();
          
          // If no testimonials exist, add some default ones
          if (testimonials.length === 0) {
            const sampleTestimonials: Testimonial[] = [
              {
                id: 'sample_1',
                title: 'Healing from Illness',
                content: 'I was diagnosed with a serious illness last year, but through prayer and faith, I experienced complete healing. The doctors were amazed at my recovery.',
                author: 'Sarah M.',
                category: 'healing',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 15,
                isLiked: false,
                suggestedScripture: 'Jeremiah 30:17 - "For I will restore health to you, and your wounds I will heal, declares the Lord."',
                suggestedSong: 'Healer - Kari Jobe',
                type: 'text'
              },
              {
                id: 'sample_2',
                title: 'Financial Breakthrough',
                content: 'After months of financial struggle, God provided in ways I never expected. A new job opportunity came at just the right time.',
                author: 'David L.',
                category: 'provision',
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 23,
                isLiked: false,
                suggestedScripture: 'Philippians 4:19 - "And my God will supply every need of yours according to his riches in glory in Christ Jesus."',
                suggestedSong: 'Jehovah Jireh - Avalon',
                type: 'text'
              },
              {
                id: 'sample_3',
                title: 'Finding Peace in Difficult Times',
                content: 'During the most challenging period of my life, I found an unexplainable peace through prayer and reading scripture. God truly is our refuge.',
                author: 'Michael R.',
                category: 'guidance',
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 18,
                isLiked: false,
                suggestedScripture: 'Psalm 46:1 - "God is our refuge and strength, an ever-present help in trouble."',
                suggestedSong: 'It Is Well - Bethel Music',
                type: 'text'
              },
              {
                id: 'sample_4',
                title: 'My Journey to Faith - Video Testimony',
                content: 'Watch my personal testimony about how God transformed my life from darkness to light.',
                author: 'Jennifer K.',
                category: 'salvation',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 42,
                isLiked: false,
                youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                suggestedScripture: '2 Corinthians 5:17 - "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"',
                suggestedSong: 'Amazing Grace - Chris Tomlin',
                type: 'video'
              },
              {
                id: 'sample_5',
                title: 'Healing from Anxiety - Video Testimony',
                content: 'In this video, I share how God helped me overcome severe anxiety and panic attacks through prayer and faith.',
                author: 'Mark T.',
                category: 'healing',
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 28,
                isLiked: false,
                youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
                suggestedScripture: 'Philippians 4:6-7 - "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."',
                suggestedSong: 'Peace Be Still - Hope Darst',
                type: 'video'
              }
            ];
            
            set({ testimonials: sampleTestimonials });
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching testimonials:', error);
          set({ 
            isLoading: false, 
            error: 'Failed to load testimonials. Please try again.' 
          });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      clearTestimonials: () => {
        console.log('🧹 Clearing testimonials...');
        set({ 
          testimonials: [], 
          isLoading: false, 
          error: null 
        });
      },
    }),
    {
      name: 'testimonial-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist testimonials, not loading states
      partialize: (state) => ({ testimonials: state.testimonials }),
    }
  )
);