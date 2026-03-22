import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Animated } from 'react-native';
import { Stack, router, useFocusEffect, useNavigation } from 'expo-router';
import { Plus, Heart, CheckCircle, Users, Flame, MessageCircle, BookOpen } from 'lucide-react-native';
import { PrayerCard } from '@/components/PrayerCard';
import { EmptyState } from '@/components/EmptyState';
import { PrayerCommentModal } from '@/components/PrayerCommentModal';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/utils/translations';

import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';
import { getDirectusApiUrl } from '@/utils/api';

export default function PrayersScreen() {
  const { isLoggedIn, prayerStreak, updatePrayerStreak, settings, user, organization, plan } = useUserStore();
  const { t } = useTranslation(settings.language);
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const [activeTab, setActiveTab] = useState<'active' | 'answered' | 'community' | 'wall'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<{ id: string; title: string } | null>(null);

  const hasGroupAccess = plan && ['org_small', 'org_medium', 'org_large', 'group_family', 'small_church', 'large_church'].includes(plan);

  const [activePrayers, setActivePrayers] = useState<any[]>([]);
  const [answeredPrayers, setAnsweredPrayers] = useState<any[]>([]);
  const [communityPrayers, setCommunityPrayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrayers = useCallback(async () => {
    if (!user?.id || !organization?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const activeFilter = `filter[user_id][_eq]=${user.id}&filter[organization_id][_eq]=${organization.id}&filter[answered][_eq]=false,0`;
      const answeredFilter = `filter[user_id][_eq]=${user.id}&filter[organization_id][_eq]=${organization.id}&filter[answered][_eq]=1`;
      const communityFilter = `filter[organization_id][_eq]=${organization.id}&filter[shareOnWall][_eq]=1`;

      const [activeRes, answeredRes, communityRes] = await Promise.all([
        fetchWithAuth(`${getDirectusApiUrl()}/items/prayers?${activeFilter}&fields=*,user_id.id,user_id.first_name,user_id.last_name&sort=-date_created`),
        fetchWithAuth(`${getDirectusApiUrl()}/items/prayers?${answeredFilter}&fields=*,user_id.id,user_id.first_name,user_id.last_name&sort=-date_created`),
        fetchWithAuth(`${getDirectusApiUrl()}/items/prayers?${communityFilter}&fields=*,user_id.id,user_id.first_name,user_id.last_name&sort=-date_created`),
      ]);

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActivePrayers(data.data || []);
      } else {
        console.error('Failed to fetch active prayers:', await activeRes.text());
      }

      if (answeredRes.ok) {
        const data = await answeredRes.json();
        setAnsweredPrayers(data.data || []);
      } else {
        console.error('Failed to fetch answered prayers:', await answeredRes.text());
      }

      if (communityRes.ok) {
        const data = await communityRes.json();
        setCommunityPrayers(data.data || []);
      } else {
        console.error('Failed to fetch community prayers:', await communityRes.text());
      }
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.accessToken, organization?.id]);

  const navigation = useNavigation();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Prayers screen focused');

      if (!isLoggedIn) {
        console.log('User not logged in, redirecting to login...');
        router.replace('/login');
        return;
      }
      
      navigation.setOptions({
        title: 'Prayers',
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleAddPrayer}
            style={styles.headerAddButton}
          >
            <Plus size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        ),
      });

      if (user?.id && organization?.id) {
        console.log('Fetching prayers on focus...');
        fetchPrayers();
      } else {
        setIsLoading(false);
      }

      return () => {
        console.log('Prayers screen unfocused');
      };
    }, [isLoggedIn, user?.id, organization?.id, fetchPrayers])
  );

  useEffect(() => {
    const checkOrganizerRole = async () => {
      if (organization?.id && user?.id) {
        try {
          const response = await fetchWithAuth(
            `${getDirectusApiUrl()}/items/organization_users?filter[user_id][_eq]=${user.id}&filter[organization_id][_eq]=${organization.id}&fields=role_id`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              const roleId = data.data[0].role_id;
              setIsOrganizer(roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID);
            }
          } else {
            console.error('Failed to check organizer role:', await response.text());
          }
        } catch (error) {
          console.error('Error checking organizer role:', error);
        }
      } else {
        setIsOrganizer(false);
      }
    };
    
    checkOrganizerRole();
  }, [organization?.id, user?.id]);

  const refetch = fetchPrayers;

  const updatePrayer = async (id: string, updates: any) => {
    try {
      const response = await fetchWithAuth(`${getDirectusApiUrl()}/items/prayers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchPrayers();
      } else {
        console.error('Failed to update prayer:', await response.text());
      }
    } catch (error) {
      console.error('Error updating prayer:', error);
    }
  };

  const markPrayed = async (prayerId: string, comment: string) => {
    try {
      const prayer = communityPrayers.find(p => p.id === prayerId);
      if (!prayer) return;

      const newCount = (prayer.prayerCount || 0) + 1;
      const updateRes = await fetchWithAuth(`${getDirectusApiUrl()}/items/prayers/${prayerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ prayerCount: newCount }),
      });

      if (!updateRes.ok) {
        console.error('Failed to update prayer count:', await updateRes.text());
      }

      if (comment.trim()) {
        const commentRes = await fetchWithAuth(`${getDirectusApiUrl()}/items/prayer_comments`, {
          method: 'POST',
          body: JSON.stringify({
            prayer_id: prayerId,
            user_id: user?.id,
            comments: comment,
            liked: false,
          }),
        });

        if (!commentRes.ok) {
          console.error('Failed to add comment:', await commentRes.text());
        }
      }

      setShowPrayerModal(false);
      setSelectedPrayer(null);
      await fetchPrayers();
      Alert.alert('Success', 'Thank you for praying! Your prayer has been recorded.');
    } catch (error) {
      console.error('Error marking prayed:', error);
      Alert.alert('Error', 'Failed to record prayer');
    }
  };

  const deletePrayer = async (id: string) => {
    try {
      const response = await fetchWithAuth(`${getDirectusApiUrl()}/items/prayers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPrayers();
      } else {
        console.error('Failed to delete prayer:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting prayer:', error);
    }
  };
  


  const onRefresh = async () => {
    setRefreshing(true);
    if (isLoggedIn) {
      await refetch();
    }
    setRefreshing(false);
  };

  const currentPrayers = activeTab === 'active' ? activePrayers : activeTab === 'answered' ? answeredPrayers : activeTab === 'community' ? communityPrayers : [];
  console.log('Current prayers to display:', currentPrayers.length);
  console.log('Current prayers:', currentPrayers);

  const handlePrayerAction = async (id: string) => {
    try {
      const allPrayers = [...activePrayers, ...answeredPrayers];
      const prayer = allPrayers.find((p: any) => p.id === id);
      if (prayer) {
        await updatePrayer(id, { answered: !prayer.answered });
      }
      if (isLoggedIn && updatePrayerStreak) {
        updatePrayerStreak();
      }
    } catch (error) {
      console.error('Error handling prayer action:', error);
    }
  };

  const handleDeletePrayer = async (id: string) => {
    try {
      await deletePrayer(id);
    } catch (error) {
      console.error('Error deleting prayer:', error);
    }
  };

  const handleMarkPrayed = (id: string) => {
    try {
      const prayer = communityPrayers.find((p: any) => p.id === id);
      if (prayer) {
        setSelectedPrayer({ id: prayer.id, title: prayer.title });
        setShowPrayerModal(true);
      }
    } catch (error) {
      console.error('Error marking prayer as prayed:', error);
    }
  };

  const handleSubmitPrayer = async (comment: string) => {
    if (selectedPrayer) {
      await markPrayed(selectedPrayer.id, comment);
    }
  };

  const handleAddPrayer = () => {
    if (isLoggedIn) {
      router.push('/prayer/new');
    } else {
      router.push('/login');
    }
  };

  const safeStreak = prayerStreak?.currentStreak || 0;

  const getEmptyStateTitle = () => {
    if (activeTab === 'active') return 'No Active Prayers Yet';
    if (activeTab === 'answered') return 'No Answered Prayers Yet';
    return 'No Community Prayers Yet';
  };

  const getEmptyStateDescription = () => {
    if (activeTab === 'active') return 'Start your prayer journey by adding your first prayer request';
    if (activeTab === 'answered') return 'When your prayers are answered, they will appear here';
    return 'Join your community in prayer by sharing prayer requests on the wall';
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>
        {/* Stats Grid - 2x2 on mobile for better readability */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={[styles.statCard, styles.statCardPrimary]} 
              activeOpacity={0.7}
              onPress={() => setActiveTab('active')}
            >
              <View style={styles.statIconContainer}>
                <Heart size={24} color={Colors.light.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>{activePrayers.length}</Text>
              <Text style={styles.statLabel}>{t('prayers.active')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statCard, styles.statCardSuccess]} 
              activeOpacity={0.7}
              onPress={() => setActiveTab('answered')}
            >
              <View style={styles.statIconContainer}>
                <CheckCircle size={24} color={Colors.light.success} strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>{answeredPrayers.length}</Text>
              <Text style={styles.statLabel}>{t('prayers.answered')}</Text>
            </TouchableOpacity>
            
            {hasGroupAccess && (
            <TouchableOpacity 
              style={[styles.statCard, styles.statCardSecondary]} 
              activeOpacity={0.7}
              onPress={() => setActiveTab('community')}
            >
              <View style={styles.statIconContainer}>
                <Users size={24} color={Colors.light.secondary} strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>{communityPrayers.length}</Text>
              <Text style={styles.statLabel}>Community</Text>
            </TouchableOpacity>
            )}
            
            {isLoggedIn && (
              <View style={[styles.statCard, styles.statCardStreak]}>
                <View style={styles.statIconContainer}>
                  <Flame size={24} color="#FF9500" strokeWidth={2.5} />
                </View>
                <Text style={styles.statNumber}>{safeStreak}</Text>
                <Text style={styles.statLabel}>{t('prayers.streak')} Days</Text>
              </View>
            )}
          </View>
        </View>

        {/* Prayer Assistance Banner */}
        <TouchableOpacity
          style={styles.assistanceBanner}
          onPress={() => router.push('/prayer/assistance')}
          activeOpacity={0.8}
        >
          <View style={styles.assistanceBannerIcon}>
            <BookOpen size={20} color={Colors.light.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.assistanceBannerContent}>
            <Text style={styles.assistanceBannerTitle}>Prayer Assistance</Text>
            <Text style={styles.assistanceBannerSubtitle}>Biblical prayers for breakthrough</Text>
          </View>
          <View style={styles.assistanceBannerArrow}>
            <Text style={styles.assistanceBannerArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              {t('prayers.active')} ({activePrayers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'answered' && styles.tabActive]}
            onPress={() => setActiveTab('answered')}
          >
            <Text style={[styles.tabText, activeTab === 'answered' && styles.tabTextActive]}>
              {t('prayers.answered')} ({answeredPrayers.length})
            </Text>
          </TouchableOpacity>
          {hasGroupAccess && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'community' && styles.tabActive]}
            onPress={() => setActiveTab('community')}
          >
            <Text style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}>
              {t('prayers.prayerWall')} ({communityPrayers.length})
            </Text>
          </TouchableOpacity>
          )}
          {/* <TouchableOpacity
            style={[styles.tab, activeTab === 'wall' && styles.tabActive]}
            onPress={() => router.push('../prayer-wall')}
          >
            <Text style={[styles.tabText, activeTab === 'wall' && styles.tabTextActive]}>
              Prayer Wall
            </Text>
          </TouchableOpacity> */}
        </View>

        {/* Prayers List */}
        <ScrollView 
          style={styles.prayersList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {!isLoggedIn ? (
            <EmptyState
              icon="prayer"
              title={t('home.joinCommunity')}
              description={t('home.signInPrompt')}
              actionText={t('auth.login')}
              onAction={() => router.push('/login')}
            />
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Loading prayers...</Text>
            </View>
          ) : currentPrayers.length === 0 ? (
            <EmptyState
              icon="prayer"
              title={getEmptyStateTitle()}
              description={getEmptyStateDescription()}
              actionText={activeTab === 'community' ? undefined : 'Add Prayer Request'}
              onAction={activeTab === 'community' ? undefined : handleAddPrayer}
            />
          ) : (
            <View style={styles.prayersGrid}>
              {currentPrayers.map((prayer: any) => (
                prayer ? (
                  <View key={prayer.id} style={styles.prayerItemWrapper}>
                    <PrayerCard
                      prayer={{
                        id: prayer.id,
                        title: prayer.title,
                        content: prayer.content,
                        isAnswered: prayer.answered,
                        category: prayer.category,
                        createdAt: prayer.date_created,
                        prayerCount: prayer.prayerCount || 0,
                        userId: prayer.user_id?.id || prayer.user_id,
                        userName: prayer.user_id?.first_name && prayer.user_id?.last_name 
                          ? `${prayer.user_id.first_name} ${prayer.user_id.last_name}` 
                          : 'Anonymous',
                        isPrivate: !prayer.shareOnWall,
                        updatedAt: prayer.date_updated || prayer.date_created,
                        tags: [],
                      }}
                      currentUserId={user?.id}
                      isOrganizer={isOrganizer}
                      isCommunityTab={activeTab === 'community'}
                      onToggleAnswered={activeTab !== 'community' ? handlePrayerAction : undefined}
                      onDelete={activeTab !== 'community' ? handleDeletePrayer : undefined}
                      onMarkPrayed={activeTab === 'community' ? handleMarkPrayed : undefined}
                    />
                    {activeTab === 'community' && (
                      <TouchableOpacity
                        style={styles.joinLivePrayerButton}
                        onPress={() => router.push(`/prayer/${prayer.id}`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.joinButtonContent}>
                          <View style={styles.joinButtonLeft}>
                            <MessageCircle size={16} color={Colors.light.primary} strokeWidth={2.5} />
                            <View style={styles.joinTextContainer}>
                              <Text style={styles.joinLivePrayerText}>Join Prayer Live </Text>
                              <Animated.Text style={[styles.joinLivePrayerText, { opacity: blinkAnim }]}>
                                {prayer.user_id?.first_name || 'Anonymous'}
                              </Animated.Text>
                            </View>
                          </View>
                          {prayer.prayerCount > 0 && (
                            <View style={styles.prayerCountBadge}>
                              <Text style={styles.prayerCountText}>{prayer.prayerCount}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null
              ))}
            </View>
          )}
          
          {/* Bottom spacing for FAB */}
          <View style={styles.bottomSpacing} />
        </ScrollView>



        {/* Bottom Add Prayer Button */}
        {isLoggedIn && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.bottomAddButton}
              onPress={handleAddPrayer}
              activeOpacity={0.9}
            >
              <Plus size={24} color={Colors.light.white} strokeWidth={3} />
              <Text style={styles.bottomAddButtonText}>Add Prayer Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <PrayerCommentModal
        visible={showPrayerModal}
        onClose={() => {
          setShowPrayerModal(false);
          setSelectedPrayer(null);
        }}
        onSubmit={handleSubmitPrayer}
        isSubmitting={false}
        prayerTitle={selectedPrayer?.title || ''}
      />
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
  headerAddButton: {
    padding: theme.spacing.xs,
  },
  statsContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  statCard: {
    flex: 1,
    flexBasis: '47%',
    backgroundColor: Colors.light.card,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...theme.shadows.small,
  },
  statCardPrimary: {
    borderWidth: 2,
    borderColor: Colors.light.primary + '20',
  },
  statCardSuccess: {
    borderWidth: 2,
    borderColor: Colors.light.success + '20',
  },
  statCardSecondary: {
    borderWidth: 2,
    borderColor: Colors.light.secondary + '20',
  },
  statCardStreak: {
    borderWidth: 2,
    borderColor: '#FF9500' + '20',
  },
  statIconContainer: {
    marginBottom: 0,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    letterSpacing: -0.5,
    marginTop: -2,
  },
  statLabel: {
    fontSize: 8,
    color: Colors.light.textMedium,
    marginTop: -2,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textMedium,
  },
  tabTextActive: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  prayersList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  prayersGrid: {
    gap: theme.spacing.md,
  },
  bottomSpacing: {
    height: 140,
  },

  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  bottomAddButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
    minHeight: 56,
  },
  bottomAddButtonText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  prayerItemWrapper: {
    marginBottom: theme.spacing.lg,
  },
  joinLivePrayerButton: {
    backgroundColor: Colors.light.card,
    marginTop: theme.spacing.xs,
    marginHorizontal: 0,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.primary + '30',
    ...theme.shadows.small,
  },
  joinButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  joinButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  joinTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinLivePrayerText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  prayerCountBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerCountText: {
    fontSize: 11,
    color: Colors.light.white,
    fontWeight: '800',
  },
  assistanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.primary + '30',
    ...theme.shadows.small,
  },
  assistanceBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  assistanceBannerContent: {
    flex: 1,
  },
  assistanceBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 1,
  },
  assistanceBannerSubtitle: {
    fontSize: 11,
    color: Colors.light.textMedium,
  },
  assistanceBannerArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistanceBannerArrowText: {
    fontSize: 16,
    color: Colors.light.white,
    fontWeight: '700',
  },
});
