import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Search, X, Building, ChevronRight, Sliders } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { ENV } from '@/config/env';
import FeatureToggleList from '@/components/FeatureToggleList';
import { useFeatureFlagsStore, FEATURE_CATALOG } from '@/store/featureFlagsStore';

interface OrgItem {
  id: string;
  name: string;
  city?: string;
}

export default function AdminFeaturesScreen() {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OrgItem | null>(null);
  const [query, setQuery] = useState('');
  const organizationFlags = useFeatureFlagsStore((s) => s.organizationFlags);

  useEffect(() => {
    void fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organizations?fields=id,name,city&limit=-1`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error('Failed to load organizations');
      const data = await res.json();
      const list: OrgItem[] = (data.data || []).map((o: any) => ({
        id: String(o.id),
        name: o.name || 'Unnamed',
        city: o.city,
      }));
      setOrgs(list);
    } catch (e) {
      console.error('❌ features orgs fetch', e);
      Alert.alert('Error', 'Could not load organizations.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter((o) => o.name.toLowerCase().includes(q) || (o.city || '').toLowerCase().includes(q));
  }, [orgs, query]);

  const overrideCount = (id: string): number => {
    const f = organizationFlags[id];
    return f ? Object.keys(f).length : 0;
  };

  if (selected) {
    return (
      <View style={styles.container}>
        <View style={styles.selectedHeader}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn} testID="back-to-orgs">
            <X size={18} color={Colors.light.text} />
            <Text style={styles.backTxt}>All organizations</Text>
          </TouchableOpacity>
        </View>
        <FeatureToggleList
          scope="organization"
          targetId={selected.id}
          targetLabel={selected.name}
          accentColor="#e74c3c"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feature Management</Text>
        <Text style={styles.subtitle}>
          Enable or disable features for each organization. Overrides apply instantly to all members.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <Search size={18} color={Colors.light.textLight} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search organizations..."
          placeholderTextColor={Colors.light.textLight}
          testID="features-search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <X size={18} color={Colors.light.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const count = overrideCount(item.id);
            return (
              <TouchableOpacity
                style={styles.orgCard}
                onPress={() => setSelected(item)}
                testID={`org-row-${item.id}`}
              >
                <View style={styles.orgIcon}>
                  <Building size={20} color="#e74c3c" />
                </View>
                <View style={styles.orgBody}>
                  <Text style={styles.orgName}>{item.name}</Text>
                  <Text style={styles.orgMeta}>
                    {count > 0 ? `${count} override${count === 1 ? '' : 's'}` : `${FEATURE_CATALOG.length} features default`}
                    {item.city ? ` · ${item.city}` : ''}
                  </Text>
                </View>
                <Sliders size={18} color={Colors.light.textLight} />
                <ChevronRight size={18} color={Colors.light.textLight} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>No organizations found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.sm },
  title: { ...theme.typography.title, color: '#e74c3c' },
  subtitle: { ...theme.typography.caption, color: Colors.light.textLight, marginTop: 4 },
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
  orgCard: {
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
  orgIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e74c3c20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgBody: { flex: 1 },
  orgName: { ...theme.typography.body, fontWeight: '600', color: Colors.light.text },
  orgMeta: { ...theme.typography.small, color: Colors.light.textLight, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyTxt: { ...theme.typography.body, color: Colors.light.textLight },
  selectedHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
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
