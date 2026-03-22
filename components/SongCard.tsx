import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Play, Heart, Music } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { Song } from '@/types';
import SafeImage from '@/components/SafeImage';

interface SongCardProps {
  song: Song;
  onPress: () => void;
  onLike: () => void;
  liked: boolean;
}

export function SongCard({ song, onPress, onLike, liked }: SongCardProps) {
  if (!song) return null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {song.imageUrl ? (
          <SafeImage 
            source={song.imageUrl}
            fallbackType="song"
            style={styles.image}
            testID={`song-image-${song.id}`}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Music size={24} color={Colors.light.textLight} />
          </View>
        )}
        <View style={styles.playOverlay}>
          <Play size={16} color={Colors.light.white} />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {song.title || 'Untitled Song'}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {song.artist || 'Unknown Artist'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.likeButton} onPress={onLike}>
            <Heart 
              size={18} 
              color={liked ? Colors.light.error : Colors.light.textLight}
              fill={liked ? Colors.light.error : 'none'}
            />
          </TouchableOpacity>
        </View>
        
        {song.description && (
          <Text style={styles.description} numberOfLines={2}>
            {song.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          {song.genre && (
            <Text style={styles.category}>{song.genre}</Text>
          )}
          {song.duration && (
            <Text style={styles.duration}>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  likeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  description: {
    fontSize: 13,
    color: Colors.light.textMedium,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    fontWeight: '500',
  },
  duration: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '500',
  },
});