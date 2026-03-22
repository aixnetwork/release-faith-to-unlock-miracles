import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Minus, Save } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { PrayerPlanDay } from '@/types';
import { ENV } from '@/config/env';
import { useUserStore } from '@/store/userStore';
import { fetchWithAuth } from '@/utils/authUtils';

export default function CreatePrayerPlanScreen() {
  const { user, isAdmin, organization } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isOrganizer = user?.organizationRole === 'admin';
  const canCreatePlan = isAdmin || isOrganizer;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(7);
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [prayers, setPrayers] = useState<PrayerPlanDay[]>([
    { day: 1, title: '', prayer: '', scripture: '', reflection: '' }
  ]);

  const addPrayerDay = () => {
    if (prayers.length < 365) { // Max 1 year
      setPrayers([...prayers, {
        day: prayers.length + 1,
        title: '',
        prayer: '',
        scripture: '',
        reflection: ''
      }]);
      setDuration(prayers.length + 1);
    }
  };

  const removePrayerDay = (index: number) => {
    if (prayers.length > 1) {
      const newPrayers = prayers.filter((_, i) => i !== index);
      // Renumber the days
      const renumberedPrayers = newPrayers.map((prayer, i) => ({
        ...prayer,
        day: i + 1
      }));
      setPrayers(renumberedPrayers);
      setDuration(renumberedPrayers.length);
    }
  };

  const updatePrayerDay = (index: number, field: keyof PrayerPlanDay, value: string) => {
    const newPrayers = [...prayers];
    newPrayers[index] = { ...newPrayers[index], [field]: value };
    setPrayers(newPrayers);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!canCreatePlan) {
      Alert.alert('Access Denied', 'Only organizers and admins can create prayer plans');
      return;
    }
    
    if (!user?.organizationId) {
      Alert.alert('Error', 'You must be part of an organization to create prayer plans');
      return;
    }
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your prayer plan');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for your prayer plan');
      return;
    }
    
    if (!category.trim()) {
      Alert.alert('Error', 'Please enter a category for your prayer plan');
      return;
    }
    
    if (prayers.some(p => !p.title.trim() || !p.prayer.trim())) {
      Alert.alert('Error', 'Please fill in the title and prayer for all days');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to create a prayer plan');
      return;
    }

    setIsSubmitting(true);

    try {
      const prayerPlanData = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        duration_days: duration,
        visibility: isPublic ? 'public' : 'private',
        tags: tags.length > 0 ? tags : null,
        user_id: user.id,
        organization_id: user.organizationId || null,
        status: 'published',
      };

      const planResponse = await fetchWithAuth(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_plans`,
        {
          method: 'POST',
          body: JSON.stringify(prayerPlanData),
        }
      );

      if (!planResponse.ok) {
        const errorData = await planResponse.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create prayer plan');
      }

      const planResult = await planResponse.json();
      const createdPlanId = planResult.data.id;

      const prayerDaysData = prayers.map((prayer) => ({
        prayer_plan_id: createdPlanId,
        day_number: prayer.day,
        title: prayer.title.trim(),
        prayer_context: prayer.prayer.trim(),
        scripture_reference: prayer.scripture?.trim() || null,
        reflection_prompt: prayer.reflection?.trim() || null,
      }));

      const daysResponse = await fetchWithAuth(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_days`,
        {
          method: 'POST',
          body: JSON.stringify(prayerDaysData),
        }
      );

      if (!daysResponse.ok) {
        const errorData = await daysResponse.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create prayer days');
      }

      Alert.alert(
        'Success',
        'Your prayer plan has been created!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating prayer plan:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create prayer plan. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreatePlan) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Create Prayer Plan',
            headerShown: true,
            headerBackVisible: true,
          }}
        />
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            Only organizers and admins can create prayer plans.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Prayer Plan',
          headerShown: true,
          headerBackVisible: true,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter prayer plan title"
              placeholderTextColor={Colors.light.textLight}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your prayer plan"
              placeholderTextColor={Colors.light.textLight}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput
              style={styles.textInput}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Gratitude, Healing, Guidance"
              placeholderTextColor={Colors.light.textLight}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration: {duration} days</Text>
            <Text style={styles.inputHint}>Duration will automatically adjust as you add/remove prayer days</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Visibility</Text>
            <View style={styles.visibilityOptions}>
              <TouchableOpacity
                style={[styles.visibilityOption, isPublic && styles.visibilityOptionActive]}
                onPress={() => setIsPublic(true)}
              >
                <Text style={[styles.visibilityOptionText, isPublic && styles.visibilityOptionTextActive]}>
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.visibilityOption, !isPublic && styles.visibilityOptionActive]}
                onPress={() => setIsPublic(false)}
              >
                <Text style={[styles.visibilityOptionText, !isPublic && styles.visibilityOptionTextActive]}>
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags (Optional)</Text>
          
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.textInput, styles.tagInput]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add a tag"
              placeholderTextColor={Colors.light.textLight}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Plus size={20} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
          
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Minus size={14} color={Colors.light.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Prayer Days */}
        <View style={styles.section}>
          <View style={styles.prayerDaysHeader}>
            <Text style={styles.sectionTitle}>Prayer Days ({prayers.length})</Text>
            <TouchableOpacity style={styles.addDayButton} onPress={addPrayerDay}>
              <Plus size={20} color={Colors.light.white} />
              <Text style={styles.addDayButtonText}>Add Day</Text>
            </TouchableOpacity>
          </View>
          
          {prayers.map((prayer, index) => (
            <View key={index} style={styles.prayerDayCard}>
              <View style={styles.prayerDayHeader}>
                <Text style={styles.prayerDayTitle}>Day {prayer.day}</Text>
                {prayers.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeDayButton}
                    onPress={() => removePrayerDay(index)}
                  >
                    <Minus size={16} color="#F44336" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={prayer.title}
                  onChangeText={(value) => updatePrayerDay(index, 'title', value)}
                  placeholder="Day title"
                  placeholderTextColor={Colors.light.textLight}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prayer *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={prayer.prayer}
                  onChangeText={(value) => updatePrayerDay(index, 'prayer', value)}
                  placeholder="Prayer content"
                  placeholderTextColor={Colors.light.textLight}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Scripture Reference (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={prayer.scripture || ''}
                  onChangeText={(value) => updatePrayerDay(index, 'scripture', value)}
                  placeholder="e.g., John 3:16"
                  placeholderTextColor={Colors.light.textLight}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reflection Prompt (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={prayer.reflection || ''}
                  onChangeText={(value) => updatePrayerDay(index, 'reflection', value)}
                  placeholder="Reflection question or prompt"
                  placeholderTextColor={Colors.light.textLight}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.light.white} />
            ) : (
              <>
                <Save size={20} color={Colors.light.white} />
                <Text style={styles.submitButtonText}>Create Prayer Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  submitSection: {
    padding: theme.spacing.lg,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  visibilityOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  visibilityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textMedium,
  },
  visibilityOptionTextActive: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '20',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  prayerDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  addDayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.white,
  },
  prayerDayCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  prayerDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  prayerDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  removeDayButton: {
    padding: theme.spacing.xs,
  },
  bottomSpacing: {
    height: 120,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
});