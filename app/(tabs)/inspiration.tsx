import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Search, Filter, Shuffle } from 'lucide-react-native';
import { PromiseCard } from '@/components/PromiseCard';
import { QuoteCard } from '@/components/QuoteCard';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { promises } from '@/mocks/promises';
import { quotes } from '@/mocks/quotes';
import { Promise as BiblePromise, Quote } from '@/types';

const CONTENT_TYPES = [
  { id: 'all', name: 'All' },
  { id: 'promises', name: 'Promises' },
  { id: 'quotes', name: 'Quotes' }
];

// Define a union type for content items
type ContentItem = 
  | (BiblePromise & { type: 'promise' }) 
  | (Quote & { type: 'quote' });

export default function InspirationScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Combine and filter content
  const allContent: ContentItem[] = [
    ...promises.map(p => ({ ...p, type: 'promise' as const })),
    ...quotes.map(q => ({ ...q, type: 'quote' as const }))
  ];

  const filteredContent = allContent.filter(item => {
    let matchesSearch = false;
    
    if (item.type === 'promise') {
      const promiseItem = item as BiblePromise & { type: 'promise' };
      matchesSearch = promiseItem.verse?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     promiseItem.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (item.type === 'quote') {
      const quoteItem = item as Quote & { type: 'quote' };
      matchesSearch = quoteItem.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     quoteItem.author?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'promises' && item.type === 'promise') ||
                       (selectedType === 'quotes' && item.type === 'quote');
    return matchesSearch && matchesType;
  });

  const shuffleContent = () => {
    // In a real app, this would shuffle the content array
    console.log('Shuffling content...');
  };

  const renderContentItem = (item: ContentItem, index: number) => {
    if (item.type === 'promise') {
      return (
        <PromiseCard
          key={`promise-${item.id}-${index}`}
          promise={item}
          onPress={() => {}}
        />
      );
    } else {
      const { type, ...quoteData } = item;
      
      return (
        <QuoteCard
          key={`quote-${quoteData.id}-${index}`}
          quote={quoteData}
          onPress={() => {}}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Daily Inspiration',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { color: Colors.light.text },
          headerRight: () => (
            <TouchableOpacity onPress={shuffleContent} style={styles.headerButton}>
              <Shuffle size={24} color={Colors.light.tint} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inspiration..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.icon}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={Colors.light.tint} />
          </TouchableOpacity>
        </View>

        {/* Content Type Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {CONTENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterChip,
                selectedType === type.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedType === type.id && styles.filterChipTextActive
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content List */}
        <View style={styles.contentList}>
          {filteredContent.map((item, index) => (
            <View key={`${item.type}-${item.id}-${index}`} style={styles.contentItem}>
              {renderContentItem(item, index)}
            </View>
          ))}
        </View>

        {filteredContent.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No content found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    padding: theme.spacing.xs,
  },
  filtersContainer: {
    marginBottom: theme.spacing.lg,
  },
  filtersContent: {
    paddingRight: theme.spacing.lg,
  },
  filterChip: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: Colors.light.background,
  },
  contentList: {
    gap: theme.spacing.lg,
  },
  contentItem: {
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    ...theme.typography.subtitle,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: Colors.light.text,
  },
  emptyStateText: {
    ...theme.typography.body,
    textAlign: 'center',
    color: Colors.light.icon,
  },
});