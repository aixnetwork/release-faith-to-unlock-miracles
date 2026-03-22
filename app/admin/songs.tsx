import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useSongStore } from '@/store/songStore';
import { Image } from 'expo-image';
import { getSafeImageSource, FALLBACK_IMAGES } from '@/utils/imageUtils';
import { Song } from '@/types';

export default function ManageSongsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { songs, deleteSong } = useSongStore();

  // Filter songs based on search query
  const filteredSongs = songs.filter(song => {
    return (
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddSong = () => {
    router.push('/song/new');
  };

  const handleEditSong = (id: string) => {
    router.push(`/admin/edit-song?id=${id}`);
  };

  const handleDeleteSong = (id: string) => {
    Alert.alert(
      "Delete Song",
      "Are you sure you want to delete this song?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteSong(id);
          }
        }
      ]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <View style={styles.songItem}>
      <View style={styles.songImageContainer}>
        <Image
          source={getSafeImageSource(item.imageUrl, FALLBACK_IMAGES.song)}
          style={styles.songImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.songContent}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        <Text style={styles.songDescription} numberOfLines={1}>{item.description || ''}</Text>
      </View>
      <View style={styles.songActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditSong(item.id)}
        >
          <Edit2 size={18} color={Colors.light.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteSong(item.id)}
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
          <Search size={20} color={Colors.light.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.light.textLight} />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          title="Add New"
          onPress={handleAddSong}
          size="small"
          icon={<Plus size={16} color={Colors.light.white} />}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Worship Songs</Text>
            <Text style={styles.listCount}>{filteredSongs.length} items</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No songs found</Text>
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
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
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
    color: Colors.light.textLight,
  },
  songItem: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  songImageContainer: {
    width: 80,
    height: 80,
  },
  songImage: {
    width: '100%',
    height: '100%',
  },
  songContent: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  songTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: 2,
  },
  songArtist: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: 4,
  },
  songDescription: {
    ...theme.typography.caption,
    color: Colors.light.text,
  },
  songActions: {
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
    color: Colors.light.textLight,
  },
});