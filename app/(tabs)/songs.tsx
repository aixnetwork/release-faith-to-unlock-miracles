import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Search, Plus, Filter, Music, Heart } from 'lucide-react-native';
import { SongCard } from '@/components/SongCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useSongStore } from '@/store/songStore';
import { useUserStore } from '@/store/userStore';
import { ENV } from '@/config/env';

const SONG_CATEGORIES = [
  { id: 'all', name: 'All Songs' },
  { id: 'worship', name: 'Worship' },
  { id: 'hymn', name: 'Hymns' },
  { id: 'contemporary', name: 'Contemporary' },
  { id: 'gospel', name: 'Gospel' },
  { id: 'praise', name: 'Praise' },
  { id: 'traditional', name: 'Traditional' }
];

export default function SongsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    songs = [], 
    likedSongs = [], 
    likeSong, 
    unlikeSong, 
    addToRecentlyPlayed,
    getSongsByCategory,
    searchSongs,
    fetchSongs,
    isLoading
  } = useSongStore();
  
  const { user } = useUserStore();
  const isOrganizerOrAdmin = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID || 
                             user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID;
  
  useEffect(() => {
    loadSongs();
  }, []);
  
  const loadSongs = async () => {
    try {
      const organizationId = user?.organizationId;
      await fetchSongs(organizationId ? (typeof organizationId === 'string' ? parseInt(organizationId) : organizationId) : undefined);
    } catch (error) {
      console.error('Error loading songs:', error);
      Alert.alert('Error', 'Failed to load songs. Please try again.');
    }
  };

  // Filter songs based on search and category with null checks
  const filteredSongs = React.useMemo(() => {
    try {
      let result = songs || [];
      
      if (selectedCategory !== 'all' && getSongsByCategory) {
        result = getSongsByCategory(selectedCategory) || [];
      }
      
      if (searchQuery.trim()) {
        result = result.filter(song => 
          song && (
            song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (song.tags && Array.isArray(song.tags) && song.tags.some(tag => 
              tag && tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
          )
        );
      }
      
      return result.filter(song => song && song.id); // Filter out null/undefined songs
    } catch (error) {
      console.error('Error filtering songs:', error);
      return [];
    }
  }, [songs, selectedCategory, searchQuery, getSongsByCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSongs();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const handleSongPress = useCallback((id: string) => {
    try {
      if (addToRecentlyPlayed) {
        addToRecentlyPlayed(id);
      }
      router.push(`/song/${id}`);
    } catch (error) {
      console.error('Error navigating to song:', error);
      Alert.alert('Error', 'Unable to open song. Please try again.');
    }
  }, [addToRecentlyPlayed]);

  const handleLikeSong = useCallback((id: string) => {
    try {
      if (likedSongs.includes(id)) {
        if (unlikeSong) unlikeSong(id);
      } else {
        if (likeSong) likeSong(id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Unable to update like status. Please try again.');
    }
  }, [likedSongs, likeSong, unlikeSong]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleAddSong = useCallback(() => {
    try {
      router.push('/song/new');
    } catch (error) {
      console.error('Error navigating to new song:', error);
      Alert.alert('Error', 'Unable to open add song screen. Please try again.');
    }
  }, []);

  const renderSongCard = useCallback((song: any) => {
    if (!song || !song.id) return null;
    
    const isLiked = likedSongs.includes(song.id);
    
    return (
      <SongCard
        key={song.id}
        song={song}
        onPress={() => handleSongPress(song.id)}
        onLike={() => handleLikeSong(song.id)}
        liked={isLiked}
      />
    );
  }, [likedSongs, handleSongPress, handleLikeSong]);

  const renderCategoryButton = useCallback(({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && styles.categoryButtonTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategoryPress]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Worship Songs',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { color: Colors.light.text },
          headerRight: () => isOrganizerOrAdmin ? (
            <TouchableOpacity onPress={handleAddSong} style={styles.headerButton}>
              <Plus size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ) : null,
        }}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.icon}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {/* Filter functionality */}}
          >
            <Filter size={20} color={Colors.light.tint} />
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {SONG_CATEGORIES.map((category) => renderCategoryButton({ item: category }))}
        </ScrollView>

        {/* Songs List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading songs...</Text>
          </View>
        ) : filteredSongs.length > 0 ? (
          <View style={styles.songsContainer}>
            {filteredSongs.map((song) => renderSongCard(song))}
          </View>
        ) : (
          <EmptyState
            title="No songs found"
            description={searchQuery ? "Try adjusting your search terms" : "No songs available in this category"}
            icon="music"
            action={isOrganizerOrAdmin ? (
              <Button
                title="Add Song"
                onPress={handleAddSong}
                icon={<Plus size={16} color={Colors.light.background} />}
              />
            ) : undefined}
          />
        )}

        {/* Bottom spacing */}
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
    borderColor: '#E5E5E5',
    ...theme.shadows.small,
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
  categoriesContainer: {
    marginBottom: theme.spacing.lg,
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
    borderColor: '#E5E5E5',
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryButtonText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.text,
  },
  categoryButtonTextActive: {
    color: Colors.light.background,
  },
  songsContainer: {
    gap: theme.spacing.md,
  },
  bottomSpacing: {
    height: 100,
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
});