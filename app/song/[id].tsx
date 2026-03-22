import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { Play, Share2, Heart, ChevronRight, Music, Home, ChevronLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useSongStore } from '@/store/songStore';
import { YouTubePlayer, extractYouTubeVideoId } from '@/components/YouTubePlayer';
import { ShareModal } from '@/components/ShareModal';
import * as Haptics from 'expo-haptics';
import { getSafeImageSource, FALLBACK_IMAGES } from '@/utils/imageUtils';

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSongById, songs } = useSongStore();
  const song = getSongById(id as string);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLiked(prev => !prev);
  }, []);

  const videoId = useMemo(() => {
    if (!song) return null;
    if (song.youtubeId) {
      const extracted = extractYouTubeVideoId(song.youtubeId);
      if (extracted) return extracted;
    }
    if (song.youtubeUrl) {
      const extracted = extractYouTubeVideoId(song.youtubeUrl);
      if (extracted) return extracted;
    }
    return null;
  }, [song]);

  const togglePlayer = useCallback(() => {
    console.log('Toggle player clicked. Current showPlayer:', showPlayer);
    console.log('Song youtubeId:', song?.youtubeId);
    console.log('Song youtubeUrl:', song?.youtubeUrl);
    console.log('Extracted videoId:', videoId);
    
    if (!videoId) {
      Alert.alert(
        'Video Not Available',
        'This song does not have a valid YouTube video linked yet.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowPlayer(prev => !prev);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [videoId, showPlayer, song]);

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const shareContent = useMemo(() => ({
    title: song ? `${song.title} by ${song.artist}` : 'Song',
    text: song ? `Listen to "${song.title}" by ${song.artist}` : '',
    url: song ? `https://releasefaith.app/song/${song.id}` : '',
    hashtags: ['music', 'faith', 'worship'],
  }), [song]);

  if (!song) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: "Song",
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text
          }} 
        />
        <Text style={styles.errorText}>Song not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: song.title,
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={28} color={Colors.light.primary} strokeWidth={2.5} />
              <Text style={styles.headerBackText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleShare}
                accessibilityLabel="Share song"
              >
                <Share2 size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleLike}
                accessibilityLabel={isLiked ? "Unlike song" : "Like song"}
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
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonInner}
            activeOpacity={0.9}
          >
            <ChevronLeft size={24} color={Colors.light.white} strokeWidth={2.5} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        {showPlayer && videoId ? (
          <View style={styles.playerBannerContainer}>
            <YouTubePlayer
              videoId={videoId}
              title={`${song.title} - ${song.artist}`}
              height={250}
              showControls={true}
              autoplay={true}
            />
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image
              source={getSafeImageSource(song.imageUrl, FALLBACK_IMAGES.song)}
              style={styles.image}
              contentFit="cover"
              transition={300}
              accessibilityLabel={`Image for ${song.title}`}
            />
            <TouchableOpacity 
              style={styles.likeButtonOverlay}
              onPress={handleLike}
              accessibilityLabel={isLiked ? "Unlike song" : "Like song"}
            >
              <Heart 
                size={24} 
                color={Colors.light.white} 
                fill={isLiked ? Colors.light.white : 'transparent'} 
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.artist}>{song.artist}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.playButton]} 
              onPress={togglePlayer}
              accessibilityLabel={showPlayer ? "Hide player" : "Show player"}
            >
              {showPlayer ? (
                <>
                  <Music size={20} color={Colors.light.white} />
                  <Text style={styles.playButtonText}>Hide Player</Text>
                </>
              ) : (
                <>
                  <Play size={20} color={Colors.light.white} />
                  <Text style={styles.playButtonText}>Play Song</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.shareButton]} 
              onPress={handleShare}
              accessibilityLabel="Share song"
            >
              <Share2 size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About this Song</Text>
            <Text style={styles.description}>{song.description}</Text>
          </View>

          <View style={styles.lyricsPreviewContainer}>
            <Text style={styles.lyricsTitle}>Lyrics Preview</Text>
            <TouchableOpacity style={styles.lyricsContent}>
              <Text style={styles.lyricsText}>
                Tap to view full lyrics...
              </Text>
              <ChevronRight size={20} color={Colors.light.textLight} />
            </TouchableOpacity>
          </View>

          {songs && songs.length > 1 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>You might also like</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContent}
              >
                {songs
                  .filter(s => s.id !== song.id)
                  .slice(0, 5)
                  .map(suggestion => (
                    <TouchableOpacity key={suggestion.id} style={styles.suggestionCard}>
                      <Image
                        source={getSafeImageSource(suggestion.imageUrl, FALLBACK_IMAGES.song)}
                        style={styles.suggestionImage}
                        contentFit="cover"
                        transition={300}
                      />
                      <View style={styles.suggestionInfo}>
                        <Text style={styles.suggestionTitle} numberOfLines={1}>
                          {suggestion.title}
                        </Text>
                        <Text style={styles.suggestionArtist} numberOfLines={1}>
                          {suggestion.artist}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.footerNavigation}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => router.push('/')}
            activeOpacity={0.7}
          >
            <Home size={20} color={Colors.light.white} />
            <Text style={styles.footerButtonText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => router.push('/songs')}
            activeOpacity={0.7}
          >
            <Music size={20} color={Colors.light.white} />
            <Text style={styles.footerButtonText}>Songs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={shareContent.title}
        text={shareContent.text}
        url={shareContent.url}
        hashtags={shareContent.hashtags}
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
    paddingBottom: 0,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
    marginLeft: -4,
  },
  headerBackText: {
    fontSize: 17,
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: -4,
  },
  backButtonContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  backButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
    gap: 4,
    ...theme.shadows.medium,
  },
  backButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  playerBannerContainer: {
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  likeButtonOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  artist: {
    ...theme.typography.subtitle,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  button: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  playButton: {
    backgroundColor: Colors.light.primary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  playButtonText: {
    color: Colors.light.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.lg,
  },
  playerContainer: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  descriptionContainer: {
    marginBottom: theme.spacing.xl,
  },
  descriptionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    lineHeight: 24,
  },
  lyricsPreviewContainer: {
    marginBottom: theme.spacing.xl,
  },
  lyricsTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  lyricsContent: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lyricsText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  suggestionsTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  suggestionsContent: {
    paddingRight: theme.spacing.lg,
  },
  suggestionCard: {
    width: 150,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.light.card,
    ...theme.shadows.small,
  },
  suggestionImage: {
    width: '100%',
    height: 100,
  },
  suggestionInfo: {
    padding: theme.spacing.sm,
  },
  suggestionTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  suggestionArtist: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  errorText: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  footerNavigation: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  footerButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
  noVideoContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    minHeight: 150,
  },
  noVideoText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
});
