import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { Save, Building, Users, Mail, Globe, Image } from 'lucide-react-native';

export default function OrganizationSettingsScreen() {
  const router = useRouter();
  const { isLoggedIn, user, organization, updateOrganization } = useUserStore();
  
  // Organization settings
  const [orgDisplayName, setOrgDisplayName] = useState(organization?.name || '');
  const [publicProfile, setPublicProfile] = useState(true);
  const [allowMemberJoin, setAllowMemberJoin] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [customDomain, setCustomDomain] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // If not logged in or not an org admin, redirect
  const isOrgAdmin = user?.organizationRole === 'admin';
  
  React.useEffect(() => {
    if (!isLoggedIn || !isOrgAdmin) {
      router.replace('/');
    }
  }, [isLoggedIn, isOrgAdmin]);

  if (!isLoggedIn || !isOrgAdmin) {
    return null;
  }

  const handleSaveSettings = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!orgDisplayName.trim()) {
      Alert.alert("Error", "Organization name cannot be empty.");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      updateOrganization({
        name: orgDisplayName,
      });
      
      setIsLoading(false);
      Alert.alert("Success", "Organization settings have been updated successfully.");
    }, 1000);
  };

  const handleUploadLogo = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      "Upload Logo",
      "This feature will be available in a future update."
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Organization Settings",
          headerTintColor: Colors.light.org1
        }} 
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization Profile</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>{orgDisplayName ? orgDisplayName.charAt(0).toUpperCase() : 'O'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleUploadLogo}
              >
                <Image size={16} color={Colors.light.white} style={styles.uploadIcon} />
                <Text style={styles.uploadText}>Upload Logo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Organization Name</Text>
              <TextInput
                style={styles.input}
                value={orgDisplayName}
                onChangeText={setOrgDisplayName}
                placeholder="Enter organization name"
                placeholderTextColor={Colors.light.textLight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Custom Domain (Optional)</Text>
              <TextInput
                style={styles.input}
                value={customDomain}
                onChangeText={setCustomDomain}
                placeholder="e.g., mychurch.org"
                placeholderTextColor={Colors.light.textLight}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.inputHint}>
                Enter your domain to customize your organization's URL
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility & Access</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Public Profile</Text>
                <Text style={styles.settingsItemDescription}>
                  Make your organization visible to the public
                </Text>
              </View>
              <Switch
                value={publicProfile}
                onValueChange={setPublicProfile}
                trackColor={{ false: Colors.light.border, true: Colors.light.org1 + '80' }}
                thumbColor={publicProfile ? Colors.light.org1 : '#f4f3f4'}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Allow Member Join Requests</Text>
                <Text style={styles.settingsItemDescription}>
                  Let users request to join your organization
                </Text>
              </View>
              <Switch
                value={allowMemberJoin}
                onValueChange={setAllowMemberJoin}
                trackColor={{ false: Colors.light.border, true: Colors.light.org1 + '80' }}
                thumbColor={allowMemberJoin ? Colors.light.org1 : '#f4f3f4'}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Require Admin Approval</Text>
                <Text style={styles.settingsItemDescription}>
                  Approve new members before they can join
                </Text>
              </View>
              <Switch
                value={requireApproval}
                onValueChange={setRequireApproval}
                trackColor={{ false: Colors.light.border, true: Colors.light.org1 + '80' }}
                thumbColor={requireApproval ? Colors.light.org1 : '#f4f3f4'}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Email Notifications</Text>
                <Text style={styles.settingsItemDescription}>
                  Send email updates to organization members
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: Colors.light.border, true: Colors.light.org1 + '80' }}
                thumbColor={emailNotifications ? Colors.light.org1 : '#f4f3f4'}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription & Billing</Text>
          
          <View style={styles.subscriptionCard}>
            <View style={styles.planInfo}>
              <Text style={styles.currentPlan}>
                Current Plan: {organization?.plan === 'org_small' ? 'Small Church' : 
                              organization?.plan === 'org_medium' ? 'Medium Church' : 
                              'Large Church'}
              </Text>
              <Text style={styles.planDetails}>
                {organization?.plan === 'org_small' ? 'Up to 100 members, 5 groups' : 
                 organization?.plan === 'org_medium' ? 'Up to 500 members, 20 groups' : 
                 'Unlimited members and groups'}
              </Text>
            </View>
            <Button
              title="Manage Subscription"
              onPress={() => Alert.alert("Manage Subscription", "This feature will be available in a future update.")}
              variant="outline"
              size="small"
              style={styles.manageButton}
            />
          </View>
        </View>

        <Button
          title="Save Settings"
          onPress={handleSaveSettings}
          loading={isLoading}
          icon={<Save size={18} color={Colors.light.white} />}
          style={styles.saveButton}
        />
        
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <Button
            title="Delete Organization"
            onPress={() => Alert.alert(
              "Delete Organization",
              "Are you sure you want to delete your organization? This action cannot be undone and will remove all organization data.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => Alert.alert("Organization Deletion", "This feature will be available in a future update.") }
              ]
            )}
            variant="danger"
            style={styles.deleteButton}
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
    marginBottom: theme.spacing.md,
  },
  profileCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.org1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    color: Colors.light.white,
    fontSize: 40,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.org1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
  },
  uploadIcon: {
    marginRight: 6,
  },
  uploadText: {
    color: Colors.light.white,
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.subtitle,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputHint: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: 4,
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
    marginBottom: 2,
  },
  settingsItemDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  subscriptionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  currentPlan: {
    ...theme.typography.subtitle,
    marginBottom: 2,
  },
  planDetails: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  manageButton: {
    borderColor: Colors.light.org1,
  },
  saveButton: {
    marginTop: theme.spacing.md,
    backgroundColor: Colors.light.org1,
  },
  dangerZone: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: '#ffebee',
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.error,
  },
  dangerZoneTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.error,
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
  },
});