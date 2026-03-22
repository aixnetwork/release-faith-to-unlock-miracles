import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView, Animated } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Search, Filter, Plus, ChevronDown, X, Users, MessageCircle, Send } from 'lucide-react-native';
import { BackButton } from '@/components/BackButton';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { CommunityPrayerCard } from '@/components/CommunityPrayerCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PrayerCommentModal } from '@/components/PrayerCommentModal';
import { useUserStore } from '@/store/userStore';
import { useAdminStore } from '@/store/adminStore';
import { getFirstName } from '@/utils/nameUtils';
import BottomNavigation from '@/components/BottomNavigation';
import { fetchWithAuth } from '@/utils/authUtils';
import { getDirectusApiUrl } from '@/utils/api';

const categories = [
  'All',
  'Health',
  'Family',
  'Finances',
  'Guidance',
  'Relationships',
  'Work',
  'Spiritual Growth',
  'Gratitude',
  'Other'
];

interface LiveUpdate {
  id: string;
  type: 'new_prayer' | 'prayer_answered' | 'user_joined' | 'milestone';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

interface LiveComment {
  id: string;
  prayerId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isEncouragement: boolean;
}

export default function PrayerWallScreen() {
  const { isLoggedIn, name, email, user, organization } = useUserStore();
  const { organizationId, isAuthenticated: isAdminAuthenticated } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategories, setShowCategories] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(Math.floor(Math.random() * 50) + 20);
  const [showLiveComments, setShowLiveComments] = useState(false);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [selectedPrayerTitle, setSelectedPrayerTitle] = useState<string>('');
  const [liveComments, setLiveComments] = useState<LiveComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrayerCommentModal, setShowPrayerCommentModal] = useState(false);
  const [prayersData, setPrayersData] = useState<any[]>([]);
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMarkingPrayed, setIsMarkingPrayed] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const nameFlashAnim = useRef(new Animated.Value(0)).current;
  const mainNameFlashAnim = useRef(new Animated.Value(0)).current;
  const [flashingName, setFlashingName] = useState<string>('');
  const [mainFlashingName, setMainFlashingName] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchPrayers = useCallback(async (isRefresh = false) => {
    console.log('=== Fetching Community Prayers ===');
    console.log('User:', user?.id);
    console.log('Organization:', organization?.id || organizationId);
    
    if (isRefresh) {
      setIsRefetching(true);
    } else {
      setIsLoadingPrayers(true);
    }
    setIsError(false);
    setErrorMessage('');
    
    try {
      const orgId = organization?.id || organizationId;
      
      let filterParams = 'filter[shareOnWall][_eq]=1&filter[status][_eq]=published';
      if (orgId) {
        filterParams += `&filter[organization_id][_eq]=${orgId}`;
      }
      
      const url = `${getDirectusApiUrl()}/items/prayers?${filterParams}&fields=*,user_id.id,user_id.first_name,user_id.last_name&sort=-date_created`;
      
      console.log('Fetching from URL:', url);
      
      const response = await fetchWithAuth(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch prayers:', response.status, errorText);
        setIsError(true);
        setErrorMessage(`Failed to load prayers (${response.status})`);
        return;
      }
      
      const data = await response.json();
      const prayers = data.data || [];
      
      console.log('Fetched prayers:', prayers.length);
      setPrayersData(prayers);
    } catch (error) {
      console.error('Error fetching prayers:', error);
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load prayers');
    } finally {
      setIsLoadingPrayers(false);
      setIsRefetching(false);
    }
  }, [user?.id, organization?.id, organizationId]);

  const refetch = useCallback(() => fetchPrayers(true), [fetchPrayers]);

  useEffect(() => {
    console.log('=== Prayer Wall Initial Load ===');
    fetchPrayers();
  }, [fetchPrayers]);

  useFocusEffect(
    useCallback(() => {
      console.log('=== Prayer Wall Focus Effect Triggered ===');
      console.log('isLoggedIn:', isLoggedIn);
      console.log('user?.id:', user?.id);
      
      if (prayersData.length > 0) {
        console.log('✅ Refetching prayers on focus...');
        refetch();
      }
    }, [isLoggedIn, user?.id, refetch, prayersData.length])
  );
  
  const onRefresh = useCallback(async () => {
    console.log('=== Manual Refresh Triggered ===');
    await refetch();
  }, [refetch]);
  
  const communityPrayers = React.useMemo(() => {
    if (!prayersData || prayersData.length === 0) return [];
    
    console.log('=== Processing Prayers ===');
    console.log('Raw prayers count:', prayersData.length);
    
    const processed = prayersData.map((prayer: any) => {
      let author = 'Anonymous';
      if (prayer.user_id && typeof prayer.user_id === 'object') {
        if (prayer.user_id.first_name || prayer.user_id.last_name) {
          author = [prayer.user_id.first_name, prayer.user_id.last_name].filter(Boolean).join(' ');
        }
      }
      
      return {
        id: prayer.id,
        title: prayer.title || 'Untitled Prayer',
        description: prayer.content || '',
        author,
        date: prayer.date_created || new Date().toISOString(),
        prayerCount: prayer.prayerCount || 0,
        hasPrayed: prayer.hasPrayed || false,
        isAnonymous: author === 'Anonymous',
        category: prayer.category || 'other',
      };
    });
    
    console.log('Processed prayers count:', processed.length);
    return processed;
  }, [prayersData]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const updateTypes: LiveUpdate['type'][] = ['new_prayer', 'prayer_answered', 'user_joined', 'milestone'];
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      const messages = {
        new_prayer: ['Sarah shared a prayer request', 'Michael needs prayer for healing', 'Emma asked for guidance'],
        prayer_answered: ['Prayer answered for John\'s job interview!', 'Praise report from Maria!', 'God answered Lisa\'s prayer!'],
        user_joined: ['David joined the prayer wall', 'Grace is now praying with us', 'James joined the community'],
        milestone: ['100 prayers this week!', '50 people praying together!', 'Community milestone reached!']
      };
      
      const newUpdate: LiveUpdate = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomType,
        message: messages[randomType][Math.floor(Math.random() * messages[randomType].length)],
        timestamp: new Date().toISOString(),
        userName: ['Sarah', 'Michael', 'Emma', 'John', 'Maria', 'Lisa'][Math.floor(Math.random() * 6)]
      };
      
      setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 4)]);
      
      // Animate new update
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Update online users count
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +2
        return Math.max(15, Math.min(100, prev + change));
      });
    }, 8000 + Math.random() * 4000); // Random interval between 8-12 seconds
    
    return () => clearInterval(interval);
  }, [fadeAnim]);

  // Simulate live comments
  useEffect(() => {
    if (!showLiveComments || !selectedPrayerId) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new comment
        const encouragements = [
          'Praying for you! 🙏',
          'God has got this! ❤️',
          'Sending love and prayers',
          'You are not alone in this',
          'Believing with you for breakthrough',
          'Lifting you up in prayer',
          'God is faithful! 🌟'
        ];
        
        const userName = ['Grace', 'David', 'Hope', 'Faith', 'Joy', 'Peace'][Math.floor(Math.random() * 6)];
        
        const newLiveComment: LiveComment = {
          id: Math.random().toString(36).substr(2, 9),
          prayerId: selectedPrayerId,
          userId: Math.random().toString(36).substr(2, 9),
          userName,
          message: encouragements[Math.floor(Math.random() * encouragements.length)],
          timestamp: new Date().toISOString(),
          isEncouragement: true
        };
        
        setLiveComments(prev => [...prev, newLiveComment]);
        
        // Flash the name for simulated comments too
        setFlashingName(userName);
        Animated.sequence([
          Animated.timing(nameFlashAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(nameFlashAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ]).start(() => {
          setFlashingName('');
        });
        
        // Auto scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds
    
    return () => clearInterval(interval);
  }, [showLiveComments, selectedPrayerId, nameFlashAnim]);

  interface Prayer {
    id: string;
    title: string;
    description: string;
    author: string;
    date: string;
    prayerCount: number;
    hasPrayed: boolean;
    isAnonymous: boolean;
    category: string;
  }

  const filteredPrayers = communityPrayers
    .filter((prayer: Prayer) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          prayer.title.toLowerCase().includes(query) ||
          prayer.description.toLowerCase().includes(query) ||
          prayer.author.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((prayer: Prayer) => {
      // Apply category filter
      if (selectedCategory === 'All') return true;
      return prayer.category === selectedCategory.toLowerCase();
    })
    .sort((a: Prayer, b: Prayer) => {
      try {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // If either date is invalid, put it at the end
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateB.getTime() - dateA.getTime();
      } catch {
        return 0;
      }
    });
  
  const handlePrayerPress = (id: string) => {
    console.log('=== Navigating to prayer detail ===');
    console.log('Prayer ID:', id);
    router.push(`/prayer/${id}` as any);
  };
  
  const markPrayed = async (prayerId: string, comment: string) => {
    const userId = user?.id;
    
    if (!userId) {
      console.error('❌ No user ID available');
      Alert.alert('Error', 'Please login to continue');
      return;
    }

    setIsMarkingPrayed(true);
    
    try {
      const prayer = prayersData.find(p => p.id === prayerId);
      if (!prayer) {
        throw new Error('Prayer not found');
      }

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
            user_id: userId,
            comments: comment,
            liked: false,
          }),
        });

        if (!commentRes.ok) {
          console.error('Failed to add comment:', await commentRes.text());
        }
      }

      console.log('✅ Prayer marked successfully');
      Alert.alert('Success', 'Thank you for praying! Your prayer has been recorded.');
      await refetch();
    } catch (error) {
      console.error('❌ Failed to mark prayer:', error);
      Alert.alert('Error', `Failed to record prayer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMarkingPrayed(false);
    }
  };

  const handlePrayFor = async (id: string) => {
    if (!isLoggedIn && !isAdminAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to pray for community requests.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') }
        ]
      );
      return;
    }
    
    const prayer = prayersData.find((p: any) => p.id === id);
    if (prayer) {
      setSelectedPrayerId(id);
      setSelectedPrayerTitle(prayer.title);
      setShowPrayerCommentModal(true);
    }
  };
  
  const handleSubmitPrayerComment = async (comment: string) => {
    if (!selectedPrayerId) {
      console.error('❌ No prayer ID selected');
      return;
    }
    
    markPrayed(selectedPrayerId, comment);
    
    // Show flashing name on main prayer wall
    const userFirstName = getFirstName(user?.first_name, user?.name || name, email);
    
    setMainFlashingName(userFirstName);
    Animated.sequence([
      Animated.timing(mainNameFlashAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(mainNameFlashAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start(() => {
      setMainFlashingName('');
    });
    
    setShowPrayerCommentModal(false);
    setSelectedPrayerId(null);
    setSelectedPrayerTitle('');
  };

  const handleOpenLiveComments = (prayerId: string) => {
    const prayer = prayersData.find((p: any) => p.id === prayerId);
    if (prayer) {
      setSelectedPrayerId(prayerId);
      setSelectedPrayerTitle(prayer.title);
      setLiveComments([]);
      setShowLiveComments(true);
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim() || !selectedPrayerId) return;
    
    const userFirstName = getFirstName(user?.first_name, user?.name || name, email);
    
    const comment: LiveComment = {
      id: Math.random().toString(36).substr(2, 9),
      prayerId: selectedPrayerId,
      userId: user?.id || email || 'anonymous',
      userName: userFirstName,
      message: newComment.trim(),
      timestamp: new Date().toISOString(),
      isEncouragement: true
    };
    
    setLiveComments(prev => [...prev, comment]);
    setNewComment('');
    setIsTyping(false);
    
    // Flash the name prominently
    setFlashingName(userFirstName);
    Animated.sequence([
      Animated.timing(nameFlashAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(nameFlashAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start(() => {
      setFlashingName('');
    });
    
    // Auto scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleAddPrayer = () => {
    if (!isLoggedIn && !isAdminAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to share prayer requests.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') }
        ]
      );
      return;
    }
    
    router.push('/prayer/new');
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        {isSearching ? (
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.light.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search prayer requests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              clearButtonMode="while-editing"
              returnKeyType="search"
              placeholderTextColor={Colors.light.textLight}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={Colors.light.textLight} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Live Prayer Wall</Text>
            <View style={styles.headerActions}>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>{onlineUsers} online</Text>
              </View>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => setIsSearching(true)}
              >
                <Search size={22} color={Colors.light.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => setShowCategories(!showCategories)}
              >
                <Filter size={22} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {showCategories && (
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item && styles.categoryButtonActive
                ]}
                onPress={() => {
                  setSelectedCategory(item);
                  setShowCategories(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === item && styles.categoryButtonTextActive
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}
      
      {/* Live Updates Banner */}
      {liveUpdates.length > 0 && (
        <Animated.View style={[styles.liveUpdateBanner, { opacity: fadeAnim }]}>
          <View style={styles.liveUpdateContent}>
            <View style={styles.liveDot} />
            <Text style={styles.liveUpdateText}>{liveUpdates[0]?.message}</Text>
          </View>
        </Animated.View>
      )}

      {selectedCategory !== 'All' && !showCategories && (
        <View style={styles.selectedCategoryContainer}>
          <Text style={styles.selectedCategoryLabel}>Category:</Text>
          <TouchableOpacity 
            style={styles.selectedCategory}
            onPress={() => setShowCategories(true)}
          >
            <Text style={styles.selectedCategoryText}>{selectedCategory}</Text>
            <ChevronDown size={16} color={Colors.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.clearCategoryButton}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={styles.clearCategoryText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  if (isLoadingPrayers && communityPrayers.length === 0) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Prayer Wall',
            headerShown: true,
            headerLeft: () => <BackButton />,
          }} 
        />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={{ marginTop: 16, color: Colors.light.textLight }}>Loading prayers...</Text>
        </View>
      </>
    );
  }

  if (isError && communityPrayers.length === 0) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Prayer Wall',
            headerShown: true,
            headerLeft: () => <BackButton />,
          }} 
        />
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={{ color: Colors.light.text, marginBottom: 16, textAlign: 'center', paddingHorizontal: 24 }}>
            {errorMessage || 'Failed to load prayers.'}
          </Text>
          <Button title="Try Again" onPress={() => fetchPrayers()} />
        </View>
      </>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Prayer Wall',
          headerShown: true,
          headerLeft: () => <BackButton />,
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }} 
      />
      
      <View style={styles.container}>
        {renderHeader()}
        
        {/* Main Prayer Wall Flashing Name Banner */}
        {mainFlashingName ? (
          <Animated.View 
            style={[
              styles.mainFlashingNameBanner,
              {
                opacity: mainNameFlashAnim,
                transform: [
                  {
                    translateY: mainNameFlashAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.mainFlashingNameText}>
              🙏 {mainFlashingName} just joined in prayer
            </Text>
          </Animated.View>
        ) : null}
        
        {filteredPrayers.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No matching prayer requests" : "No prayer requests yet"}
            description={
              searchQuery
                ? "Try a different search term"
                : "Be the first to share a prayer request with the community"
            }
            icon="prayer"
            action={
              searchQuery ? (
                <Button
                  title="Clear Search"
                  onPress={clearSearch}
                  variant="outline"
                />
              ) : (
                <Button
                  title="Add Prayer Request"
                  onPress={handleAddPrayer}
                  leftIcon={<Plus size={18} color={Colors.light.white} />}
                />
              )
            }
          />
        ) : (
          <FlatList
            data={filteredPrayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.prayerItemContainer}>
                <CommunityPrayerCard
                  prayer={item}
                  onPress={() => handlePrayerPress(item.id)}
                  onPray={() => handlePrayFor(item.id)}
                />
                <TouchableOpacity 
                  style={styles.joinPrayerButton}
                  onPress={() => handleOpenLiveComments(item.id)}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={18} color={Colors.light.primary} />
                  <Text style={styles.joinPrayerText}>Join Live Prayer</Text>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
            }
          />
        )}
        
        {(isLoggedIn || isAdminAuthenticated) && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddPrayer}
            activeOpacity={0.8}
          >
            <Plus size={28} color={Colors.light.white} />
          </TouchableOpacity>
        )}
        
        <BottomNavigation />
      </View>

      <PrayerCommentModal
        visible={showPrayerCommentModal}
        onClose={() => {
          setShowPrayerCommentModal(false);
          setSelectedPrayerId(null);
          setSelectedPrayerTitle('');
        }}
        onSubmit={handleSubmitPrayerComment}
        isSubmitting={isMarkingPrayed}
        prayerTitle={selectedPrayerTitle}
      />

      {/* Live Comments Modal */}
      <Modal
        visible={showLiveComments}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Live Prayer Support</Text>
            <TouchableOpacity 
              onPress={() => setShowLiveComments(false)}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.liveIndicatorBar}>
            <View style={styles.liveIndicatorContent}>
              <View style={styles.liveDot} />
              <Text style={styles.liveIndicatorText}>Live prayer session</Text>
              <Users size={16} color={Colors.light.textLight} />
              <Text style={styles.participantCount}>{Math.floor(Math.random() * 12) + 3} praying</Text>
            </View>
          </View>
          
          {flashingName ? (
            <Animated.View 
              style={[
                styles.flashingNameBanner,
                {
                  opacity: nameFlashAnim,
                  transform: [
                    {
                      scale: nameFlashAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.flashingNameText}>
                🙏 {flashingName} is praying
              </Text>
            </Animated.View>
          ) : null}
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.commentsContainer}
            showsVerticalScrollIndicator={false}
          >
            {liveComments.map((comment) => (
              <View key={comment.id} style={styles.commentBubble}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  <Text style={styles.commentTime}>{formatTime(comment.timestamp)}</Text>
                </View>
                <Text style={styles.commentMessage}>{comment.message}</Text>
              </View>
            ))}
            
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>Someone is typing...</Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Send encouragement..."
              value={newComment}
              onChangeText={(text) => {
                setNewComment(text);
                setIsTyping(text.length > 0);
              }}
              multiline
              maxLength={200}
              placeholderTextColor={Colors.light.textLight}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={handleSendComment}
              disabled={!newComment.trim()}
            >
              <Send size={20} color={newComment.trim() ? '#fff' : Colors.light.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: Colors.light.background,
  },
  searchContainer: {
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '600',
  },
  liveUpdateBanner: {
    backgroundColor: Colors.light.primary + '10',
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  liveUpdateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: theme.spacing.sm,
  },
  liveUpdateText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  liveCommentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary + '10',
    marginHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
  },
  liveCommentsText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: 6,
    marginRight: theme.spacing.sm,
  },
  liveBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 8,
  },
  liveIndicatorBar: {
    backgroundColor: Colors.light.primary + '10',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.card,
  },
  liveIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicatorText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
    marginRight: theme.spacing.md,
  },
  participantCount: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginLeft: 4,
  },
  commentsContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  commentBubble: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.light.textLight,
    },
  commentMessage: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  typingIndicator: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  typingText: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontStyle: 'italic',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.card,
    backgroundColor: Colors.light.card,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
    backgroundColor: Colors.light.background,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.card,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
  },
  categoriesContainer: {
    marginBottom: theme.spacing.sm,
  },
  categoriesList: {
    paddingVertical: theme.spacing.xs,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    marginRight: 8,
    backgroundColor: Colors.light.card,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  categoryButtonTextActive: {
    color: Colors.light.white,
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  selectedCategoryLabel: {
    ...theme.typography.body,
    marginRight: theme.spacing.xs,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  selectedCategoryText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  clearCategoryButton: {
    marginLeft: theme.spacing.sm,
  },
  clearCategoryText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
    elevation: 15,
  },
  prayerItemContainer: {
    marginBottom: theme.spacing.lg,
  },
  joinPrayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary + '15',
    marginTop: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.primary + '30',
    gap: 8,
    ...theme.shadows.small,
  },
  joinPrayerText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  flashingNameBanner: {
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.card,
  },
  flashingNameText: {
    fontSize: 16,
    color: Colors.light.white,
    fontWeight: '700',
  },
  mainFlashingNameBanner: {
    backgroundColor: Colors.light.primary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainFlashingNameText: {
    fontSize: 16,
    color: Colors.light.white,
    fontWeight: '700',
    textAlign: 'center',
  },
});
