import React from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Bookmark } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { Promise } from '@/types';
import * as Haptics from 'expo-haptics';
import SafeImage from '@/components/SafeImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export interface PromiseCardProps {
  promise: Promise;
  onFavorite?: () => void;
  isFavorite?: boolean;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  onPress?: () => void;
}

export const PromiseCard = ({ 
  promise, 
  onFavorite, 
  isFavorite = false,
  onBookmark,
  isBookmarked = false,
  onPress
}: PromiseCardProps) => {
  const handleFavorite = () => {
    if (onFavorite) {
      // Provide haptic feedback on iOS/Android
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onFavorite();
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      // Provide haptic feedback on iOS/Android
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onBookmark();
    }
  };

  const CardContent = () => {
    const imageSource = promise.imageUrl && typeof promise.imageUrl === 'string' && promise.imageUrl.trim() !== '' 
      ? promise.imageUrl 
      : undefined;
    
    return (
      <View style={styles.container}>
        <SafeImage
          source={imageSource}
          fallbackType="promise"
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel="Background image for Bible verse"
          testID={`promise-image-${promise.id}`}
        />
      <LinearGradient
        colors={['transparent', 'rgba(65, 105, 225, 0.9)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.verse}>{promise.verse}</Text>
          <Text style={styles.reference}>{promise.reference}</Text>
          
          {(onFavorite || onBookmark) && (
            <View style={styles.actions}>
              {onFavorite && (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleFavorite}
                  accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart 
                    size={20} 
                    color={Colors.light.gold} 
                    fill={isFavorite ? Colors.light.gold : "transparent"} 
                  />
                </TouchableOpacity>
              )}
              
              {onBookmark && (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleBookmark}
                  accessibilityLabel={isBookmarked ? "Remove bookmark" : "Bookmark this verse"}
                >
                  <Bookmark 
                    size={20} 
                    color={Colors.light.gold} 
                    fill={isBookmarked ? Colors.light.gold : "transparent"} 
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.75,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.large
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end'
  },
  content: {
    padding: theme.spacing.lg
  },
  verse: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    color: Colors.light.white,
    marginBottom: theme.spacing.md,
    textAlign: 'center' as const
  },
  reference: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.gold,
    opacity: 1,
    textAlign: 'center' as const
  },
  actions: {
    flexDirection: 'row',
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)'
  }
});