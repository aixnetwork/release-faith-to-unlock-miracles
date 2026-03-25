import React, { useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { Play, ExternalLink, AlertCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { getSafeUri } from '@/utils/imageUtils';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  showControls?: boolean;
  height?: number;
}

// Utility function to validate YouTube video ID
const isValidVideoId = (videoId: string): boolean => {
  if (!videoId || typeof videoId !== 'string') return false;
  // YouTube video IDs are 11 characters long and contain alphanumeric characters, hyphens, and underscores
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  return videoIdRegex.test(videoId);
};

// Extract YouTube video ID from various URL formats
export const extractYouTubeVideoId = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  // Remove whitespace
  url = url.trim();
  
  // If it's already just a video ID, return it
  if (isValidVideoId(url)) {
    return url;
  }
  
  // Various YouTube URL patterns
  const patterns = [
    // Standard watch URLs
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Shortened URLs
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed URLs
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Mobile URLs
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // YouTube shorts
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && isValidVideoId(match[1])) {
      return match[1];
    }
  }
  
  return '';
};

// Web-specific iframe component
const WebYouTubePlayer = ({ videoId, title, autoplay, showControls, height }: YouTubePlayerProps) => {
  
  if (!isValidVideoId(videoId)) {
    return <ErrorPlayer title={title} error="Invalid video ID" />;
  }
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: showControls ? '1' : '0',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    fs: '1',
    cc_load_policy: '0',
    iv_load_policy: '3',
    autohide: '0',
    enablejsapi: '1',
    origin: Platform.OS === 'web' ? (typeof window !== 'undefined' ? window.location.origin : 'https://releasefaith.app') : 'https://releasefaith.app'
  }).toString()}`;

  if (Platform.OS === 'web') {
    try {
      // Use native iframe for web
      const IframeComponent = 'iframe' as any;
      return (
        <View style={[styles.container, { height }]}>
          <IframeComponent
            src={embedUrl}
            style={{
              width: '100%',
              height: height || 200,
              border: 'none',
              borderRadius: theme.borderRadius.md,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            title={title || 'YouTube Video'}
          />
          {title && title.trim() ? (
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>{title.trim()}</Text>
            </View>
          ) : null}
        </View>
      );
    } catch (error) {
      console.error('Error rendering iframe:', error);
      return <FallbackPlayer videoId={videoId} title={title} />;
    }
  }

  return <FallbackPlayer videoId={videoId} title={title} />;
};

// Error component for invalid videos
const ErrorPlayer = ({ title, error }: { title?: string; error: string }) => {
  return (
    <View style={[styles.container, styles.errorContainer]}>
      <View style={styles.errorContent}>
        <AlertCircle size={48} color={Colors.light.error} />
        <Text style={styles.errorTitle}>Video Unavailable</Text>
        <Text style={styles.errorText}>{error}</Text>
        {title && <Text style={styles.errorSubtext}>Title: {title}</Text>}
      </View>
    </View>
  );
};

// Fallback component that opens YouTube in browser
const FallbackPlayer = ({ videoId, title }: { videoId: string; title?: string }) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const handleOpenYouTube = useCallback(() => {
    try {
      if (Platform.OS === 'web') {
        window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
      } else {
        // For mobile, you might want to use expo-web-browser or Linking
        Alert.alert(
          'Open YouTube',
          'This will open the video in your browser or YouTube app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open', onPress: () => {
              // You can implement Linking.openURL here if needed
              console.log('Opening YouTube URL:', youtubeUrl);
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Error opening YouTube:', error);
      Alert.alert('Error', 'Could not open YouTube video.');
    }
  }, [youtubeUrl]);

  return (
    <View style={[styles.container, styles.fallbackContainer]}>
      <View style={styles.fallbackContent}>
        <Play size={48} color={Colors.light.primary} />
        <Text style={styles.fallbackTitle}>{title || 'YouTube Video'}</Text>
        <Text style={styles.fallbackSubtext}>Tap to watch on YouTube</Text>
        <TouchableOpacity 
          style={styles.fallbackButton} 
          onPress={handleOpenYouTube}
          activeOpacity={0.7}
        >
          <ExternalLink size={16} color={Colors.light.white} />
          <Text style={styles.fallbackButtonText}>Watch on YouTube</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const YouTubePlayer = ({ 
  videoId, 
  title, 
  autoplay = false, 
  showControls = true,
  height = 200 
}: YouTubePlayerProps) => {
  // Validate video ID
  if (!videoId || !isValidVideoId(videoId)) {
    return <ErrorPlayer title={title} error="Please provide a valid YouTube video ID" />;
  }

  // Web platform - use iframe
  if (Platform.OS === 'web') {
    return (
      <WebYouTubePlayer 
        videoId={videoId} 
        title={title} 
        autoplay={autoplay} 
        showControls={showControls} 
        height={height} 
      />
    );
  }

  // Mobile platforms - use WebView if available, otherwise fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { WebView } = require('react-native-webview');
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: showControls ? '1' : '0',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      fs: '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      autohide: '0',
      enablejsapi: '1',
      origin: 'https://releasefaith.app'
    }).toString()}`;

    // Validate embedUrl before using it
    if (!embedUrl || typeof embedUrl !== 'string' || !embedUrl.startsWith('https://')) {
      console.error('Invalid embedUrl:', embedUrl);
      return <FallbackPlayer videoId={videoId} title={title} />;
    }

    const safeEmbedUrl = getSafeUri(embedUrl);
    
    return (
      <View style={[styles.container, { height }]}>
        <WebView
          source={{ uri: safeEmbedUrl }}
          style={[styles.webview, { height }]}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          onLoadStart={() => console.log('YouTube player loading...')}
          onLoad={() => console.log('YouTube player loaded')}
          onError={(error: any) => {
            console.error('YouTube player error:', error);
          }}
        />
        
        {title && title.trim() ? (
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>{title.trim()}</Text>
          </View>
        ) : null}
      </View>
    );
  } catch (error) {
    console.error('WebView not available:', error);
    return <FallbackPlayer videoId={videoId} title={title} />;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.medium,
  },
  webview: {
    backgroundColor: 'transparent',
  },
  customControls: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
  },
  controlButton: {
    padding: theme.spacing.xs,
    marginHorizontal: 2,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: theme.spacing.sm,
  },
  title: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fallbackContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    borderStyle: 'dashed' as const,
  },
  fallbackContent: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    textAlign: 'center' as const,
    maxWidth: 200,
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  fallbackButtonText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center' as const,
    maxWidth: 250,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.error + '30',
    borderStyle: 'dashed' as const,
  },
  errorContent: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.error,
    textAlign: 'center' as const,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center' as const,
    maxWidth: 250,
  },
  errorSubtext: {
    fontSize: 12,
    color: Colors.light.textLight,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    marginTop: theme.spacing.xs,
  },
});