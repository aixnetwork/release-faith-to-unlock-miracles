import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Animated } from 'react-native';
import { Heart, Calendar, Tag, Check, Edit2, Trash2, Share, HandHeart } from 'lucide-react-native';
import { Prayer } from '@/types';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ShareModal } from './ShareModal';

interface PrayerCardProps {
  prayer: Prayer;
  onPress?: () => void;
  onToggleAnswered?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkPrayed?: (id: string) => void;
  showActions?: boolean;
  currentUserId?: string;
  isOrganizer?: boolean;
  isCommunityTab?: boolean;
}

export function PrayerCard({ 
  prayer, 
  onPress, 
  onToggleAnswered,
  onDelete,
  onMarkPrayed,
  showActions = true,
  currentUserId,
  isOrganizer = false,
  isCommunityTab = false
}: PrayerCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleToggleAnswered = () => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (onToggleAnswered) {
      onToggleAnswered(prayer.id);
    }
  };

  const handleEdit = () => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push(`/prayer/edit/${prayer.id}`);
  };

  const handleDelete = () => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(prayer.id);
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setShowShareModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: Colors.light.primary,
      family: Colors.light.secondary,
      health: Colors.light.success,
      work: Colors.light.warning,
      spiritual: Colors.light.primary,
      other: Colors.light.textLight,
    };
    return colors[category] || Colors.light.textLight;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      personal: 'Personal',
      family: 'Family',
      health: 'Health',
      work: 'Work',
      spiritual: 'Spiritual',
      other: 'Other',
    };
    return labels[category] || 'Other';
  };

  const isAnswered = prayer.isAnswered;
  const isOwner = prayer.userId === currentUserId;
  const canEdit = isOwner || isOrganizer;

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.container,
            isAnswered && styles.answeredContainer,
          ]}
          onPress={onPress || (() => router.push(`/prayer/${prayer.id}`))}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
        >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isAnswered && styles.answeredTitle]}>
              {prayer.title}
            </Text>
            {isAnswered && (
              <Check size={16} color={Colors.light.success} style={styles.checkIcon} />
            )}
          </View>
          
          <View style={styles.dateContainer}>
            <Calendar size={12} color={Colors.light.textLight} />
            <Text style={styles.date}>{formatDate(prayer.createdAt)}</Text>
          </View>
        </View>

        <Text style={[styles.content, isAnswered && styles.answeredContent]} numberOfLines={2}>
          {prayer.content}
        </Text>

        <View style={styles.footer}>
          <View style={styles.categoryContainer}>
            <Tag size={12} color={getCategoryColor(prayer.category)} />
            <Text style={[styles.category, { color: getCategoryColor(prayer.category) }]}>
              {getCategoryLabel(prayer.category)}
            </Text>
          </View>

          {showActions && (
            <View style={styles.actions}>
              {isCommunityTab && (
                <TouchableOpacity
                  style={styles.prayedButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    if (onMarkPrayed) {
                      onMarkPrayed(prayer.id);
                    }
                  }}
                >
                  <HandHeart size={16} color={Colors.light.primary} />
                  <Text style={styles.prayedCount}>{prayer.prayerCount || 0}</Text>
                </TouchableOpacity>
              )}

              {!isCommunityTab && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleToggleAnswered}
                >
                  <Heart
                    size={16}
                    color={isAnswered ? Colors.light.success : Colors.light.textLight}
                    fill={isAnswered ? Colors.light.success : 'transparent'}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Share size={16} color={Colors.light.textLight} />
              </TouchableOpacity>

              {canEdit && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleEdit}
                >
                  <Edit2 size={16} color={Colors.light.textLight} />
                </TouchableOpacity>
              )}

              {isOwner && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDelete}
                >
                  <Trash2 size={16} color={Colors.light.error} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {prayer.tags && prayer.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {prayer.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {prayer.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{prayer.tags.length - 3} more</Text>
            )}
          </View>
        )}

        {prayer.tags && prayer.tags.includes('mental-health') && (
          <View style={styles.mentalHealthBadge}>
            <Text style={styles.mentalHealthText}>Mental Health Focus</Text>
          </View>
        )}
        </TouchableOpacity>
      </Animated.View>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={prayer.title}
        text={prayer.content}
        url={`https://releasefaith.app/prayer/${prayer.id}`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  answeredContainer: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.success,
    borderColor: Colors.light.success + '30',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    flex: 1,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  answeredTitle: {
    textDecorationLine: 'line-through',
    color: Colors.light.textLight,
  },
  checkIcon: {
    marginLeft: theme.spacing.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.textLight,
  },
  content: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.md,
    lineHeight: 21,
  },
  answeredContent: {
    color: Colors.light.textLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 8,
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.light.primary + '12',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  moreTagsText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.textLight,
    alignSelf: 'center',
  },
  mentalHealthBadge: {
    backgroundColor: Colors.light.secondary + '12',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  mentalHealthText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.secondary,
  },
  prayedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary + '12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  prayedCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});