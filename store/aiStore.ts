import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AIState {
  conversations: AIConversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createConversation: (title: string) => string;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, role: 'user' | 'assistant' | 'system', content: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  clearConversations: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      error: null,
      
      createConversation: (title) => {
        const id = `conv_${Date.now()}`;
        const newConversation: AIConversation = {
          id,
          title,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));
        
        return id;
      },
      
      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },
      
      addMessage: (conversationId, role, content) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    role,
                    content,
                    timestamp: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              };
            }
            return conv;
          });
          
          return { conversations };
        });
      },
      
      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: new Date().toISOString() } : conv
          ),
        }));
      },
      
      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((conv) => conv.id !== id);
          const newCurrentId = state.currentConversationId === id
            ? (newConversations.length > 0 ? newConversations[0].id : null)
            : state.currentConversationId;
            
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          };
        });
      },
      
      clearConversations: () => {
        console.log('🧹 Clearing AI conversations...');
        set({
          conversations: [],
          currentConversationId: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);