import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Send, Settings, Bot, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Colors from '@/constants/Colors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onOpenSettings?: () => void;
}

export default function AIChat({ onOpenSettings }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Faith Assistant. I'm here to help you with prayers, scripture insights, spiritual guidance, and any questions about your faith journey. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare messages for API
      const apiMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Add the new user message
      apiMessages.push({
        role: 'user',
        content: userMessage.content
      });

      // Add system message for context
      const systemMessage = {
        role: 'system' as const,
        content: 'You are a helpful AI assistant for a faith-based app called Faith Companion. You help users with prayers, scripture insights, spiritual guidance, and questions about their faith journey. Be compassionate, wise, and supportive. Provide biblical references when appropriate.'
      };

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [systemMessage, ...apiMessages]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.completion || 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Connection Error',
        'Unable to connect to AI assistant. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        <View style={styles.messageHeader}>
          <View style={[styles.messageAvatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
            {isUser ? (
              <User size={16} color={Colors.light.white} />
            ) : (
              <Bot size={16} color={Colors.light.white} />
            )}
          </View>
          <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
        </View>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Bot size={20} color={Colors.light.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Faith Assistant</Text>
            <Text style={styles.headerSubtitle}>Always here to help</Text>
          </View>
        </View>
        {onOpenSettings && (
          <TouchableOpacity onPress={onOpenSettings} style={styles.settingsButton}>
            <Settings size={20} color={Colors.light.textMedium} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={styles.messageHeader}>
              <View style={[styles.messageAvatar, styles.assistantAvatar]}>
                <Bot size={16} color={Colors.light.white} />
              </View>
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={[styles.messageText, styles.assistantText]}>
                Thinking...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about prayers, scripture, or faith..."
            placeholderTextColor={Colors.light.inputPlaceholder}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color={Colors.light.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  messageContainer: {
    marginBottom: theme.spacing.lg,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  userAvatar: {
    backgroundColor: Colors.light.primary,
  },
  assistantAvatar: {
    backgroundColor: Colors.light.org2,
  },
  messageTime: {
    ...theme.typography.caption,
    color: Colors.light.textSubtle,
    fontSize: 11,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.light.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  messageText: {
    ...theme.typography.body,
    lineHeight: 20,
  },
  userText: {
    color: Colors.light.white,
  },
  assistantText: {
    color: Colors.light.textPrimary,
  },
  inputContainer: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.light.inputBackground,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.inputText,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.textMedium,
    opacity: 0.5,
  },
});