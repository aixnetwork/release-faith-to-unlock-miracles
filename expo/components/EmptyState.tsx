import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Music, MessageCircle, Heart, BookOpen, Calendar, Video, Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  message?: string;
  icon: 'music' | 'prayer' | 'bible' | 'testimonial' | 'calendar' | 'video' | 'search';
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, message, icon, actionText, onAction, action }: EmptyStateProps) {
  const renderIcon = () => {
    const iconProps = {
      size: 40,
      color: Colors.light.icon,
    };

    switch (icon) {
      case 'music':
        return <Music {...iconProps} />;
      case 'prayer':
        return <Heart {...iconProps} />;
      case 'bible':
        return <BookOpen {...iconProps} />;
      case 'testimonial':
        return <MessageCircle {...iconProps} />;
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'video':
        return <Video {...iconProps} />;
      case 'search':
        return <Search {...iconProps} />;
      default:
        return <Heart {...iconProps} />;
    }
  };

  const displayMessage = message || description || '';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={styles.title}>{title}</Text>
      {displayMessage ? <Text style={styles.message}>{displayMessage}</Text> : null}
      {action && action}
      {!action && actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center' as const,
    marginBottom: 8,
    color: Colors.light.textPrimary,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    textAlign: 'center' as const,
    color: Colors.light.textMedium,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.light.white,
    fontWeight: '600',
  },
});