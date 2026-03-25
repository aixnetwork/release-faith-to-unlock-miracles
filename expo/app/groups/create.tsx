import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { Stack, router } from 'expo-router';
import { Users, Lock, Globe, Hash, MessageCircle, TrendingUp, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import BottomNavigation from '@/components/BottomNavigation';

interface GroupCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

export default function CreateGroupScreen() {
  const { plan, isLoggedIn } = useUserStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasGroupAccess = plan && ['org_small', 'org_medium', 'org_large'].includes(plan);

  const categories: GroupCategory[] = [
    {
      id: 'prayer',
      name: 'Prayer',
      icon: MessageCircle,
      color: Colors.light.primary,
      description: 'Prayer requests, intercession, and spiritual support',
    },
    {
      id: 'bible-study',
      name: 'Bible Study',
      icon: Hash,
      color: Colors.light.secondary,
      description: 'Scripture study, theological discussions, and learning',
    },
    {
      id: 'youth',
      name: 'Youth',
      icon: Users,
      color: Colors.light.success,
      description: 'Young adults, teens, and youth ministry activities',
    },
    {
      id: 'worship',
      name: 'Worship',
      icon: TrendingUp,
      color: Colors.light.warning,
      description: 'Music ministry, worship team, and praise discussions',
    },
    {
      id: 'fellowship',
      name: 'Fellowship',
      icon: Users,
      color: Colors.light.error,
      description: 'Community building, social events, and relationships',
    },
    {
      id: 'ministry',
      name: 'Ministry',
      icon: Globe,
      color: '#8B5CF6',
      description: 'Outreach, missions, and ministry coordination',
    },
  ];

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase())) {
      if (tags.length >= 5) {
        Alert.alert('Tag Limit', 'You can add up to 5 tags only.');
        return;
      }
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreateGroup = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to create group discussions.');
      return;
    }

    if (!hasGroupAccess) {
      Alert.alert(
        'Upgrade Required',
        'Creating group discussions requires a church plan. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/membership') },
        ]
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a group title.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter a group description.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Group Created!',
        `Your group "${title}" has been created successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              // In a real app, navigate to the new group
              // router.push(`/groups/${newGroupId}`);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasGroupAccess) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Create Group',
          }}
        />
        
        <View style={styles.upgradeContainer}>
          <LinearGradient
            colors={[Colors.light.warning + '20', Colors.light.warning + '10'] as const}
            style={styles.upgradeCard}
          >
            <Users size={64} color={Colors.light.warning} />
            <Text style={styles.upgradeTitle}>Upgrade to Create Groups</Text>
            <Text style={styles.upgradeDescription}>
              Group discussions are available with church plans. Create meaningful spaces for your community to connect and grow together.
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/membership')}
            >
              <Text style={styles.upgradeButtonText}>View Church Plans</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Group',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={isLoading}
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            >
              <Text style={[styles.createButtonText, isLoading && styles.createButtonTextDisabled]}>
                {isLoading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark] as const}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Create New Group</Text>
          <Text style={styles.headerSubtitle}>
            Build a community space for meaningful discussions
          </Text>
        </LinearGradient>

        <View style={styles.form}>
          {/* Group Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter group title..."
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              placeholderTextColor={Colors.light.textMedium}
            />
            <Text style={styles.characterCount}>{title.length}/50</Text>
          </View>

          {/* Group Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe what this group is about..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
              placeholderTextColor={Colors.light.textMedium}
            />
            <Text style={styles.characterCount}>{description.length}/200</Text>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category *</Text>
            <Text style={styles.sectionDescription}>
              Choose the category that best describes your group
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.selectedCategoryCard,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? Colors.light.white : category.color}
                    />
                    <Text style={[
                      styles.categoryName,
                      isSelected && styles.selectedCategoryName
                    ]}>
                      {category.name}
                    </Text>
                    <Text style={[
                      styles.categoryDescription,
                      isSelected && styles.selectedCategoryDescription
                    ]}>
                      {category.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <View style={styles.privacyCard}>
              <View style={styles.privacyOption}>
                <View style={styles.privacyInfo}>
                  <View style={styles.privacyHeader}>
                    {isPrivate ? (
                      <Lock size={20} color={Colors.light.error} />
                    ) : (
                      <Globe size={20} color={Colors.light.success} />
                    )}
                    <Text style={styles.privacyTitle}>
                      {isPrivate ? 'Private Group' : 'Public Group'}
                    </Text>
                  </View>
                  <Text style={styles.privacyDescription}>
                    {isPrivate
                      ? 'Only invited members can see and join this group'
                      : 'Anyone in your organization can discover and join this group'
                    }
                  </Text>
                </View>
                <Switch
                  value={isPrivate}
                  onValueChange={setIsPrivate}
                  trackColor={{ false: Colors.light.border, true: Colors.light.error }}
                  thumbColor={isPrivate ? Colors.light.white : Colors.light.textLight}
                />
              </View>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Add tags to help people discover your group
            </Text>
            
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag..."
                value={currentTag}
                onChangeText={setCurrentTag}
                onSubmitEditing={handleAddTag}
                maxLength={20}
                placeholderTextColor={Colors.light.textMedium}
              />
              <TouchableOpacity
                style={[styles.addTagButton, !currentTag.trim() && styles.addTagButtonDisabled]}
                onPress={handleAddTag}
                disabled={!currentTag.trim()}
              >
                <Text style={styles.addTagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveTag(tag)}
                      style={styles.removeTagButton}
                    >
                      <X size={14} color={Colors.light.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Guidelines */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
            <View style={styles.guidelinesCard}>
              <Text style={styles.guidelinesText}>
                By creating this group, you agree to maintain a respectful and supportive environment that aligns with our community values:
              </Text>
              <View style={styles.guidelinesList}>
                <Text style={styles.guidelineItem}>• Foster meaningful spiritual discussions</Text>
                <Text style={styles.guidelineItem}>• Respect different perspectives and backgrounds</Text>
                <Text style={styles.guidelineItem}>• Keep conversations appropriate and uplifting</Text>
                <Text style={styles.guidelineItem}>• Support and encourage fellow members</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  createButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  createButtonTextDisabled: {
    color: Colors.light.textMedium,
  },
  upgradeContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  upgradeCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.white,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  form: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'right',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  selectedCategoryCard: {
    backgroundColor: Colors.light.primary,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: Colors.light.white,
  },
  categoryDescription: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedCategoryDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  privacyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  privacyDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addTagButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: Colors.light.textLight,
  },
  addTagButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  removeTagButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelinesCard: {
    backgroundColor: Colors.light.success + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.success + '30',
  },
  guidelinesText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  guidelinesList: {
    gap: theme.spacing.sm,
  },
  guidelineItem: {
    fontSize: 14,
    color: Colors.light.success,
    fontWeight: '500' as const,
  },
});