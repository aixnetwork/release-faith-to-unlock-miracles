import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { RotateCcw, Check } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import {
  FEATURE_CATALOG,
  FeatureKey,
  Scope,
  useFeatureFlagsStore,
} from '@/store/featureFlagsStore';

interface FeatureToggleListProps {
  scope: Scope;
  targetId: string;
  targetLabel?: string;
  accentColor?: string;
}

export default function FeatureToggleList({
  scope,
  targetId,
  targetLabel,
  accentColor = Colors.light.primary,
}: FeatureToggleListProps) {
  const flags = useFeatureFlagsStore((s) =>
    scope === 'organization' ? s.organizationFlags[targetId] : s.groupFlags[targetId]
  );
  const setFlag = useFeatureFlagsStore((s) => s.setFlag);
  const setManyFlags = useFeatureFlagsStore((s) => s.setManyFlags);
  const resetFlags = useFeatureFlagsStore((s) => s.resetFlags);

  const isEnabled = (key: FeatureKey): boolean => {
    if (flags && flags[key] !== undefined) return flags[key] as boolean;
    const def = FEATURE_CATALOG.find((f) => f.key === key);
    return def ? def.defaultEnabled : true;
  };

  const enabledCount = FEATURE_CATALOG.filter((f) => isEnabled(f.key)).length;

  const handleEnableAll = () => {
    const all: Record<string, boolean> = {};
    FEATURE_CATALOG.forEach((f) => {
      all[f.key] = true;
    });
    setManyFlags(scope, targetId, all as any);
  };

  const handleDisableAll = () => {
    const all: Record<string, boolean> = {};
    FEATURE_CATALOG.forEach((f) => {
      all[f.key] = false;
    });
    setManyFlags(scope, targetId, all as any);
  };

  return (
    <View style={styles.container} testID={`feature-toggle-list-${scope}-${targetId}`}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Feature Controls</Text>
          {targetLabel ? (
            <Text style={styles.subheading} numberOfLines={1}>
              {scope === 'organization' ? 'Church' : 'Group'}: {targetLabel}
            </Text>
          ) : null}
          <Text style={styles.counter}>
            {enabledCount} of {FEATURE_CATALOG.length} enabled
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => resetFlags(scope, targetId)}
          style={styles.resetBtn}
          testID="feature-reset-btn"
        >
          <RotateCcw size={14} color={Colors.light.textLight} />
          <Text style={styles.resetTxt}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bulkRow}>
        <TouchableOpacity
          style={[styles.bulkBtn, { borderColor: accentColor }]}
          onPress={handleEnableAll}
          testID="feature-enable-all"
        >
          <Check size={14} color={accentColor} />
          <Text style={[styles.bulkTxt, { color: accentColor }]}>Enable all</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bulkBtn, { borderColor: Colors.light.error }]}
          onPress={handleDisableAll}
          testID="feature-disable-all"
        >
          <Text style={[styles.bulkTxt, { color: Colors.light.error }]}>Disable all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {FEATURE_CATALOG.map((feature) => {
          const enabled = isEnabled(feature.key);
          const isOverride = flags && flags[feature.key] !== undefined;
          return (
            <View key={feature.key} style={styles.row} testID={`feature-row-${feature.key}`}>
              <View style={styles.rowText}>
                <View style={styles.rowTitleWrap}>
                  <Text style={styles.rowTitle}>{feature.label}</Text>
                  {isOverride ? (
                    <View style={[styles.overrideBadge, { backgroundColor: accentColor + '20' }]}>
                      <Text style={[styles.overrideTxt, { color: accentColor }]}>Override</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.rowDesc}>{feature.description}</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(v) => setFlag(scope, targetId, feature.key, v)}
                trackColor={{ false: '#D1D5DB', true: accentColor }}
                thumbColor="#FFFFFF"
                testID={`feature-switch-${feature.key}`}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  heading: {
    ...theme.typography.subtitle,
    fontSize: 18,
    color: Colors.light.text,
  },
  subheading: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: 2,
  },
  counter: {
    ...theme.typography.small,
    color: Colors.light.textSubtle,
    marginTop: 4,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  resetTxt: {
    ...theme.typography.small,
    color: Colors.light.textLight,
    fontWeight: '600',
  },
  bulkRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    backgroundColor: Colors.light.white,
  },
  bulkTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  rowText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  rowTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.text,
  },
  rowDesc: {
    ...theme.typography.small,
    color: Colors.light.textLight,
    marginTop: 2,
  },
  overrideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  overrideTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
});
