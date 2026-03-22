import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Bot, Trash2, Plus, MessageSquare } from 'lucide-react-native';
import { useAIStore } from '@/store/aiStore';
import { Colors } from '@/constants/Colors';

export default function AIConversationList() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
  } = useAIStore();

  const handleNewConversation = () => {
    createConversation('New Conversation');
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
  };

  const renderConversationItem = ({ item }: { item: any }) => {
    const isActive = item.id === currentConversationId;
    const lastMessage = item.messages.length > 0 
      ? item.messages[item.messages.length - 1].content 
      : 'No messages yet';
    const truncatedMessage = lastMessage.length > 40 
      ? `${lastMessage.substring(0, 40)}...` 
      : lastMessage;
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          isActive && styles.activeConversationItem
        ]}
        onPress={() => handleSelectConversation(item.id)}
      >
        <View style={styles.conversationIcon}>
          <MessageSquare size={16} color="#fff" />
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.conversationTitle}>{item.title}</Text>
          <Text style={styles.conversationPreview}>{truncatedMessage}</Text>
          <Text style={styles.conversationDate}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item.id)}
        >
          <Trash2 size={16} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newConversationButton}
        onPress={handleNewConversation}
      >
        <Plus size={18} color="#fff" />
        <Text style={styles.newConversationText}>New Conversation</Text>
      </TouchableOpacity>
      
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Bot size={40} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No conversations yet</Text>
          <Text style={styles.emptyStateText}>
            Start a new conversation to chat with the Faith AI Assistant
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  newConversationText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeConversationItem: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + '10',
  },
  conversationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
    color: Colors.light.text,
  },
  conversationPreview: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 11,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});