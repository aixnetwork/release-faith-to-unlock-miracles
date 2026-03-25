import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { quotes } from '@/mocks/quotes';
import { Image } from 'expo-image';
import { getSafeImageSource, FALLBACK_IMAGES } from '@/utils/imageUtils';

interface Quote {
  id: string;
  text: string;
  author: string;
  imageUrl: string;
}

export default function ManageQuotesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quotesList, setQuotesList] = useState(quotes);

  // Filter quotes based on search query
  const filteredQuotes = quotesList.filter(quote => {
    return (
      quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddQuote = () => {
    router.push('/admin/create-quote');
  };

  const handleEditQuote = (id: string) => {
    router.push(`/admin/edit-quote?id=${id}`);
  };

  const handleDeleteQuote = (id: string) => {
    Alert.alert(
      "Delete Quote",
      "Are you sure you want to delete this quote?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // Remove the quote from the list
            setQuotesList(quotesList.filter(quote => quote.id !== id));
          }
        }
      ]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderQuoteItem = ({ item }: { item: Quote }) => (
    <View style={styles.quoteItem}>
      <View style={styles.quoteImageContainer}>
        <Image
          source={getSafeImageSource(item.imageUrl, FALLBACK_IMAGES.quote)}
          style={styles.quoteImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.quoteContent}>
        <Text style={styles.quoteText} numberOfLines={2}>"{item.text}"</Text>
        <Text style={styles.quoteAuthor}>— {item.author}</Text>
      </View>
      <View style={styles.quoteActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditQuote(item.id)}
        >
          <Edit2 size={18} color={Colors.light.tint} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteQuote(item.id)}
        >
          <Trash2 size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.icon} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.icon}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.light.icon} />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          title="Add New"
          onPress={handleAddQuote}
          size="small"
          icon={<Plus size={16} color={Colors.light.background} />}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Inspirational Quotes</Text>
            <Text style={styles.listCount}>{filteredQuotes.length} items</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotes found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: Colors.light.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  addButton: {
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  listTitle: {
    ...theme.typography.subtitle,
  },
  listCount: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  quoteItem: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quoteImageContainer: {
    width: 80,
    height: 80,
  },
  quoteImage: {
    width: '100%',
    height: '100%',
  },
  quoteContent: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  quoteText: {
    ...theme.typography.body,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  quoteAuthor: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  quoteActions: {
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: Colors.light.icon,
  },
});