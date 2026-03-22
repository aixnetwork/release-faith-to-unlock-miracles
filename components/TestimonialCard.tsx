import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Heart, Calendar, User, Video, FileText } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { Testimonial } from '@/store/testimonialStore';
import { YouTubePlayer, extractYouTubeVideoId } from '@/components/YouTubePlayer';

interface TestimonialCardProps {
  testimonial: Testimonial;
  onPress: () => void;
  onLike: () => void;
}

export function TestimonialCard({ testimonial, onPress, onLike }: TestimonialCardProps) {
  if (!testimonial) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  const youtubeVideoId = testimonial.youtubeUrl ? extractYouTubeVideoId(testimonial.youtubeUrl) : '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            {testimonial.type === 'video' ? (
              <Video size={16} color={Colors.light.error} />
            ) : (
              <FileText size={16} color={Colors.light.primary} />
            )}
            <Text style={styles.title} numberOfLines={2}>
              {testimonial.title || 'Untitled Testimony'}
            </Text>
          </View>
          {testimonial.type === 'video' && (
            <Text style={styles.videoLabel}>Video Testimony</Text>
          )}
        </View>
        <TouchableOpacity style={styles.likeButton} onPress={onLike}>
          <Heart 
            size={18} 
            color={testimonial.isLiked ? Colors.light.error : Colors.light.textLight}
            fill={testimonial.isLiked ? Colors.light.error : 'none'}
          />
          <Text style={styles.likeCount}>{testimonial.likes || 0}</Text>
        </TouchableOpacity>
      </View>
      
      {testimonial.type === 'video' && youtubeVideoId ? (
        <View style={styles.videoContainer}>
          <YouTubePlayer
            videoId={youtubeVideoId}
            title={testimonial.title}
            height={160}
            autoplay={false}
          />
        </View>
      ) : (
        <Text style={styles.content} numberOfLines={3}>
          {testimonial.content || 'No content available'}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.authorInfo}>
          <User size={12} color={Colors.light.textLight} />
          <Text style={styles.author}>{testimonial.author || 'Anonymous'}</Text>
        </View>
        
        <View style={styles.dateInfo}>
          <Calendar size={12} color={Colors.light.textLight} />
          <Text style={styles.date}>{formatDate(testimonial.date)}</Text>
        </View>
      </View>
      
      {testimonial.category && (
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{testimonial.category}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    lineHeight: 22,
  },
  videoLabel: {
    fontSize: 12,
    color: Colors.light.error,
    fontWeight: '500',
    backgroundColor: Colors.light.error + '10',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  likeCount: {
    fontSize: 12,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  content: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  author: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '500',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
  },
  category: {
    fontSize: 12,
    color: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  videoContainer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
});