import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Search, X, Users, ChevronRight, Sliders, Building } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { ENV } from '@/config/env';
import { useUserStore } from '@/store/userStore';
import { useAdminStore } from '@/store/adminStore';
import FeatureToggleList from '@/components/FeatureToggleList';
import { useFeatureFlagsStore, FEATURE_CATALOG } from '@/store/featureFlagsStore';

interface GroupItem {
  id: string;
  name: string;
  description?: string;
}

type View = 'org' | 'group';

export default function OrganizationFeaturesScreen() {
  const { organization } = useUserStore();
  const { directusToken } = useAdminStore();
  const [view, setView] = useState<View>('org');
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [query, setQuery] = useState('');
  const groupFlags = useFeatureFlagsStore((s) => s.groupFlags);

  const orgId = organization?.id != null ? String(organization.id) : null;
  const orgName = organization?.name || 'Your Organization';

  useEffect(() => {
    if (orgId) void fetchGroups(orgId);
    else setLoading(false);
  }, [orgId]);

  const fetchGroups = async (organizationId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/groups?filter[organization_id][_eq]=${organizationId}&fields=id,name,description&limit=-1`,
        {
          headers: {
            'Authorization': `Bearer ${directusToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error('Failed to load groups');
      const data = await res.json();
      const list: GroupItem[] = (data.data || []).map((g: any) => ({
        id: String(g.id),
        name: g.name || 'Unnamed Group',
        description: g.description,
      }));
      setGroups(list);
    } catch (e) {
      console.error('❌ features groups fetch', e);
      Alert.alert('Error', 'Could not load groups.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, query]);

  const overrideCount = (id: string): number => {
    const f = groupFlags[id];
    return f ? Object.keys(f).length : 0;
  };

  if (selectedGroup) {
    return (
      <View style={styles.container}>
        <View style={styles.selectedHeader}>
          <TouchableOpacity onPress={() => setSelectedGroup(null)} style={styles.backBtn}>
            <X size={18} color={Colors.light.text} />
            <Text style={styles.backTxt}>All groups</Text>
          </TouchableOpacity>
        </View>
        <FeatureToggleList
          scope="group"
          targetId={selectedGroup.id}
          targetLabel={selectedGroup.name}
          accentColor={Colors.light.org1}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, view === 'org' && styles.tabActive]}
          onPress={() => setView('org')}
          testID="features-tab-org"
        >
          <Building size={16} color={view === 'org' ? Colors.light.org1 : Colors.light.textLight} />
          <Text style={[styles.tabTxt, view === 'org' && styles.tabTxtActive]}>Church</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'group' && styles.tabActive]}
          onPress={() => setView('group')}
          testID="features-tab-group"
        >
          <Users size={16} color={view === 'group' ? Colors.light.org1 : Colors.light.textLight} />
          <Text style={[styles.tabTxt, view === 'group' && styles.tabTxtActive]}>Groups</Text>
        </TouchableOpacity>
      </View>

      {view === 'org' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
          {orgId ? (
            <FeatureToggleList
              scope="organization"
              targetId={orgId}
              targetLabel={orgName}
              accentColor={Colors.light.org1}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>No organization loaded.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.searchRow}>
            <Search size={18} color={Colors.light.textLight} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search groups..."
              placeholderTextColor={Colors.light.textLight}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <X size={18} color={Colors.light.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.light.org1} />
            </View>
          ) : (
            <FlatList
              data={filteredGroups}
              keyExtractor={(g) => g.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const count = overrideCount(item.id);
                return (
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => setSelectedGroup(item)}
                    testID={`group-row-${item.id}`}
                  >
                    <View style={styles.icon}>
                      <Users size={20} color={Colors.light.org1} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardMeta}>
                        {count > 0
                          ? `${count} override${count === 1 ? '' : 's'}`
                          : `${FEATURE_CATALOG.length} features (inherit)`}
                      </Text>
                    </View>
                    <Sliders size={18} color={Colors.light.textLight} />
                    <ChevronRight size={18} color={Colors.light.textLight} />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTxt}>No groups yet.</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  tabActive: {
    borderColor: Colors.light.org1,
    backgroundColor: Colors.light.org1 + '10',
  },
  tabTxt: { ...theme.typography.caption, color: Colors.light.textLight, fontWeight: '600' },
  tabTxtActive: { color: Colors.light.org1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: theme.spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: 12, color: Colors.light.text },
  listContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.org1 + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...theme.typography.body, fontWeight: '600', color: Colors.light.text },
  cardMeta: { ...theme.typography.small, color: Colors.light.textLight, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyTxt: { ...theme.typography.body, color: Colors.light.textLight },
  selectedHeader: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  backTxt: { ...theme.typography.caption, color: Colors.light.text, fontWeight: '600' },
});
