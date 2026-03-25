import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, ImageBackground, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Search, Plus, Filter, Heart, MessageCircle, PenTool, Gift, Compass, Star, Shield, Zap } from 'lucide-react-native';
import { TestimonialCard } from '@/components/TestimonialCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useTestimonialStore } from '@/store/testimonialStore';
import { useUserStore } from '@/store/userStore';
import { getSafeUri, FALLBACK_IMAGES } from '@/utils/imageUtils';

type Category = { id: string; name: string };

const TESTIMONIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'healing', name: 'Healing' },
  { id: 'provision', name: 'Provision' },
  { id: 'guidance', name: 'Guidance' },
  { id: 'salvation', name: 'Salvation' },
  { id: 'protection', name: 'Protection' },
  { id: 'breakthrough', name: 'Breakthrough' }
];

export default function TestimonialsScreen() {
  const { testimonials = [], likeTestimonial, fetchTestimonials, isLoading, error } = useTestimonialStore();
  const { isLoggedIn } = useUserStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);
const [sortMode, setSortMode] = useState<'new' | 'top'>('new');

  // Fetch testimonials on component mount
  useEffect(() => {
    if (fetchTestimonials && typeof fetchTestimonials === 'function') {
      try {
        fetchTestimonials();
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (fetchTestimonials && typeof fetchTestimonials === 'function') {
      try {
        await fetchTestimonials();
      } catch (error) {
        console.error('Error refreshing testimonials:', error);
      }
    }
    setRefreshing(false);
  };

  // Filter testimonials based on search and category with null checks
  const filteredTestimonials = useMemo(() => {
  const base = testimonials ? testimonials.filter((testimonial) => {
    if (!testimonial) return false;
    const matchesSearch = (testimonial.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (testimonial.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (testimonial.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || testimonial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];
  const sorted = [...base].sort((a, b) => {
    if (sortMode === 'top') {
      const la = a?.likes ?? 0; const lb = b?.likes ?? 0; return lb - la;
    }
    const da = a?.date ? new Date(a.date).getTime() : 0;
    const db = b?.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });
  return sorted;
}, [testimonials, searchQuery, selectedCategory, sortMode]);

  const handleTestimonialPress = (id: string) => {
    try {
      router.push(`/testimonial/${id}`);
    } catch (error) {
      console.error('Error navigating to testimonial:', error);
    }
  };

  const handleLike = (id: string) => {
    if (likeTestimonial && typeof likeTestimonial === 'function') {
      try {
        likeTestimonial(id);
      } catch (error) {
        console.error('Error liking testimonial:', error);
      }
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAddTestimony = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    try {
      router.push('/testimonial/new');
    } catch (error) {
      console.error('Error navigating to new testimonial:', error);
    }
  };

  const handleRetry = () => {
    if (fetchTestimonials && typeof fetchTestimonials === 'function') {
      try {
        fetchTestimonials();
      } catch (error) {
        console.error('Error retrying fetch:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Testimonials',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
            headerTitleStyle: { color: Colors.light.text },
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading testimonials...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Testimonials',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
            headerTitleStyle: { color: Colors.light.text },
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Try Again"
            onPress={handleRetry}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="testimonials-screen">
      <Stack.Screen
        options={{
          title: 'Testimonials',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { color: Colors.light.text },
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAddTestimony}
              style={styles.headerButton}
              testID="add-testimony-header-btn"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={24} color={Colors.light.tint} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        testID="testimonials-scroll"
      >
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: getSafeUri('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1200&auto=format&fit=crop', FALLBACK_IMAGES.testimonial) }}
            resizeMode="cover"
            style={styles.heroBg}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Heart size={40} color={Colors.light.white} />
              <Text style={styles.heroTitle}>Share Your Story</Text>
              <Text style={styles.heroSubtitle}>
                Your testimony can inspire and encourage others in their faith journey
              </Text>
              <Button
                title="Add Your Testimony"
                onPress={handleAddTestimony}
                icon={<PenTool size={18} color={Colors.light.white} />}
                style={styles.heroButton}
              />
            </View>
          </ImageBackground>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.light.icon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search testimonials..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.icon}
              testID="testimonials-search"
            />
          </View>
          <TouchableOpacity
            onPress={() => setSortMode((m) => (m === 'new' ? 'top' : 'new'))}
            style={styles.sortButton}
            testID="sort-toggle"
            accessibilityRole="button"
          >
            <Filter size={18} color={Colors.light.text} />
            <Text style={styles.sortLabel}>{sortMode === 'new' ? 'Newest' : 'Top'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
          testID="categories-scroll"
        >
          {TESTIMONIAL_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;
            const colorMap: Record<string, string> = {
              healing: '#E57373',
              provision: '#64B5F6',
              guidance: '#81C784',
              salvation: '#BA68C8',
              protection: '#4DB6AC',
              breakthrough: '#FFB74D',
            };
            const iconColor = isActive ? Colors.light.background : Colors.light.text;
            const bg = isActive ? (colorMap[category.id] ?? Colors.light.tint) : Colors.light.background;
            const border = isActive ? (colorMap[category.id] ?? Colors.light.tint) : Colors.light.border;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: bg, borderColor: border },
                ]}
                onPress={() => handleCategoryPress(category.id)}
                testID={`category-${category.id}`}
                accessibilityRole="button"
              >
                <View style={styles.categoryInner}>
                  {category.id === 'healing' && <Heart size={14} color={iconColor} />}
                  {category.id === 'provision' && <Gift size={14} color={iconColor} />}
                  {category.id === 'guidance' && <Compass size={14} color={iconColor} />}
                  {category.id === 'salvation' && <Star size={14} color={iconColor} />}
                  {category.id === 'protection' && <Shield size={14} color={iconColor} />}
                  {category.id === 'breakthrough' && <Zap size={14} color={iconColor} />}
                  <Text style={[
                    styles.categoryButtonText,
                    isActive ? styles.categoryButtonTextActive : undefined,
                  ]}>
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredTestimonials.length > 0 ? (
          <View style={styles.testimonialsContainer}>
            {filteredTestimonials.map((testimonial) => (
              testimonial ? (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  onPress={() => handleTestimonialPress(testimonial.id)}
                  onLike={() => handleLike(testimonial.id)}
                />
              ) : null
            ))}
          </View>
        ) : (
          <EmptyState
            title="No testimonials found"
            description={searchQuery ? 'Try adjusting your search terms' : 'No testimonials available in this category'}
            icon="testimonial"
            action={
              <Button
                title="Share Your Story"
                onPress={handleAddTestimony}
                icon={<MessageCircle size={16} color={Colors.light.background} />}
              />
            }
          />
        )}

        {filteredTestimonials.length > 0 && (
          <View style={styles.bottomCTA}>
            <Text style={styles.bottomCTAText}>
              Have a testimony to share?
            </Text>
            <Button
              title="Add Your Testimony"
              onPress={handleAddTestimony}
              variant="outline"
              icon={<Plus size={16} color={Colors.light.primary} />}
              style={styles.bottomCTAButton}
            />
          </View>
        )}

        <View style={styles.bottomSpacing} />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    marginTop: theme.spacing.md,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  heroSection: {
    backgroundColor: Colors.light.primaryLight,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  heroBg: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroContent: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  heroTitle: {
    ...theme.typography.title,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.white,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: Colors.light.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
    opacity: 0.95,
  },
  heroButton: {
    minWidth: 200,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  sortLabel: {
    ...theme.typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
  },
  categoriesContent: {
    paddingRight: theme.spacing.lg,
  },
  categoryButton: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  categoryButtonText: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  categoryButtonTextActive: {
    color: Colors.light.background,
  },
  testimonialsContainer: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  bottomCTA: {
    backgroundColor: Colors.light.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  bottomCTAText: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  bottomCTAButton: {
    minWidth: 180,
  },
  bottomSpacing: {
    height: 100,
  },
});