import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { Heart, Clock, Star, Filter, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { MentalHealthContent } from '@/types';

// Mock data for mental health content
const mockContent: MentalHealthContent[] = [
  {
    id: '1',
    title: 'Peace in Anxiety',
    description: 'A guided meditation for finding calm in anxious moments',
    type: 'meditation',
    duration: 10,
    tags: ['anxiety', 'peace', 'calm'],
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: 'Breathing with Scripture',
    description: 'Combine breathing exercises with biblical meditation',
    type: 'breathing',
    duration: 5,
    tags: ['breathing', 'anxiety', 'scripture'],
    difficulty: 'beginner',
  },
  {
    id: '3',
    title: 'Prayer for Strength',
    description: 'A guided prayer session for times of weakness',
    type: 'prayer',
    duration: 8,
    tags: ['strength', 'prayer', 'faith'],
    difficulty: 'intermediate',
  },
  {
    id: '4',
    title: 'Daily Affirmations',
    description: 'Positive affirmations rooted in biblical truth',
    type: 'affirmation',
    duration: 3,
    tags: ['affirmations', 'positivity', 'truth'],
    difficulty: 'beginner',
  },
  {
    id: '5',
    title: 'Scripture Meditation',
    description: 'Deep meditation on God\'s promises for peace',
    type: 'scripture',
    duration: 15,
    tags: ['scripture', 'promises', 'meditation'],
    difficulty: 'advanced',
  },
];

const categories = [
  { id: 'all', name: 'All', icon: '🌟' },
  { id: 'meditation', name: 'Meditation', icon: '🧘' },
  { id: 'prayer', name: 'Prayer', icon: '🙏' },
  { id: 'breathing', name: 'Breathing', icon: '🫁' },
];

export default function MentalHealthScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredContent, setFilteredContent] = useState(mockContent);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredContent(mockContent);
    } else {
      setFilteredContent(mockContent.filter(item => item.type === categoryId));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.light.success;
      case 'intermediate': return Colors.light.warning;
      case 'advanced': return Colors.light.error;
      default: return Colors.light.textLight;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return '🧘';
      case 'breathing': return '🫁';
      case 'prayer': return '🙏';
      case 'affirmation': return '💭';
      case 'scripture': return '📖';
      default: return '✨';
    }
  };

  const renderContentItem = ({ item }: { item: MentalHealthContent }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => router.push(`/mental-health/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.contentHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <View style={styles.durationContainer}>
          <Clock size={14} color={Colors.light.textLight} />
          <Text style={styles.durationText}>{item.duration} min</Text>
        </View>
      </View>
      
      <Text style={styles.contentTitle}>{item.title}</Text>
      <Text style={styles.contentDescription}>{item.description}</Text>
      
      <View style={styles.contentFooter}>
        <View style={styles.difficultyContainer}>
          <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(item.difficulty) }]} />
          <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.startButton}>
        <Text style={styles.startButtonText}>▶ Start Session</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mental Wellness',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.secondary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Find Peace & Comfort</Text>
            <Text style={styles.headerSubtitle}>
              Faith-based mental wellness resources to support your emotional and spiritual well-being
            </Text>
            
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🧘</Text>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Resources</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💜</Text>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🎧</Text>
                <Text style={styles.statNumber}>Free</Text>
                <Text style={styles.statLabel}>Access</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content List */}
        <FlatList
          data={filteredContent}
          renderItem={renderContentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryContainer: {
    backgroundColor: Colors.light.background,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  contentList: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  contentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    textTransform: 'capitalize',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  contentDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});