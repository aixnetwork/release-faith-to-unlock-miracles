import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Heart, Share2, BookOpen, Music, Calendar, User, Play } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useTestimonialStore } from '@/store/testimonialStore';
import { YouTubePlayer, extractYouTubeVideoId } from '@/components/YouTubePlayer';
import { ShareModal } from '@/components/ShareModal';
import { songs } from '@/mocks/songs';
import * as Haptics from 'expo-haptics';

export default function TestimonialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTestimonialById, toggleLike } = useTestimonialStore();
  const testimonial = getTestimonialById(id || '');
  const [isLiked, setIsLiked] = useState(testimonial?.isLiked || false);
  const [showSongPlayer, setShowSongPlayer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Find the suggested song in our songs database
  const suggestedSong = testimonial?.suggestedSong 
    ? songs.find(song => 
        song.title.toLowerCase().includes(testimonial.suggestedSong!.toLowerCase()) ||
        song.artist.toLowerCase().includes(testimonial.suggestedSong!.toLowerCase())
      ) || songs[0] // Fallback to first song if not found
    : null;

  const handleLike = useCallback(() => {
    if (!testimonial) return;
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    toggleLike(testimonial.id);
    setIsLiked(prev => !prev);
  }, [testimonial, toggleLike]);

  if (!testimonial) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: "Testimony",
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text
          }} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Testimony not found</Text>
        </View>
      </View>
    );
  }

  const handleShare = () => {
    setShowShareModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSongPress = () => {
    if (suggestedSong) {
      router.push(`/song/${suggestedSong.id}`);
    }
  };

  const toggleSongPlayer = () => {
    setShowSongPlayer(!showSongPlayer);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const shareContent = {
    title: testimonial.title,
    text: `"${testimonial.content}" - ${testimonial.author}`,
    url: `https://releasefaith.app/testimonial/${testimonial.id}`,
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: testimonial.title,
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleShare}
                accessibilityLabel="Share testimony"
              >
                <Share2 size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleLike}
                accessibilityLabel={isLiked ? "Unlike testimony" : "Like testimony"}
              >
                <Heart 
                  size={20} 
                  color={Colors.light.primary} 
                  fill={isLiked ? Colors.light.primary : 'transparent'} 
                />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {testimonial.category && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{testimonial.category}</Text>
            </View>
          )}
          <Text style={styles.title}>{testimonial.title}</Text>
        </View>

        {/* Author and Date */}
        <View style={styles.authorSection}>
          <View style={styles.authorInfo}>
            <View style={styles.authorAvatar}>
              <User size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.authorName}>{testimonial.author}</Text>
              <View style={styles.dateContainer}>
                <Calendar size={14} color={Colors.light.textMedium} />
                <Text style={styles.date}>{formatDate(testimonial.date)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.likesContainer}>
            <Heart size={16} color={Colors.light.primary} />
            <Text style={styles.likesCount}>{testimonial.likes}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {testimonial.type === 'video' && testimonial.youtubeUrl ? (
            <View style={styles.videoTestimonyContainer}>
              <YouTubePlayer
                videoId={extractYouTubeVideoId(testimonial.youtubeUrl)}
                title={testimonial.title}
                height={200}
                autoplay={false}
                showControls={true}
              />
              {testimonial.content ? (
                <Text style={styles.videoDescription}>{testimonial.content}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.content}>{testimonial.content}</Text>
          )}
        </View>

        {/* Suggested Scripture */}
        {testimonial.suggestedScripture && (
          <View style={styles.suggestionSection}>
            <View style={styles.suggestionHeader}>
              <BookOpen size={24} color={Colors.light.primary} />
              <Text style={styles.suggestionTitle}>Related Scripture</Text>
            </View>
            <View style={styles.scriptureCard}>
              <Text style={styles.scriptureText}>{testimonial.suggestedScripture}</Text>
            </View>
          </View>
        )}

        {/* Suggested Song */}
        {testimonial.suggestedSong && (
          <View style={styles.suggestionSection}>
            <View style={styles.suggestionHeader}>
              <Music size={24} color={Colors.light.secondary} />
              <Text style={styles.suggestionTitle}>Suggested Song</Text>
            </View>
            
            <View style={styles.songCard}>
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{testimonial.suggestedSong}</Text>
                {suggestedSong && (
                  <Text style={styles.songArtist}>{suggestedSong.artist}</Text>
                )}
              </View>
              
              <View style={styles.songActions}>
                {suggestedSong && suggestedSong.youtubeId && (
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={toggleSongPlayer}
                    accessibilityLabel={showSongPlayer ? "Hide player" : "Show player"}
                  >
                    <Play size={18} color={Colors.light.white} />
                    <Text style={styles.playButtonText}>
                      {showSongPlayer ? 'Hide' : 'Play'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.viewSongButton}
                  onPress={handleSongPress}
                  accessibilityLabel="View full song details"
                >
                  <Text style={styles.viewSongText}>View Song</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* YouTube Player for suggested song */}
            {showSongPlayer && suggestedSong && suggestedSong.youtubeId && (
              <View style={styles.playerContainer}>
                <YouTubePlayer
                  videoId={suggestedSong.youtubeId}
                  title={`${suggestedSong.title} - ${suggestedSong.artist}`}
                  height={200}
                  autoplay={false}
                />
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton, isLiked && styles.likedButton]} 
            onPress={handleLike}
            accessibilityLabel={isLiked ? "Unlike testimony" : "Like testimony"}
          >
            <Heart 
              size={20} 
              color={isLiked ? Colors.light.white : Colors.light.primary} 
              fill={isLiked ? Colors.light.white : 'transparent'} 
            />
            <Text style={[styles.actionButtonText, isLiked && styles.likedButtonText]}>
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]} 
            onPress={handleShare}
            accessibilityLabel="Share testimony"
          >
            <Share2 size={20} color={Colors.light.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={shareContent.title}
        text={shareContent.text}
        url={shareContent.url}
        hashtags={['testimony', 'faith', 'God']}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  categoryText: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    ...theme.typography.title,
    fontSize: 24,
    color: Colors.light.textPrimary,
    lineHeight: 32,
  },
  authorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  authorName: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  date: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginLeft: theme.spacing.xs,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
  contentSection: {
    padding: theme.spacing.lg,
  },
  content: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    lineHeight: 24,
    fontSize: 16,
  },
  suggestionSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  suggestionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
    fontSize: 18,
  },
  scriptureCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    ...theme.shadows.small,
  },
  scriptureText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    lineHeight: 24,
    fontStyle: 'italic',
    fontSize: 16,
  },
  songCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.secondary,
    ...theme.shadows.small,
  },
  songInfo: {
    marginBottom: theme.spacing.md,
  },
  songTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  songArtist: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    fontSize: 14,
  },
  songActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  playButton: {
    backgroundColor: Colors.light.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  playButtonText: {
    color: Colors.light.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  viewSongButton: {
    borderWidth: 1,
    borderColor: Colors.light.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  viewSongText: {
    color: Colors.light.secondary,
    fontWeight: '600',
  },
  playerContainer: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  likeButton: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  likedButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  shareButton: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  actionButtonText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  likedButtonText: {
    color: Colors.light.white,
  },
  videoTestimonyContainer: {
    gap: theme.spacing.md,
  },
  videoDescription: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});