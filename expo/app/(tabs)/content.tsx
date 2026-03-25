import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Music, Heart, Plus, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { ContentCategoryCard } from '@/components/ContentCategoryCard';
import { contentCategories } from '@/mocks/contentCategories';
import * as Haptics from 'expo-haptics';

export default function ContentScreen() {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();

  const popularCategories = contentCategories.filter(category => category.isPopular);

  const handleCategoryPress = (categoryId: string) => {
    console.log('Category pressed in content screen:', categoryId);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Navigate based on category
    switch (categoryId) {
      case 'prayers':
        console.log('Navigating to prayers');
        router.push('/(tabs)/prayers');
        break;
      case 'worship-songs':
        console.log('Navigating to songs');
        router.push('/(tabs)/songs');
        break;
      case 'testimonials':
        console.log('Navigating to testimonials');
        router.push('/(tabs)/testimonials');
        break;
      case 'sermons':
      case 'bible-studies':
      case 'devotionals':
      case 'events':
      case 'youth':
        console.log('Navigating to inspiration');
        router.push('/(tabs)/inspiration');
        break;
      default:
        console.log('Navigating to inspiration (default)');
        router.push('/(tabs)/inspiration');
    }
  };

  const contentSections = [
    {
      title: 'Prayers',
      description: 'Personal and community prayers',
      icon: BookOpen,
      route: '/(tabs)/prayers' as const,
      color: '#6366f1',
    },
    {
      title: 'Songs',
      description: 'Worship songs and hymns',
      icon: Music,
      route: '/(tabs)/songs' as const,
      color: '#8b5cf6',
    },
    {
      title: 'Testimonials',
      description: 'Stories of faith and hope',
      icon: Heart,
      route: '/(tabs)/testimonials' as const,
      color: '#ec4899',
    },
  ];

  const quickActions = [
    {
      title: 'New Prayer',
      route: '/prayer/new' as const,
      icon: Plus,
      color: '#6366f1',
    },
    {
      title: 'Share Testimony',
      route: '/testimonial/new' as const,
      icon: Plus,
      color: '#ec4899',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Content</Text>
        <Text style={styles.subtitle}>Explore prayers, songs, and testimonials</Text>
      </View>

      {/* Popular Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={Colors.light.primary} />
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Popular Categories</Text>
        </View>
        <View style={styles.categoriesGrid}>
          {popularCategories.map((category) => (
            <ContentCategoryCard
              key={category.id}
              category={category}
              onPress={handleCategoryPress}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Content</Text>
        <View style={styles.grid}>
          {contentSections.map((section) => {
            const Icon = section.icon;
            return (
              <TouchableOpacity
                key={section.title}
                style={[styles.card, { borderLeftColor: section.color }]}
                onPress={() => router.push(section.route)}
              >
                <View style={[styles.iconContainer, { backgroundColor: section.color + '15' }]}>
                  <Icon size={24} color={section.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{section.title}</Text>
                  <Text style={styles.cardDescription}>{section.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoggedIn && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.title}
                  style={[styles.actionCard, { backgroundColor: action.color + '10' }]}
                  onPress={() => router.push(action.route)}
                >
                  <Icon size={20} color={action.color} />
                  <Text style={[styles.actionText, { color: action.color }]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});