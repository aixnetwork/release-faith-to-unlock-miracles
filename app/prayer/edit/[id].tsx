import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, ToastAndroid, Platform } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { BackButton } from '@/components/BackButton';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/utils/translations';
import BottomNavigation from '@/components/BottomNavigation';

import { ENV } from '@/config/env';

const PRAYER_CATEGORIES = [
  'Health',
  'Family',
  'Work',
  'Guidance',
  'Gratitude',
  'Other'
];

export default function EditPrayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings, user, organization } = useUserStore();
  const { t } = useTranslation(settings.language);

  const [prayerData, setPrayerData] = useState<any>(null);
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shareOnWall, setShareOnWall] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const fetchPrayerAndCheckPermissions = async () => {
      if (!id || !user?.id) return;
      
      try {
        setLoadingPrayer(true);
        
        const response = await fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}?fields=*,user_id.id,user_id.first_name,user_id.last_name`,
          {
            headers: {
              'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          console.error('Failed to fetch prayer:', response.status);
          setLoadingPrayer(false);
          return;
        }
        
        const data = await response.json();
        const prayer = data.data;
        
        setPrayerData({ prayer });
        setTitle(prayer.title || '');
        setContent(prayer.content || '');
        setShareOnWall(prayer.shareOnWall || false);
        setSelectedCategory(prayer.category ? prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1) : '');
        
        const prayerUserId = typeof prayer.user_id === 'string' ? prayer.user_id : prayer.user_id?.id;
        const isOwner = prayerUserId === user?.id;
        
        let isOrganizerRole = false;
        if (prayer.organization_id && user?.id) {
          try {
            const orgResponse = await fetch(
              `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_users?filter[user_id][_eq]=${user.id}&filter[organization_id][_eq]=${prayer.organization_id}&fields=role_id`,
              {
                headers: {
                  'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (orgResponse.ok) {
              const orgData = await orgResponse.json();
              if (orgData.data && orgData.data.length > 0) {
                const roleId = orgData.data[0].role_id;
                isOrganizerRole = roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;
              }
            }
          } catch (error) {
            console.error('Error checking organizer role:', error);
          }
        }
        
        setCanEdit(isOwner || isOrganizerRole);
        setIsOrganizer(isOrganizerRole);
        
        console.log('=== Edit Prayer Permissions ===');
        console.log('Prayer user_id:', prayerUserId);
        console.log('Current user:', user?.id);
        console.log('Prayer org ID:', prayer.organization_id);
        console.log('Is owner:', isOwner);
        console.log('Is organizer:', isOrganizerRole);
        console.log('Can edit:', isOwner || isOrganizerRole);
        console.log('Can mark answered:', isOrganizerRole);
        
      } catch (error) {
        console.error('Error fetching prayer:', error);
      } finally {
        setLoadingPrayer(false);
      }
    };
    
    fetchPrayerAndCheckPermissions();
  }, [id, user?.id]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(t('common.error'), 'Please fill in both title and prayer request.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category: selectedCategory.toLowerCase() || 'other',
            shareOnWall,
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update prayer:', response.status, errorText);
        throw new Error('Failed to update prayer');
      }
      
      console.log('Prayer updated successfully');
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('✓ Prayer updated successfully!', ToastAndroid.LONG);
      } else {
        Alert.alert(t('common.success'), 'Prayer updated successfully!');
      }
      
      setTimeout(() => {
        if (router.canGoBack && router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/prayers');
        }
      }, Platform.OS === 'android' ? 800 : 0);
      
    } catch (error) {
      console.error('Prayer update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update prayer. Please try again.';
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAnswered = async () => {
    if (!isOrganizer) {
      Alert.alert(t('common.error'), 'Only organizers can mark prayers as answered.');
      return;
    }

    Alert.alert(
      'Mark as Answered',
      'Are you sure you want to mark this prayer as answered?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Answered',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              const response = await fetch(
                `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    answered: true,
                  }),
                }
              );
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to mark prayer as answered:', response.status, errorText);
                throw new Error('Failed to mark prayer as answered');
              }
              
              console.log('Prayer marked as answered successfully');
              
              if (Platform.OS === 'android') {
                ToastAndroid.show('✓ Prayer marked as answered!', ToastAndroid.LONG);
              } else {
                Alert.alert(t('common.success'), 'Prayer marked as answered!');
              }
              
              setTimeout(() => {
                handleGoBack();
              }, Platform.OS === 'android' ? 800 : 0);
            } catch (error) {
              console.error('Error marking prayer as answered:', error);
              Alert.alert(t('common.error'), 'Failed to mark prayer as answered.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    try {
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/prayers');
      }
    } catch (error) {
      console.error('Navigation error on go back:', error);
      router.replace('/(tabs)/prayers');
    }
  };

  const handleCancel = () => {
    handleGoBack();
  };

  if (loadingPrayer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading prayer...</Text>
      </View>
    );
  }

  if (!prayerData?.prayer) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Prayer not found</Text>
        <Button title="Go Back" onPress={handleGoBack} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Edit Prayer',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
            headerTitleStyle: { color: Colors.light.text },
            headerLeft: () => (
              <BackButton onPress={handleCancel} color={Colors.light.text} />
            ),
          }}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {!canEdit && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  You can only view this prayer. Only the prayer creator can edit it.
                </Text>
              </View>
            )}

            {isOrganizer && !canEdit && (
              <View style={styles.infoBanner}>
                <Text style={styles.infoText}>
                  As an organizer, you can mark this prayer as answered.
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.titleInput, !canEdit && styles.disabledInput]}
                placeholder="Enter prayer title..."
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.light.inputPlaceholder}
                maxLength={100}
                editable={canEdit}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prayer Request</Text>
              <TextInput
                style={[styles.contentInput, !canEdit && styles.disabledInput]}
                placeholder="Share your prayer request..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={Colors.light.inputPlaceholder}
                maxLength={1000}
                editable={canEdit}
              />
            </View>

            <View style={styles.shareSection}>
              <View style={styles.shareHeader}>
                <Text style={styles.shareTitle}>Share on Prayer Wall</Text>
                <Switch
                  value={shareOnWall}
                  onValueChange={setShareOnWall}
                  trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary }}
                  thumbColor={shareOnWall ? Colors.light.white : Colors.light.textMedium}
                  disabled={!canEdit}
                />
              </View>
              <Text style={styles.shareDescription}>
                When enabled, your prayer will be visible to all users on the prayer wall for community support.
              </Text>
            </View>

            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {PRAYER_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategoryButton,
                      !canEdit && styles.disabledButton
                    ]}
                    onPress={() => canEdit && setSelectedCategory(category)}
                    disabled={!canEdit}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category && styles.selectedCategoryButtonText
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('common.cancel')}
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
            size="medium"
          />
          {canEdit ? (
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading}
              style={styles.saveButton}
              size="medium"
            />
          ) : isOrganizer ? (
            <Button
              title="Mark as Answered"
              onPress={handleMarkAnswered}
              loading={isLoading}
              style={styles.saveButton}
              size="medium"
            />
          ) : null}
        </View>
      </View>
      <BottomNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    marginBottom: theme.spacing.lg,
  },

  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.lg,
  },
  warningBanner: {
    backgroundColor: Colors.light.warning + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  warningText: {
    fontSize: 14,
    color: Colors.light.warning,
    fontWeight: '600',
  },
  infoBanner: {
    backgroundColor: Colors.light.primary + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#374151',
  },
  titleInput: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
  },
  contentInput: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
    minHeight: 120,
  },
  disabledInput: {
    backgroundColor: Colors.light.borderLight,
    opacity: 0.7,
  },
  shareSection: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  shareDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    color: Colors.light.textMedium,
  },
  categorySection: {
    gap: theme.spacing.md,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#374151',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  selectedCategoryButtonText: {
    color: Colors.light.white,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.borderRadius.lg,
  },
  saveButton: {
    flex: 1.5,
    minHeight: 52,
    borderRadius: theme.borderRadius.lg,
  },
});
