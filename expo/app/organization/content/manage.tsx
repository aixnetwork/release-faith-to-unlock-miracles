import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { Search, Filter, Edit2, Trash2, Eye, EyeOff, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { hasPermission, ChurchAdminRole } from '@/types/church-admin';
import { trpc } from '@/lib/trpc';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  'sermons': '🎤 Sermon',
  'bible-studies': '📖 Bible Study',
  'worship-songs': '🎵 Worship Song',
  'events': '📅 Event',
  'articles': '📝 Article',
  'videos': '🎥 Video',
};

export default function ManageContentScreen() {
  const insets = useSafeAreaInsets();
  const { user, organization } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const adminRole = (user?.organizationRole || 'member') as ChurchAdminRole;
  const canManage = hasPermission(adminRole, 'canCreateContent');

  const { data: contentData, refetch, isLoading } = trpc.content.list.useQuery(
    {
      organizationId: organization?.id || 0,
      contentType: selectedType,
      status: 'all',
      limit: 50,
      offset: 0,
    },
    {
      enabled: !!organization?.id && canManage,
    }
  );

  const deleteContentMutation = trpc.content.delete.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Content deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to delete content');
      console.error('Delete error:', error);
    },
  });

  const handleDelete = (contentId: string, title: string) => {
    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContentMutation.mutate({ contentId }),
        },
      ]
    );
  };

  const handleEdit = (contentId: string) => {
    router.push({
      pathname: '/organization/content/edit/[id]',
      params: { id: contentId }
    });
  };

  const filteredContent = (contentData?.items || []).filter((item: any) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!canManage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>You don't have permission to manage content</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Manage Content',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/organization/content/new')}
              style={styles.headerButton}
            >
              <Plus size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search content..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textLight}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <TouchableOpacity
              style={[styles.filterChip, !selectedType && styles.filterChipActive]}
              onPress={() => setSelectedType(undefined)}
            >
              <Text style={[styles.filterText, !selectedType && styles.filterTextActive]}>
                All Types
              </Text>
            </TouchableOpacity>
            {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.filterChip, selectedType === key && styles.filterChipActive]}
                onPress={() => setSelectedType(key)}
              >
                <Text style={[styles.filterText, selectedType === key && styles.filterTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Loading content...</Text>
        ) : filteredContent.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No content found</Text>
            <Text style={styles.emptySubtext}>
              Create your first {selectedType ? CONTENT_TYPE_LABELS[selectedType] : 'content'} to get started
            </Text>
          </View>
        ) : (
          filteredContent.map((item: any) => (
            <View key={item.id} style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <View style={styles.contentInfo}>
                  <Text style={styles.contentType}>
                    {CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                  </Text>
                  <Text style={styles.contentTitle}>{item.title}</Text>
                  <Text style={styles.contentDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  {item.isPublic ? (
                    <Eye size={16} color={Colors.light.success} />
                  ) : (
                    <EyeOff size={16} color={Colors.light.textMedium} />
                  )}
                </View>
              </View>

              <View style={styles.contentMeta}>
                <Text style={styles.contentDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {item.tags.slice(0, 3).map((tag: string, index: number) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(item.id)}
                >
                  <Edit2 size={16} color={Colors.light.primary} />
                  <Text style={[styles.actionText, { color: Colors.light.primary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.id, item.title)}
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
  headerButton: {
    padding: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
  },
  filtersContainer: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
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
  errorText: {
    ...theme.typography.body,
    color: Colors.light.error,
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.subtitle,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  contentInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  contentType: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginBottom: 4,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  contentDate: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: '600' as const,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
    flex: 1,
  },
  editButton: {
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
