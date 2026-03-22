import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { Download, Shield } from 'lucide-react-native';

export default function PrivacySettingsScreen() {
  const { isLoggedIn, settings, updateSettings } = useUserStore();
  const [shareActivity, setShareActivity] = useState(settings.shareActivity ?? true);
  const [showProfile, setShowProfile] = useState(settings.showProfile ?? true);
  const [allowDataCollection, setAllowDataCollection] = useState(settings.allowDataCollection ?? true);

  const handleToggleShareActivity = (value: boolean) => {
    setShareActivity(value);
    updateSettings({ shareActivity: value });
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleToggleShowProfile = (value: boolean) => {
    setShowProfile(value);
    updateSettings({ showProfile: value });
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleToggleDataCollection = (value: boolean) => {
    setAllowDataCollection(value);
    updateSettings({ allowDataCollection: value });
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleExportData = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Export Personal Data",
      "This will generate a file with all your personal data. This feature will be available in a future update."
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Privacy" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Share My Activity</Text>
                <Text style={styles.settingsItemDescription}>
                  Allow others to see your prayer activity
                </Text>
              </View>
              <Switch
                value={shareActivity}
                onValueChange={handleToggleShareActivity}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary + '80' }}
                thumbColor={shareActivity ? Colors.light.primary : Colors.light.textMedium}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Show My Profile</Text>
                <Text style={styles.settingsItemDescription}>
                  Make your profile visible to other users
                </Text>
              </View>
              <Switch
                value={showProfile}
                onValueChange={handleToggleShowProfile}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary + '80' }}
                thumbColor={showProfile ? Colors.light.primary : Colors.light.textMedium}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Allow Data Collection</Text>
                <Text style={styles.settingsItemDescription}>
                  Help us improve by sharing anonymous usage data
                </Text>
              </View>
              <Switch
                value={allowDataCollection}
                onValueChange={handleToggleDataCollection}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary + '80' }}
                thumbColor={allowDataCollection ? Colors.light.primary : Colors.light.textMedium}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          
          <View style={styles.dataCard}>
            <Text style={styles.dataText}>
              You can export all your personal data at any time. This includes your profile information, 
              prayer requests, and activity history.
            </Text>
            <Button
              title="Export My Data"
              onPress={handleExportData}
              variant="outline"
              icon={<Download size={18} color={Colors.light.primary} />}
              style={styles.exportButton}
            />
          </View>
        </View>

        <View style={styles.privacyPolicySection}>
          <Shield size={24} color={Colors.light.primary} style={styles.privacyIcon} />
          <Text style={styles.privacyTitle}>Our Privacy Commitment</Text>
          <Text style={styles.privacyText}>
            We are committed to protecting your privacy and personal data. We never sell your 
            information to third parties and only collect what's necessary to provide you with 
            the best experience.
          </Text>
          <Button
            title="Read Privacy Policy"
            onPress={() => Alert.alert("Privacy Policy", "This feature will be available in a future update.")}
            variant="outline"
            size="small"
            style={styles.policyButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  settingsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingsItemLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingsItemText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  settingsItemDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  dataCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  dataText: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  exportButton: {
    alignSelf: 'flex-start',
  },
  privacyPolicySection: {
    backgroundColor: Colors.light.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  privacyIcon: {
    marginBottom: theme.spacing.sm,
  },
  privacyTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  privacyText: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  policyButton: {
    marginTop: theme.spacing.sm,
  },
});