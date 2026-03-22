import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { Search, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { hasPermission, ChurchAdminRole } from '@/types/church-admin';

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  userName: string;
  category: string;
  status: 'active' | 'answered' | 'hidden';
  createdAt: string;
  prayerCount: number;
  isReported?: boolean;
  reportReason?: string;
}

export default function OrganizationPrayersManagement() {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'answered' | 'hidden' | 'reported'>('all');
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const adminRole = (user?.organizationRole || 'member') as ChurchAdminRole;
  const canManage = hasPermission(adminRole, 'canManagePrayers');

  useEffect(() => {
    if (!canManage) {
      router.back();
      return;
    }
    loadPrayers();
  }, [canManage]);

  const loadPrayers = async () => {
    console.log('📖 Loading church prayers...');
    setLoading(true);
    setPrayers([
      {
        id: '1',
        title: 'Healing for my mother',
        description: 'Please pray for my mother who is in the hospital...',
        userName: 'John Doe',
        category: 'Health',
        status: 'active',
        createdAt: new Date().toISOString(),
        prayerCount: 45,
      },
      {
        id: '2',
        title: 'Financial breakthrough',
        description: 'Our family is going through financial difficulties...',
        userName: 'Jane Smith',
        category: 'Provision',
        status: 'active',
        createdAt: new Date().toISOString(),
        prayerCount: 32,
      },
      {
        id: '3',
        title: 'Guidance in career decision',
        description: 'Need wisdom for an important career choice...',
        userName: 'Mike Johnson',
        category: 'Guidance',
        status: 'answered',
        createdAt: new Date().toISOString(),
        prayerCount: 28,
      },
      {
        id: '4',
        title: 'Reported prayer with inappropriate content',
        description: 'This prayer contains inappropriate language...',
        userName: 'Anonymous',
        category: 'Other',
        status: 'active',
        createdAt: new Date().toISOString(),
        prayerCount: 5,
        isReported: true,
        reportReason: 'Inappropriate language',
      },
    ]);
    setLoading(false);
  };

  const filteredPrayers = prayers.filter(prayer => {
    const matchesSearch = prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prayer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prayer.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'reported' ? prayer.isReported :
      prayer.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleHidePrayer = (prayerId: string) => {
    Alert.alert(
      'Hide Prayer',
      'Are you sure you want to hide this prayer from the community?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: () => {
            setPrayers(prev =>
              prev.map(p => p.id === prayerId ? { ...p, status: 'hidden' as const } : p)
            );
            Alert.alert('Success', 'Prayer has been hidden');
          },
        },
      ]
    );
  };

  const handleShowPrayer = (prayerId: string) => {
    setPrayers(prev =>
      prev.map(p => p.id === prayerId ? { ...p, status: 'active' as const } : p)
    );
    Alert.alert('Success', 'Prayer is now visible');
  };

  const handleDeletePrayer = (prayerId: string) => {
    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to permanently delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPrayers(prev => prev.filter(p => p.id !== prayerId));
            Alert.alert('Success', 'Prayer has been deleted');
          },
        },
      ]
    );
  };

  const handleMarkAnswered = (prayerId: string) => {
    setPrayers(prev =>
      prev.map(p => p.id === prayerId ? { ...p, status: 'answered' as const } : p)
    );
    Alert.alert('Success', 'Prayer marked as answered');
  };

  const reportedCount = prayers.filter(p => p.isReported).length;
  const activeCount = prayers.filter(p => p.status === 'active').length;
  const answeredCount = prayers.filter(p => p.status === 'answered').length;
  const hiddenCount = prayers.filter(p => p.status === 'hidden').length;

  if (!canManage) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Prayer Management',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prayers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textLight}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({prayers.length})
            </Text>
          </TouchableOpacity>

          {reportedCount > 0 && (
            <TouchableOpacity
              style={[styles.filterChip, filter === 'reported' && styles.filterChipActive, styles.reportedChip]}
              onPress={() => setFilter('reported')}
            >
              <Text style={[styles.filterText, filter === 'reported' && styles.filterTextActive]}>
                Reported ({reportedCount})
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'answered' && styles.filterChipActive]}
            onPress={() => setFilter('answered')}
          >
            <Text style={[styles.filterText, filter === 'answered' && styles.filterTextActive]}>
              Answered ({answeredCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'hidden' && styles.filterChipActive]}
            onPress={() => setFilter('hidden')}
          >
            <Text style={[styles.filterText, filter === 'hidden' && styles.filterTextActive]}>
              Hidden ({hiddenCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading prayers...</Text>
        ) : filteredPrayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No prayers found</Text>
          </View>
        ) : (
          filteredPrayers.map((prayer) => (
            <View 
              key={prayer.id} 
              style={[
                styles.prayerCard,
                prayer.isReported && styles.reportedCard,
                prayer.status === 'hidden' && styles.hiddenCard,
              ]}
            >
              <View style={styles.prayerHeader}>
                <View style={styles.prayerInfo}>
                  <Text style={styles.prayerUserName}>{prayer.userName}</Text>
                  <Text style={styles.prayerCategory}>{prayer.category}</Text>
                </View>
                <View style={styles.statusContainer}>
                  {prayer.isReported && (
                    <View style={styles.reportBadge}>
                      <Text style={styles.reportBadgeText}>Reported</Text>
                    </View>
                  )}
                  <View style={[
                    styles.statusBadge,
                    prayer.status === 'answered' && styles.answeredBadge,
                    prayer.status === 'hidden' && styles.hiddenBadge,
                  ]}>
                    <Text style={styles.statusText}>
                      {prayer.status.charAt(0).toUpperCase() + prayer.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.prayerTitle}>{prayer.title}</Text>
              <Text style={styles.prayerDescription} numberOfLines={3}>
                {prayer.description}
              </Text>

              {prayer.isReported && prayer.reportReason && (
                <View style={styles.reportReasonContainer}>
                  <Text style={styles.reportReasonText}>
                    Reason: {prayer.reportReason}
                  </Text>
                </View>
              )}

              <View style={styles.prayerMeta}>
                <Text style={styles.prayerCount}>🙏 {prayer.prayerCount} prayers</Text>
                <Text style={styles.prayerDate}>
                  {new Date(prayer.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.actions}>
                {prayer.status !== 'hidden' && (
                  <>
                    {prayer.status !== 'answered' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.answerButton]}
                        onPress={() => handleMarkAnswered(prayer.id)}
                      >
                        <CheckCircle size={16} color={Colors.light.success} />
                        <Text style={[styles.actionText, { color: Colors.light.success }]}>
                          Mark Answered
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.hideButton]}
                      onPress={() => handleHidePrayer(prayer.id)}
                    >
                      <EyeOff size={16} color={Colors.light.warning} />
                      <Text style={[styles.actionText, { color: Colors.light.warning }]}>
                        Hide
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {prayer.status === 'hidden' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.showButton]}
                    onPress={() => handleShowPrayer(prayer.id)}
                  >
                    <Eye size={16} color={Colors.light.primary} />
                    <Text style={[styles.actionText, { color: Colors.light.primary }]}>
                      Show
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeletePrayer(prayer.id)}
                >
                  <Trash2 size={16} color={Colors.light.error} />
                  <Text style={[styles.actionText, { color: Colors.light.error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
  },
  filtersContainer: {
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  reportedChip: {
    borderColor: Colors.light.error,
  },
  filterText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  filterTextActive: {
    color: Colors.light.white,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
  },
  prayerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  reportedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  hiddenCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.textMedium,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerUserName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  prayerCategory: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  reportBadge: {
    backgroundColor: Colors.light.error + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  reportBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.light.error,
  },
  statusBadge: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  answeredBadge: {
    backgroundColor: Colors.light.success + '15',
  },
  hiddenBadge: {
    backgroundColor: Colors.light.textMedium + '15',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: theme.spacing.xs,
  },
  prayerDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  reportReasonContainer: {
    backgroundColor: Colors.light.error + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  reportReasonText: {
    fontSize: 12,
    color: Colors.light.error,
  },
  prayerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  prayerCount: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  prayerDate: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: Colors.light.background,
    gap: 4,
  },
  answerButton: {
    backgroundColor: Colors.light.success + '10',
  },
  hideButton: {
    backgroundColor: Colors.light.warning + '10',
  },
  showButton: {
    backgroundColor: Colors.light.primary + '10',
  },
  deleteButton: {
    backgroundColor: Colors.light.error + '10',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
