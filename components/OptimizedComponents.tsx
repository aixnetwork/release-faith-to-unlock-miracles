import React, { memo, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';

// Optimized Card Component
export const OptimizedCard = memo<{
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  disabled?: boolean;
}>(({ children, style, onPress, disabled = false }) => {
  const cardStyle = useMemo(() => [
    styles.card,
    style,
    disabled && styles.cardDisabled
  ], [style, disabled]);

  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
});

// Optimized Loading State
export const OptimizedLoadingState = memo<{
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}>(({ size = 'large', color = Colors.light.primary, text }) => {
  const indicatorSize = size === 'small' ? 20 : 40;
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={indicatorSize} color={color} />
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );
});

// Optimized Empty State
export const OptimizedEmptyState = memo<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    title: string;
    onPress: () => void;
  };
}>(({ title, description, icon, action }) => {
  return (
    <View style={styles.emptyState}>
      {icon && <View style={styles.emptyStateIcon}>{icon}</View>}
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {description && <Text style={styles.emptyStateDescription}>{description}</Text>}
      {action && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={action.onPress}>
          <Text style={styles.emptyStateButtonText}>{action.title}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// Optimized Section Header
export const OptimizedSectionHeader = memo<{
  title: string;
  subtitle?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
}>(({ title, subtitle, action }) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderContent}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={styles.sectionAction}>{action.title}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// Optimized List Item
export const OptimizedListItem = memo<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}>(({ title, subtitle, icon, rightElement, onPress, disabled = false }) => {
  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  const itemStyle = useMemo(() => [
    styles.listItem,
    disabled && styles.listItemDisabled
  ], [disabled]);

  return (
    <TouchableOpacity 
      style={itemStyle} 
      onPress={handlePress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.listItemIcon}>{icon}</View>}
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.listItemRight}>{rightElement}</View>}
    </TouchableOpacity>
  );
});

// Optimized Stats Card
export const OptimizedStatsCard = memo<{
  stats: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
  }>;
}>(({ stats }) => {
  return (
    <View style={styles.statsCard}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={styles.statItem}>
          {stat.icon && (
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              {stat.icon}
            </View>
          )}
          <Text style={[styles.statValue, { color: stat.color || Colors.light.primary }]}>
            {stat.value}
          </Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateIcon: {
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  emptyStateButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyStateButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  listItemDisabled: {
    opacity: 0.6,
  },
  listItemIcon: {
    marginRight: theme.spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginTop: 2,
  },
  listItemRight: {
    marginLeft: theme.spacing.md,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
});