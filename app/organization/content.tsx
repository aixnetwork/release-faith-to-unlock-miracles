import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Stack, router } from 'expo-router';
import { Search, Plus, Filter, Book, Music, MessageSquare, Video, Calendar } from 'lucide-react-native';
import { ContentCategoryCard } from '@/components/ContentCategoryCard';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { contentCategories } from '@/mocks/contentCategories';

const RECENT_CONTENT = [
  {
    id: '1',
    title: 'Bible Study',
    description: 'Weekly study on the Book of Romans',
    category: 'bible_studies',
    date: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'Sermon',
    description: 'Finding Hope in Difficult Times',
    category: 'sermons',
    date: '2024-01-14',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop'
  }
];

export default function OrganizationContentScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPublic, setIsPublic] = useState(true);

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to content creation screen with pre-selected category
    router.push({
      pathname: '/organization/content/new',
      params: { category: categoryId }
    });
  };

  const handleAddContent = () => {
    // Navigate to general content creation
    router.push('/organization/content/new');
  };

  const renderIcon = (iconType: string) => {
    const iconProps = {
      size: 24,
      color: Colors.light.white,
    };

    switch (iconType) {
      case 'sermons':
        return <MessageSquare {...iconProps} />;
      case 'bible-studies':
        return <Book {...iconProps} />;
      case 'worship-songs':
        return <Music {...iconProps} />;
      case 'events':
        return <Calendar {...iconProps} />;
      default:
        return <Book {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Organization Content',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.textPrimary,
          headerTitleStyle: { color: Colors.light.textPrimary },
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.light.textMedium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search content..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          {showFilters && (
            <View style={styles.filtersContainer}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Public Content</Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary }}
                  thumbColor={isPublic ? Colors.light.white : Colors.light.textMedium}
                />
              </View>
            </View>
          )}
        </View>

        {/* Content Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Content Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {contentCategories.map((category) => (
              <ContentCategoryCard
                key={category.id}
                category={category}
                onPress={handleCategoryPress}
              />
            ))}
          </View>
        </View>

        {/* Recent Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Content</Text>
            <TouchableOpacity onPress={() => router.push('/organization/content/manage')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {RECENT_CONTENT.map((item) => (
            <TouchableOpacity key={item.id} style={styles.contentCard}>
              <View style={styles.contentImage}>
                <View style={styles.contentImagePlaceholder}>
                  {renderIcon(item.category)}
                </View>
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentDescription}>{item.description}</Text>
                <Text style={styles.contentDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Button
              title="Add Sermon"
              onPress={() => handleCategoryPress('sermons')}
              icon={<MessageSquare size={16} color={Colors.light.white} />}
              style={styles.actionButton}
            />
            <Button
              title="Add Study"
              onPress={() => handleCategoryPress('bible-studies')}
              icon={<Book size={16} color={Colors.light.white} />}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionsGrid}>
            <Button
              title="Add Song"
              onPress={() => handleCategoryPress('worship-songs')}
              icon={<Music size={16} color={Colors.light.white} />}
              style={styles.actionButton}
            />
            <Button
              title="Add Event"
              onPress={() => handleCategoryPress('events')}
              icon={<Calendar size={16} color={Colors.light.white} />}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddContent}>
        <Plus size={24} color={Colors.light.white} />
      </TouchableOpacity>
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
  searchSection: {
    marginBottom: theme.spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.inputText,
  },
  filterButton: {
    padding: theme.spacing.xs,
  },
  filtersContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    ...theme.shadows.small,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
  },
  seeAllText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  contentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  contentImage: {
    marginRight: theme.spacing.md,
  },
  contentImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: 4,
    color: Colors.light.textPrimary,
  },
  contentDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginBottom: 4,
  },
  contentDate: {
    ...theme.typography.caption,
    color: Colors.light.textSubtle,
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
});