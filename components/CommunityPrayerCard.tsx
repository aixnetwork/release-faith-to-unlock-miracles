import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { CommunityPrayer } from '@/types';

interface CommunityPrayerCardProps {
  prayer: CommunityPrayer;
  onPray: () => void;
  onPress?: () => void;
}

export const CommunityPrayerCard = ({ prayer, onPray, onPress }: CommunityPrayerCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };
  
  const formattedDate = formatDate(prayer.date);
  
  const handlePray = () => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPray();
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{prayer.title}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.username}>{prayer.author}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>{formattedDate}</Text>
            {prayer.category && (
              <React.Fragment>
                <Text style={styles.dot}>•</Text>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>
                    {prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1)}
                  </Text>
                </View>
              </React.Fragment>
            )}
          </View>
        </View>
      </View>
      
      <Text style={styles.content}>{prayer.description}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, prayer.hasPrayed && styles.prayedButton]} 
          onPress={handlePray}
          accessibilityLabel="Pray for this request"
          accessibilityRole="button"
        >
          <Heart 
            size={16} 
            color={prayer.hasPrayed ? Colors.light.white : Colors.light.primary} 
            fill={prayer.hasPrayed ? Colors.light.white : "transparent"}
          />
          <Text style={[styles.actionText, prayer.hasPrayed && styles.prayedText]}>
            {prayer.hasPrayed ? 'Praying' : 'Pray'} ({prayer.prayerCount})
          </Text>
        </TouchableOpacity>
        
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            accessibilityLabel="Comment on this prayer"
          >
            <MessageCircle size={18} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            accessibilityLabel="Share this prayer"
          >
            <Share2 size={18} color={Colors.light.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
  },
  title: {
    ...theme.typography.subtitle,
    marginBottom: 2
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  username: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '500'
  },
  dot: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginHorizontal: 4,
    includeFontPadding: false
  },
  date: {
    ...theme.typography.caption,
    color: Colors.light.textLight
  },
  categoryChip: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    ...theme.typography.caption,
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: '500'
  },
  content: {
    ...theme.typography.body,
    marginBottom: theme.spacing.md
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.light.primary
  },
  prayedButton: {
    backgroundColor: Colors.light.primary,
  },
  actionText: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    marginLeft: 4,
    fontWeight: '500'
  },
  prayedText: {
    color: Colors.light.white
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4
  }
});