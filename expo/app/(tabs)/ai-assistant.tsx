import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Send, Bot, User, Plus, MessageCircle } from 'lucide-react-native';
import { useAIStore } from '@/store/aiStore';
import { llmService } from '@/lib/ai/llmService';
import AIConversationList from '@/components/AIConversationList';
import { useSuperwall } from '@/components/SuperwallProvider';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';

export default function AIAssistantScreen() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const { checkFeatureAccess } = useSuperwall();
  
  const {
    conversations,
    currentConversationId,
    addMessage,
    createConversation,
    setCurrentConversation,
  } = useAIStore();

  // Check feature access on component mount
  useEffect(() => {
    checkFeatureAccess('AI Prayer Assistant');
  }, [checkFeatureAccess]);
  
  // Safely access the current conversation
  const currentConversation = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId) 
    : null;
  
  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    // Check feature access before sending message
    if (!checkFeatureAccess('AI Prayer Assistant')) {
      return;
    }
    
    const userMessage = message.trim();
    setMessage('');
    
    // Create a new conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = createConversation(userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage);
    }
    
    // Add user message
    addMessage(conversationId, 'user', userMessage);
    
    // Scroll to bottom after user message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Generate AI response
    setIsLoading(true);
    
    try {
      // Create a faith-focused prompt
      const faithPrompt = `As a Christian AI assistant, please respond to this message with biblical wisdom and encouragement: "${userMessage}"
      
      Please provide a thoughtful, scripture-based response that:
      - Shows empathy and understanding
      - Includes relevant Bible verses when appropriate
      - Offers practical spiritual guidance
      - Maintains a tone of love and hope
      - Is appropriate for all ages`;

      const aiResponse = await llmService.generateText(faithPrompt);
      
      addMessage(conversationId, 'assistant', aiResponse);
      
      // Scroll to bottom after AI response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback responses for different types of messages
      let fallbackResponse = "I'm here to help you with your faith journey. Could you please rephrase your question?";
      
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('pray') || lowerMessage.includes('prayer')) {
        fallbackResponse = "Prayer is a beautiful way to connect with God. Remember, \"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.\" - Philippians 4:6. How can I help you with your prayer life?";
      } else if (lowerMessage.includes('bible') || lowerMessage.includes('scripture')) {
        fallbackResponse = "The Bible is God's living word to us. \"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.\" - 2 Timothy 3:16. What specific passage or topic would you like to explore?";
      } else if (lowerMessage.includes('faith') || lowerMessage.includes('believe')) {
        fallbackResponse = "Faith is the foundation of our relationship with God. \"Now faith is confidence in what we hope for and assurance about what we do not see.\" - Hebrews 11:1. I'm here to encourage you in your faith journey.";
      }
      
      addMessage(conversationId, 'assistant', fallbackResponse);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestion = (suggestionText: string) => {
    setMessage(suggestionText);
  };
  
  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageIconContainer,
          isUser ? styles.userIcon : styles.aiIcon
        ]}>
          {isUser ? (
            <User size={14} color="#fff" />
          ) : (
            <Bot size={14} color="#fff" />
          )}
        </View>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.aiMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Faith Assistant',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                if (showSidebar) {
                  setShowSidebar(false);
                } else {
                  const newConversationId = createConversation("New Conversation");
                  setCurrentConversation(newConversationId);
                }
              }}
            >
              {showSidebar ? (
                <MessageCircle size={24} color={Colors.light.tint} />
              ) : (
                <Plus size={24} color={Colors.light.tint} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        {showSidebar ? (
          <AIConversationList />
        ) : (
          <>
            {currentConversation && currentConversation.messages && currentConversation.messages.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={currentConversation.messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Bot size={32} color={Colors.light.tint} />
                </View>
                <Text style={styles.emptyStateTitle}>Faith AI Assistant</Text>
                <Text style={styles.emptyStateText}>
                  Ask me anything about scripture, prayer, or spiritual guidance. I'm here to support your faith journey with biblical wisdom.
                </Text>
                <View style={styles.suggestionContainer}>
                  <TouchableOpacity 
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestion("Can you help me understand Romans 8:28?")}
                  >
                    <Text style={styles.suggestionText}>Explain Romans 8:28</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestion("Write a prayer for healing and comfort")}
                  >
                    <Text style={styles.suggestionText}>Prayer for healing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestion("How can I strengthen my faith during difficult times?")}
                  >
                    <Text style={styles.suggestionText}>Faith during trials</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestion("What does the Bible say about anxiety and worry?")}
                  >
                    <Text style={styles.suggestionText}>Bible on anxiety</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.light.tint} size="small" />
                <Text style={styles.loadingText}>Seeking wisdom...</Text>
              </View>
            )}
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={100}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask about scripture, prayer, or faith..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  maxLength={500}
                  placeholderTextColor={Colors.light.textLight}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]}
                  onPress={handleSend}
                  disabled={!message.trim() || isLoading}
                >
                  <Send size={18} color={message.trim() && !isLoading ? '#fff' : '#ccc'} />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: theme.spacing.md,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    marginTop: 2,
  },
  userIcon: {
    backgroundColor: Colors.light.tint,
  },
  aiIcon: {
    backgroundColor: Colors.light.secondary,
  },
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxWidth: '100%',
  },
  userMessageBubble: {
    backgroundColor: Colors.light.tint,
    borderTopRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.light.white,
  },
  aiMessageText: {
    color: Colors.light.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.light.textLight,
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    backgroundColor: Colors.light.background,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxHeight: 100,
    fontSize: 15,
    color: Colors.light.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.borderLight,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    color: Colors.light.textMedium,
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.tint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  suggestionContainer: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  suggestionButton: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
});