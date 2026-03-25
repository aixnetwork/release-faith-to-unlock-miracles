import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Clock } from 'lucide-react-native';
import type { MarketplaceSettings, ServiceCategory } from '@/types';

export default function MarketplaceSettingsScreen() {
  console.log('🏪 Marketplace Settings Screen rendered');
  
  const [settings, setSettings] = useState<MarketplaceSettings>({
    enabled: true,
    commissionRate: 5,
    requireApproval: true,
    allowedCategories: [],
    featuredListingPrice: 25,
    maxImagesPerListing: 5,
    autoApproveVerifiedProviders: true,
    enableBookings: true,
    enablePayments: true,
    enableReviews: true,
    moderationEnabled: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const settingsQuery = trpc.marketplace.getSettings.useQuery(undefined, {
    retry: 2,
    refetchOnWindowFocus: false,
  });
  
  const pendingListingsQuery = trpc.marketplace.getPendingListings.useQuery(undefined, {
    retry: 2,
    refetchOnWindowFocus: false,
  });
  
  console.log('🔍 Settings Query State:', {
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error?.message,
    data: settingsQuery.data
  });
  
  console.log('🔍 Pending Listings Query State:', {
    isLoading: pendingListingsQuery.isLoading,
    error: pendingListingsQuery.error?.message,
    data: pendingListingsQuery.data
  });
  
  const updateSettingsMutation = trpc.marketplace.updateSettings.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Marketplace settings updated successfully');
      setHasChanges(false);
      settingsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  useEffect(() => {
    console.log('🔄 Settings data changed:', settingsQuery.data);
    if (settingsQuery.data?.settings) {
      console.log('✅ Updating local settings with:', settingsQuery.data.settings);
      setSettings(settingsQuery.data.settings);
    }
  }, [settingsQuery.data]);

  const handleSave = () => {
    console.log('💾 Saving settings:', settings);
    updateSettingsMutation.mutate(settings);
  };

  const updateSetting = <K extends keyof MarketplaceSettings>(
    key: K,
    value: MarketplaceSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleCategory = (category: ServiceCategory) => {
    const newCategories = settings.allowedCategories.includes(category)
      ? settings.allowedCategories.filter(c => c !== category)
      : [...settings.allowedCategories, category];
    
    updateSetting('allowedCategories', newCategories);
  };

  const allCategories: { value: ServiceCategory; label: string }[] = [
    { value: 'spiritual-guidance', label: 'Spiritual Guidance' },
    { value: 'counseling', label: 'Counseling' },
    { value: 'music-ministry', label: 'Music Ministry' },
    { value: 'event-planning', label: 'Event Planning' },
    { value: 'education', label: 'Education & Tutoring' },
    { value: 'technology', label: 'Technology Services' },
    { value: 'creative-services', label: 'Creative Services' },
    { value: 'business-consulting', label: 'Business Consulting' },
    { value: 'health-wellness', label: 'Health & Wellness' },
    { value: 'childcare', label: 'Childcare' },
    { value: 'home-repair', label: 'Home Repair' },
    { value: 'cleaning', label: 'Cleaning Services' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'other', label: 'Other' },
  ];

  if (settingsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (settingsQuery.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Error loading settings:</Text>
          <Text style={styles.errorMessage}>{settingsQuery.error.message}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => settingsQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Marketplace Settings',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges || updateSettingsMutation.isPending}
              style={[
                styles.saveButton,
                (!hasChanges || updateSettingsMutation.isPending) && styles.saveButtonDisabled
              ]}
            >
              <Text style={[
                styles.saveButtonText,
                (!hasChanges || updateSettingsMutation.isPending) && styles.saveButtonTextDisabled
              ]}>
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/admin/service-approvals')}
          >
            <View style={styles.quickActionIcon}>
              <Clock size={24} color="#F59E0B" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Service Approvals</Text>
              <Text style={styles.quickActionDescription}>
                {pendingListingsQuery.isLoading 
                  ? 'Loading...'
                  : pendingListingsQuery.error
                  ? 'Error loading pending count'
                  : `${pendingListingsQuery.data?.total || 0} services pending review`
                }
              </Text>
            </View>
            {!pendingListingsQuery.isLoading && !pendingListingsQuery.error && (
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>
                  {pendingListingsQuery.data?.total || 0}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Debug Info Section */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <Text style={styles.debugText}>Settings Query Loading: {settingsQuery.isLoading ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Settings Query Error: {(settingsQuery.error as Error | null)?.message || 'None'}</Text>
          <Text style={styles.debugText}>Has Data: {settingsQuery.data ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Has Changes: {hasChanges ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Mutation Pending: {updateSettingsMutation.isPending ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Pending Query Loading: {pendingListingsQuery.isLoading ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Pending Query Error: {(pendingListingsQuery.error as Error | null)?.message || 'None'}</Text>
          <Text style={styles.debugText}>Pending Approvals: {pendingListingsQuery.data?.total ?? 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Marketplace</Text>
              <Text style={styles.settingDescription}>
                Allow users to create and browse service listings
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => updateSetting('enabled', value)}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.enabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Require Approval</Text>
              <Text style={styles.settingDescription}>
                New listings must be approved before going live
              </Text>
            </View>
            <Switch
              value={settings.requireApproval}
              onValueChange={(value) => updateSetting('requireApproval', value)}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.requireApproval ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-approve Verified Providers</Text>
              <Text style={styles.settingDescription}>
                Skip approval for verified community members
              </Text>
            </View>
            <Switch
              value={settings.autoApproveVerifiedProviders}
              onValueChange={(value) => updateSetting('autoApproveVerifiedProviders', value)}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.autoApproveVerifiedProviders ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Commission Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={settings.commissionRate.toString()}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                if (value >= 0 && value <= 100) {
                  updateSetting('commissionRate', value);
                }
              }}
              keyboardType="numeric"
              placeholder="5"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Featured Listing Price ($)</Text>
            <TextInput
              style={styles.input}
              value={settings.featuredListingPrice.toString()}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                if (value >= 0) {
                  updateSetting('featuredListingPrice', value);
                }
              }}
              keyboardType="numeric"
              placeholder="25"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Max Images Per Listing</Text>
            <TextInput
              style={styles.input}
              value={settings.maxImagesPerListing.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 1;
                if (value >= 1 && value <= 10) {
                  updateSetting('maxImagesPerListing', value);
                }
              }}
              keyboardType="numeric"
              placeholder="5"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Bookings</Text>
              <Text style={styles.settingDescription}>
                Allow users to book services directly through the app
              </Text>
            </View>
            <Switch
              value={settings.enableBookings}
              onValueChange={(value) => updateSetting('enableBookings', value)}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.enableBookings ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Payments</Text>
              <Text style={styles.settingDescription}>
                Process payments through the platform
              </Text>
            </View>
            <Switch
              value={settings.enablePayments}
              onValueChange={(value) => updateSetting('enablePayments', value)}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.enablePayments ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Reviews</Text>
              <Text style={styles.settingDescription}>
                Allow users to rate and review services
              </Text>
            </View>
            <Switch
              value={settings.enableReviews}
              onValueChange={(value) => updateSetting('enableReviews', value)}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.enableReviews ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Content Moderation</Text>
              <Text style={styles.settingDescription}>
                Enable automated content filtering and reporting
              </Text>
            </View>
            <Switch
              value={settings.moderationEnabled}
              onValueChange={(value) => updateSetting('moderationEnabled', value)}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.moderationEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allowed Categories</Text>
          <Text style={styles.sectionDescription}>
            Select which service categories are available in your marketplace
          </Text>
          
          {allCategories.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={styles.categoryRow}
              onPress={() => toggleCategory(category.value)}
            >
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <View style={[
                styles.checkbox,
                settings.allowedCategories.includes(category.value) && styles.checkboxChecked
              ]}>
                {settings.allowedCategories.includes(category.value) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#D1D5DB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 32,
  },
  debugSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 14,
    color: '#666',
  },
  quickActionBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  quickActionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});