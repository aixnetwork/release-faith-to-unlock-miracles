import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Book, Music, MessageSquare, Calendar, Heart, Users, BookOpen, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { ContentCategory } from '@/types';

interface ContentCategoryCardProps {
  category: ContentCategory;
  onPress: (categoryId: string) => void;
}

export const ContentCategoryCard = ({ category, onPress }: ContentCategoryCardProps) => {
  const renderIcon = () => {
    const iconProps = {
      size: 24,
      color: Colors.light.primary,
    };

    switch (category.icon) {
      case 'sermons':
        return <MessageSquare {...iconProps} />;
      case 'bible-studies':
        return <Book {...iconProps} />;
      case 'worship-songs':
        return <Music {...iconProps} />;
      case 'events':
        return <Calendar {...iconProps} />;
      case 'prayers':
        return <Heart {...iconProps} />;
      case 'testimonials':
        return <Users {...iconProps} />;
      case 'devotionals':
        return <BookOpen {...iconProps} />;
      case 'youth':
        return <Zap {...iconProps} />;
      default:
        return <Book {...iconProps} />;
    }
  };

  const handlePress = () => {
    console.log('ContentCategoryCard pressed:', category.id);
    onPress(category.id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: category.color }]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${category.name} category`}
      testID={`category-card-${category.id}`}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={styles.title} numberOfLines={1}>{category.name}</Text>
      <Text style={styles.description} numberOfLines={2}>{category.description}</Text>
      {category.itemCount !== undefined && (
        <Text style={styles.count}>{category.itemCount} items</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === 'web' ? '48%' : '48%',
    minHeight: 120,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.light.textMedium,
    lineHeight: 16,
    marginBottom: 4,
    flex: 1,
  },
  count: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.light.textSubtle,
    lineHeight: 14,
  },
});