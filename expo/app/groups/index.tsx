import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Users, MessageCircle, Search, Filter, Hash, Lock, Globe, TrendingUp, ArrowLeft, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { trpc } from '@/lib/trpc';
import BottomNavigation from '@/components/BottomNavigation';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GroupDiscussion {
  id: string;
  title: string;
  description: string;
  memberCount: number;
  messageCount: number;
  lastActivity: string;
  isPrivate: boolean;
  category: string;
  tags: string[];
  creator: string;
  isJoined: boolean;
  isActive: boolean;
  distance?: number;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export default function GroupDiscussionsScreen() {
  const { plan, isLoggedIn } = useUserStore();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const isIndividualPlan = plan === 'individual' || plan === 'individual_yearly' || plan === 'free';
  const hasFamilyAccess = plan === 'group_family';

  // Get Location
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // Web location logic if needed, or skip
        return;
      }
      
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
      } catch (err) {
        console.log('Error getting location:', err);
      }
    })();
  }, []);

  // Use TRPC query instead of mock data - only query when user is logged in
  const { data: groupsData, isLoading, refetch } = trpc.groups.list.useQuery(
    {
      search: searchQuery || undefined,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      limit: 50,
      offset: 0,
      latitude: location?.lat,
      longitude: location?.lng,
    },
    {
      enabled: isLoggedIn,
      retry: false,
    }
  );

  // Fallback mock data for when API is unavailable or user is not logged in
  const mockGroups: GroupDiscussion[] = [
    {
      id: '1',
      title: 'Daily Prayer Circle',
      description: 'Join us for daily prayer and spiritual encouragement',
      memberCount: 45,
      messageCount: 234,
      lastActivity: '2 minutes ago',
      isPrivate: false,
      category: 'prayer',
      tags: ['prayer', 'daily', 'community'],
      creator: 'Pastor John',
      isJoined: false,
      isActive: true,
    },
    {
      id: '2',
      title: 'Youth Bible Study',
      description: 'Weekly Bible study for young adults and teens',
      memberCount: 28,
      messageCount: 156,
      lastActivity: '15 minutes ago',
      isPrivate: false,
      category: 'youth',
      tags: ['youth', 'bible-study', 'teens'],
      creator: 'Sarah M.',
      isJoined: false,
      isActive: true,
    },
    {
      id: '3',
      title: 'Worship Team Discussion',
      description: 'Private group for worship team coordination',
      memberCount: 12,
      messageCount: 89,
      lastActivity: '1 hour ago',
      isPrivate: true,
      category: 'worship',
      tags: ['worship', 'music', 'team'],
      creator: 'David L.',
      isJoined: false,
      isActive: true,
    },
    {
      id: '4',
      title: 'Marriage & Family Support',
      description: 'Support group for married couples and families',
      memberCount: 67,
      messageCount: 445,
      lastActivity: '3 hours ago',
      isPrivate: false,
      category: 'fellowship',
      tags: ['marriage', 'family', 'support'],
      creator: 'Pastor Mike',
      isJoined: false,
      isActive: true,
    },
  ];

  // tRPC mutation for joining groups
  const joinGroupMutation = trpc.groups.join.useMutation({
    onSuccess: (data, variables) => {
      Alert.alert(
        'Success! 🎉', 
        data.message || 'You have joined the group discussion!',
        [
          { text: 'View Group', onPress: () => router.push(`/groups/${variables.groupId}`) },
          { text: 'OK', style: 'default' }
        ]
      );
      refetch(); // Refresh list to update status
    },
    onError: (error) => {
      Alert.alert('Unable to Join Group', error.message || 'Failed to join group. Please try again.');
    },
  });

  const categories = [
    { id: 'all', name: 'All Groups', icon: Globe },
    { id: 'prayer', name: 'Prayer', icon: MessageCircle },
    { id: 'bible-study', name: 'Bible Study', icon: Hash },
    { id: 'youth', name: 'Youth', icon: Users },
    { id: 'worship', name: 'Worship', icon: TrendingUp },
    { id: 'fellowship', name: 'Fellowship', icon: Users },
    { id: 'outreach', name: 'Outreach', icon: Globe },
  ];

  // Use data from query or fallback to mock data when not logged in or API fails
  const displayGroups: GroupDiscussion[] = isLoggedIn && groupsData?.groups 
    ? (groupsData.groups as unknown as GroupDiscussion[])
    : mockGroups;

  // Apply local filtering to mock data
  const filteredGroups = displayGroups.filter(group => {
    const matchesSearch = !searchQuery || 
      group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinGroup = async (groupId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to join group discussions.');
      return;
    }

    try {
      await joinGroupMutation.mutateAsync({ groupId });
    } catch (error) {
      // Error is handled in the mutation's onError callback
      console.error('Failed to join group:', error);
    }
  };

  const handleCreateGroup = () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to create group discussions.');
      return;
    }

    // Maybe limit creation to paid plans?
    if (isIndividualPlan) {
       Alert.alert(
        'Upgrade Required',
        'Creating group discussions requires a church plan. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/membership') },
        ]
      );
      return;
    }

    router.push('/groups/create');
  };

  const handleGroupPress = (group: GroupDiscussion) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to access group discussions.');
      return;
    }

    // If individual plan and not joined, show join prompt or allow preview if public
    if (!group.isJoined) {
      handleJoinGroup(group.id);
      return;
    }

    if (group.isJoined) {
      router.push(`/groups/${group.id}`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Group Discussions',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateGroup} style={styles.headerButton}>
              <Plus size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Header */}
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark] as const}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Find Church Groups</Text>
        <Text style={styles.headerSubtitle}>
          {location ? 'Showing groups near you' : 'Connect and grow together in faith'}
        </Text>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textMedium}
          />
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Filter size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.selectedCategoryChip
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Icon
                    size={16}
                    color={isSelected ? Colors.light.white : Colors.light.primary}
                  />
                  <Text style={[
                    styles.categoryText,
                    isSelected && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Groups List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hasFamilyAccess && (
          <TouchableOpacity 
            style={styles.familyBanner}
            onPress={() => router.push('/family')}
          >
            <LinearGradient
              colors={[Colors.light.primary + '15', Colors.light.primary + '05'] as const}
              style={styles.familyBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.familyBannerContent}>
                <View style={styles.familyBannerIcon}>
                  <Users size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.familyBannerText}>
                  <Text style={styles.familyBannerTitle}>Manage Family Group</Text>
                  <Text style={styles.familyBannerSubtitle}>
                    Looking for your private family group? Tap here to manage members.
                  </Text>
                </View>
                <ArrowLeft size={20} color={Colors.light.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.groupsList}>
          {filteredGroups.map((group) => {
            const Icon = group.isPrivate ? Lock : Globe;
            
            return (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupCard,
                  group.isJoined && styles.joinedGroupCard
                ]}
                onPress={() => handleGroupPress(group)}
              >
                <View style={styles.groupHeader}>
                  <View style={styles.groupTitleRow}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <View style={styles.groupIcons}>
                      <Icon size={16} color={Colors.light.textMedium} />
                      {group.isJoined && (
                        <View style={styles.joinedBadge}>
                          <Text style={styles.joinedBadgeText}>Joined</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.groupDescription}>{group.description}</Text>
                </View>

                <View style={styles.groupTags}>
                  {group.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.groupStats}>
                  <View style={styles.stat}>
                    <Users size={14} color={Colors.light.textMedium} />
                    <Text style={styles.statText}>{group.memberCount} members</Text>
                  </View>
                  {group.distance !== undefined && group.distance !== null && (
                    <View style={styles.stat}>
                       <MapPin size={14} color={group.distance < 50 ? Colors.light.primary : Colors.light.textMedium} />
                       <Text style={[styles.statText, group.distance < 50 && styles.nearbyText]}>
                         {group.distance.toFixed(1)} km away
                         {group.distance < 50 && ' (Nearby)'}
                       </Text>
                    </View>
                  )}
                  {group.location?.address && (
                    <View style={styles.stat}>
                       <Text style={[styles.statText, { maxWidth: 120 }]} numberOfLines={1}>{group.location.address}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.groupFooter}>
                  <Text style={styles.creatorText}>Created by {group.creator}</Text>
                  {!group.isJoined && (
                    <TouchableOpacity
                      style={[
                        styles.joinButton,
                        joinGroupMutation.isPending && styles.joinButtonDisabled
                      ]}
                      onPress={() => handleJoinGroup(group.id)}
                      disabled={joinGroupMutation.isPending}
                    >
                      <Text style={styles.joinButtonText}>
                        {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {!isLoading && filteredGroups.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={Colors.light.textLight} />
            <Text style={styles.emptyTitle}>No groups found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a group discussion'}
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.white,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  searchSection: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  filterButton: {
    padding: theme.spacing.xs,
  },
  categoriesContainer: {
    marginTop: theme.spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: theme.spacing.xs,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  selectedCategoryText: {
    color: Colors.light.white,
  },
  content: {
    flex: 1,
  },
  upgradePrompt: {
    padding: theme.spacing.lg,
  },
  upgradeCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  groupsList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  groupCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...theme.shadows.small,
  },
  joinedGroupCard: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success + '05',
  },
  groupHeader: {
    marginBottom: theme.spacing.md,
  },
  groupTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  groupIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  joinedBadge: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  joinedBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  nearbyText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  joinButtonDisabled: {
    backgroundColor: Colors.light.textLight,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  familyBanner: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  familyBannerGradient: {
    padding: theme.spacing.md,
  },
  familyBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  familyBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyBannerText: {
    flex: 1,
  },
  familyBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 2,
  },
  familyBannerSubtitle: {
    fontSize: 12,
    color: Colors.light.textMedium,
    lineHeight: 16,
  },
});